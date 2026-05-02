from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db
from models.user import User

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

@profile_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def manage_profile():
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if request.method == 'GET':
        return jsonify({'user': user.to_dict()}), 200

    if request.method == 'PUT':
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'email' in data:
            # Check if email is already taken by another user
            existing = User.query.filter(User.email == data['email'], User.id != user.id).first()
            if existing:
                return jsonify({'error': 'Email is already in use by another account.'}), 400
            user.email = data['email']
        if 'phone' in data:
            user.phone = data['phone']
        if 'profile_image' in data:
            user.profile_image = data['profile_image']
        if 'college' in data:
            user.college = data['college']
        if 'semester' in data:
            user.semester = data['semester']
        if 'year' in data:
            user.year = data['year']
        if 'college_address' in data:
            user.college_address = data['college_address']

        try:
            db.session.commit()
            return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': 'Internal server error'}), 500
