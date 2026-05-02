from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.sql import func
from datetime import datetime
from models import db
from models.flashcard import Flashcard
from models.study_progress import StudyProgress
from models.session_progress import SessionProgress

study_bp = Blueprint('study', __name__, url_prefix='/api/study')

@study_bp.route('/random', methods=['GET'])
@jwt_required()
def get_random_card():
    current_user_id = int(get_jwt_identity())
    
    # Get a random flashcard for the user
    # using order_by(func.random()) in SQLAlchemy
    random_card = Flashcard.query.filter_by(user_id=current_user_id).order_by(func.random()).first()
    
    if not random_card:
        return jsonify({'error': 'No flashcards found for user'}), 404
        
    return jsonify({'card': random_card.to_dict()}), 200

@study_bp.route('/progress', methods=['POST'])
@jwt_required()
def record_progress():
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('card_id') or not data.get('status'):
        return jsonify({'error': 'card_id and status are required'}), 400
        
    card_id = data.get('card_id')
    status = data.get('status')
    
    if status not in ['got_it', 'try_again']:
        return jsonify({'error': "Status must be 'got_it' or 'try_again'"}), 400
        
    # Check if the flashcard exists and belongs to the user
    card = Flashcard.query.filter_by(id=card_id, user_id=current_user_id).first()
    if not card:
        return jsonify({'error': 'Flashcard not found or access denied'}), 404
        
    # Check if progress already exists for this card
    progress = StudyProgress.query.filter_by(user_id=current_user_id, card_id=card_id).first()
    
    if progress:
        # Update existing progress
        progress.status = status
    else:
        # Create new progress
        progress = StudyProgress(user_id=current_user_id, card_id=card_id, status=status)
        db.session.add(progress)
        
    try:
        db.session.commit()
        return jsonify({'message': 'Progress recorded successfully', 'progress': progress.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500


@study_bp.route('/session', methods=['POST'])
@jwt_required()
def save_session_progress():
    """
    Persist a completed Study Mode session summary.

    Expected payload:
      total_questions, correct_answers, wrong_answers, score_percentage
    """
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    required = ['total_questions', 'correct_answers', 'wrong_answers', 'score_percentage']
    missing = [k for k in required if data.get(k) is None]
    if missing:
        return jsonify({'error': f"Missing fields: {', '.join(missing)}"}), 400

    try:
        total = int(data.get('total_questions'))
        correct = int(data.get('correct_answers'))
        wrong = int(data.get('wrong_answers'))
        pct = float(data.get('score_percentage'))
    except Exception:
        return jsonify({'error': 'Invalid numeric values provided'}), 400

    if total < 0 or correct < 0 or wrong < 0:
        return jsonify({'error': 'Counts must be non-negative'}), 400
    if correct + wrong > total:
        return jsonify({'error': 'correct + wrong cannot exceed total_questions'}), 400
    if pct < 0 or pct > 100:
        return jsonify({'error': 'score_percentage must be between 0 and 100'}), 400

    progress = SessionProgress(
        user_id=current_user_id,
        total_questions=total,
        correct_answers=correct,
        wrong_answers=wrong,
        score_percentage=pct,
        completed_at=datetime.utcnow(),
    )

    try:
        db.session.add(progress)
        db.session.commit()
        return jsonify({'message': 'Session progress saved', 'progress': progress.to_dict()}), 201
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500
