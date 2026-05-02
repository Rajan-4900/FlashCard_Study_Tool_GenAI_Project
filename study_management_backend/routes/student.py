from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from firebase_config import db

student_bp = Blueprint('student', __name__, url_prefix='/api')


@student_bp.route('/cards', methods=['POST'])
@jwt_required()
def create_card():
    current_user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('question') or not data.get('answer'):
        return jsonify({'error': 'Question and answer are required'}), 400

    category = (data.get('category') or 'General').strip() or 'General'

    new_card = {
        "user_id": current_user_id,
        "question": data.get('question'),
        "answer": data.get('answer'),
        "category": category
    }

    doc_ref = db.collection("flashcards").add(new_card)
    card_id = doc_ref[1].id
    new_card["id"] = card_id

    return jsonify({'message': 'Flashcard created', 'card': new_card}), 201


@student_bp.route('/cards', methods=['GET'])
@jwt_required()
def get_cards():
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    current_role = claims.get("role")

    # 🔥 Re-adding the missing category definition
    category = (request.args.get('category') or '').strip()

    # 🔥 Step 1: Fetch users to map IDs to Names/Roles
    users_stream = db.collection("users").stream()
    user_map = {}
    role_map = {}
    for user in users_stream:
        udata = user.to_dict()
        user_map[str(user.id)] = udata.get("username", "Student")
        role_map[str(user.id)] = udata.get("role", "student")

    # 🔥 Step 2: Fetch flashcards
    cards_stream = db.collection("flashcards").stream()
    all_cards = []

    for card in cards_stream:
        card_data = card.to_dict()
        if not card_data:
            continue
            
        card_data["id"] = card.id
        
        # Get user_id safely
        raw_user_id = card_data.get("user_id")
        user_id = str(raw_user_id) if raw_user_id else "None"
        
        card_data["owner_username"] = user_map.get(user_id, "Student")
        card_data["owner_role"] = role_map.get(user_id, "student")

        # Admin sees all, students see own + admin cards
        if current_role != "admin":
            if user_id != str(current_user_id) and card_data["owner_role"] != "admin":
                continue

        if category and card_data.get("category", "").lower() != category.lower():
            continue

        all_cards.append(card_data)

    return jsonify({'cards': all_cards}), 200


@student_bp.route('/cards/<card_id>', methods=['PUT'])
@jwt_required()
def update_card(card_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()

    card_ref = db.collection("flashcards").document(card_id)
    card_doc = card_ref.get()

    if not card_doc.exists:
        return jsonify({'error': 'Flashcard not found'}), 404

    card_data = card_doc.to_dict()

    if card_data.get("user_id") != current_user_id:
        return jsonify({'error': 'Access denied: you can only edit your own flashcards'}), 403

    updated_data = {}

    if data.get('question'):
        updated_data["question"] = data.get('question')

    if data.get('answer'):
        updated_data["answer"] = data.get('answer')

    if data.get('category') is not None:
        updated_data["category"] = (data.get('category') or 'General').strip() or 'General'

    card_ref.update(updated_data)

    card_data.update(updated_data)
    card_data["id"] = card_id

    return jsonify({'message': 'Flashcard updated', 'card': card_data}), 200


@student_bp.route('/cards/<card_id>', methods=['DELETE'])
@jwt_required()
def delete_card(card_id):
    current_user_id = get_jwt_identity()
    claims = get_jwt()
    current_role = claims.get("role")

    card_ref = db.collection("flashcards").document(card_id)
    card_doc = card_ref.get()

    if not card_doc.exists:
        return jsonify({'error': 'Flashcard not found'}), 404

    card_data = card_doc.to_dict()

    if card_data.get("user_id") != current_user_id and current_role != "admin":
        return jsonify({'error': 'Access denied: you can only delete your own flashcards'}), 403

    card_ref.delete()

    return jsonify({'message': 'Flashcard deleted successfully'}), 200