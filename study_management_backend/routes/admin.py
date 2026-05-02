from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from models import db
from models.user import User
from models.flashcard import Flashcard
from models.session_progress import SessionProgress
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
    users = User.query.all()
    return jsonify({'users': [user.to_dict() for user in users]}), 200

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@admin_required()
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message': f'User {user_id} and their flashcards deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@admin_bp.route('/cards/all', methods=['GET'])
@admin_required()
def get_all_cards():
    cards = Flashcard.query.all()
    return jsonify({'cards': [card.to_dict() for card in cards]}), 200


@admin_bp.route('/progress/sessions', methods=['GET'])
@admin_required()
def get_session_progress():
    """
    Returns recent study session summaries for admin dashboard.
    """
    sessions = (
        SessionProgress.query.join(User)
        .order_by(SessionProgress.completed_at.desc())
        .limit(200)
        .all()
    )

    return jsonify({
        'sessions': [
            {
                **s.to_dict(),
                'username': s.user.username if s.user else None,
                'role': s.user.role if s.user else None,
                'status': 'completed',
            }
            for s in sessions
            # Optional: hide admin rows to focus on students
            if not s.user or s.user.role != 'admin'
        ]
    }), 200
