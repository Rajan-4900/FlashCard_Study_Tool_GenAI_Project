from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from firebase_config import db
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/api')


def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') != 'admin':
                return jsonify({'error': 'Admins only!'}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper


@admin_bp.route('/users', methods=['GET'])
@admin_required()
def get_all_users():
    users_stream = db.collection("users").stream()
    users = []

    for user in users_stream:
        user_data = user.to_dict()
        user_data["id"] = user.id
        user_data.pop("password", None)
        users.append(user_data)

    return jsonify({'users': users}), 200


@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404

    # delete user's flashcards too
    cards = db.collection("flashcards").where("user_id", "==", user_id).stream()
    for card in cards:
        db.collection("flashcards").document(card.id).delete()

    user_ref.delete()

    return jsonify({'message': f'User {user_id} and their flashcards deleted successfully'}), 200


@admin_bp.route('/cards/all', methods=['GET'])
@admin_required()
def get_all_cards():

    # 🔥 Step 1: Fetch users
    users_stream = db.collection("users").stream()

    user_map = {}
    role_map = {}

    for user in users_stream:
        data = user.to_dict()
        username = data.get("username", "Unknown")
        role = data.get("role", "student")
        
        # normalize ID
        user_map[str(user.id)] = username
        role_map[str(user.id)] = role

    # 🔥 Step 2: Fetch flashcards
    cards_stream = db.collection("flashcards").stream()
    cards = []

    for card in cards_stream:
        card_data = card.to_dict()
        if not card_data:
            continue
            
        card_data["id"] = card.id

        # Get user_id safely
        raw_user_id = card_data.get("user_id")
        user_id = str(raw_user_id) if raw_user_id else "None"

        # 🔥 Map the fields the Frontend expects
        card_data["owner_username"] = user_map.get(user_id, "Unknown")
        card_data["owner_role"] = role_map.get(user_id, "student")

        cards.append(card_data)

    return jsonify({'cards': cards}), 200


@admin_bp.route('/progress/sessions', methods=['GET'])
@admin_required()
def get_session_progress():
    # 🔥 Step 1: Fetch users for mapping (Aggressive Match)
    users_stream = db.collection("users").stream()
    user_map = {}
    for user in users_stream:
        udata = user.to_dict()
        uid = str(user.id).strip()
        uname = udata.get("username") or udata.get("name") or "Student"
        user_map[uid] = uname

    # 🔥 Step 2: Fetch sessions
    sessions_stream = db.collection("study_sessions").stream()
    sessions = []

    for session in sessions_stream:
        session_data = session.to_dict()
        session_data["id"] = session.id
        
        # Get user_id safely and clean it
        raw_user_id = session_data.get("user_id")
        user_id = str(raw_user_id).strip() if raw_user_id else "None"
        
        # 🔥 Step 3: Determine Username
        # 1. Use the name saved inside the session (if it exists)
        # 2. Otherwise, look it up in the live user_map
        # 3. Otherwise, show a nice fallback
        persisted_name = session_data.get("username")
        live_name = user_map.get(user_id)
        
        session_data["username"] = persisted_name or live_name or f"Student ({user_id[:5]})"
        session_data["user_id"] = user_id
        
        sessions.append(session_data)

    return jsonify({'sessions': sessions}), 200