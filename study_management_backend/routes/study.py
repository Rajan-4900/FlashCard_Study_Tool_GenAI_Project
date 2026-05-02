from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from firebase_config import db
import random

study_bp = Blueprint('study', __name__, url_prefix='/api/study')

@study_bp.route('/random', methods=['GET'])
@jwt_required()
def get_random_card():
    current_user_id = get_jwt_identity()
    
    # Fetch all cards for the user (or admin cards) from Firestore
    cards_stream = db.collection("flashcards").where("user_id", "==", current_user_id).stream()
    all_cards = []
    for card in cards_stream:
        data = card.to_dict()
        data["id"] = card.id
        all_cards.append(data)
        
    if not all_cards:
        return jsonify({'error': 'No flashcards found. Create some cards first!'}), 404
        
    random_card = random.choice(all_cards)
    return jsonify({'card': random_card}), 200

@study_bp.route('/progress', methods=['POST'])
@jwt_required()
def record_progress():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('card_id') or not data.get('status'):
        return jsonify({'error': 'card_id and status are required'}), 400
        
    card_id = data.get('card_id')
    status = data.get('status') # 'got_it' or 'try_again'
    
    # Update progress in a dedicated collection
    progress_ref = db.collection("study_progress").document(f"{current_user_id}_{card_id}")
    progress_data = {
        "user_id": current_user_id,
        "card_id": card_id,
        "status": status,
        "updated_at": datetime.utcnow()
    }
    
    progress_ref.set(progress_data, merge=True)
    return jsonify({'message': 'Progress recorded', 'progress': progress_data}), 200


@study_bp.route('/session', methods=['POST'])
@jwt_required()
def save_session_progress():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}

    # 🔥 Fetch username to persist it in the session record
    user_doc = db.collection("users").document(current_user_id).get()
    username = "Student"
    if user_doc.exists:
        username = user_doc.to_dict().get("username", "Student")

    # Logic to save session summary
    session_data = {
        "user_id": current_user_id,
        "username": username, # Persist name so it survives user deletion
        "total_questions": data.get('total_questions'),
        "correct_answers": data.get('correct_answers'),
        "wrong_answers": data.get('wrong_answers'),
        "score_percentage": data.get('score_percentage'),
        "timestamp": datetime.utcnow()
    }

    db.collection("study_sessions").add(session_data)
    return jsonify({'message': 'Session progress saved'}), 201
