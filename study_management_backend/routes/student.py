from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import or_
from models import db
from models.flashcard import Flashcard
from models.user import User

student_bp = Blueprint('student', __name__, url_prefix='/api')

@student_bp.route('/cards', methods=['POST'])
@jwt_required()
def create_card():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('question') or not data.get('answer'):
        return jsonify({'error': 'Question and answer are required'}), 400
        
    category = (data.get('category') or 'General').strip() or 'General'

    new_card = Flashcard(
        user_id=current_user_id,
        question=data.get('question'),
        answer=data.get('answer'),
        category=category,
    )
    
    try:
        db.session.add(new_card)
        db.session.commit()
        return jsonify({'message': 'Flashcard created', 'card': new_card.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

@student_bp.route('/cards', methods=['GET'])
@jwt_required()
def get_cards():
    current_user_id = int(get_jwt_identity())
    category = (request.args.get('category') or '').strip()
    user = User.query.get(current_user_id)
    if user and user.role == 'admin':
        query = Flashcard.query
    else:
        # Students should see:
        # - their own cards
        # - admin-created cards (shared with everyone)
        query = (
            Flashcard.query.join(User)
            .filter(or_(Flashcard.user_id == current_user_id, User.role == 'admin'))
        )
    if category:
        query = query.filter(Flashcard.category.ilike(category))
    cards = query.all()
    return jsonify({'cards': [card.to_dict() for card in cards]}), 200

@student_bp.route('/cards/<int:card_id>', methods=['PUT'])
@jwt_required()
def update_card(card_id):
    current_user_id = int(get_jwt_identity())
    data = request.get_json()

    card = Flashcard.query.get(card_id)
    if not card:
        return jsonify({'error': 'Flashcard not found'}), 404

    # Prevent editing shared admin cards (or any card not owned by the user).
    if card.user_id != current_user_id:
        return jsonify({'error': 'Access denied: you can only edit your own flashcards'}), 403
        
    if data.get('question'):
        card.question = data.get('question')
    if data.get('answer'):
        card.answer = data.get('answer')
    if data.get('category') is not None:
        category = (data.get('category') or 'General').strip() or 'General'
        card.category = category
        
    try:
        db.session.commit()
        return jsonify({'message': 'Flashcard updated', 'card': card.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@student_bp.route('/cards/<int:card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    current_user_id = int(get_jwt_identity())
    
    card = Flashcard.query.get(card_id)
    if not card:
        return jsonify({'error': 'Flashcard not found'}), 404

    # Allow deletion if the user is the owner OR if the user is an admin.
    current_user = User.query.get(current_user_id)
    is_admin = current_user and current_user.role == 'admin'

    if card.user_id != current_user_id and not is_admin:
        return jsonify({'error': 'Access denied: you can only delete your own flashcards'}), 403
        
    try:
        db.session.delete(card)
        db.session.commit()
        return jsonify({'message': 'Flashcard deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
