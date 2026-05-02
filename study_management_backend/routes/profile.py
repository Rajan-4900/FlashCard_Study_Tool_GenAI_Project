from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from firebase_config import db

profile_bp = Blueprint('profile', __name__, url_prefix='/api')


@profile_bp.route('/profile', methods=['GET', 'PUT'])
@jwt_required()
def manage_profile():
    current_user_id = get_jwt_identity()

    user_ref = db.collection("users").document(current_user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        return jsonify({'error': 'User not found'}), 404

    user_data = user_doc.to_dict()
    user_data["id"] = user_doc.id

    if request.method == 'GET':
        # never expose password
        user_data.pop("password", None)
        return jsonify({'user': user_data}), 200

    if request.method == 'PUT':
        data = request.get_json()
        update_data = {}

        # email uniqueness check
        if 'email' in data:
            existing_users = db.collection("users").where("email", "==", data['email']).stream()
            for existing in existing_users:
                if existing.id != current_user_id:
                    return jsonify({'error': 'Email is already in use by another account.'}), 400
            update_data["email"] = data["email"]

        if 'name' in data:
            update_data["name"] = data["name"]

        if 'phone' in data:
            update_data["phone"] = data["phone"]

        if 'profile_image' in data:
            update_data["profile_image"] = data["profile_image"]

        if 'college' in data:
            update_data["college"] = data["college"]

        if 'semester' in data:
            update_data["semester"] = data["semester"]

        if 'year' in data:
            update_data["year"] = data["year"]

        if 'college_address' in data:
            update_data["college_address"] = data["college_address"]

        user_ref.update(update_data)

        user_data.update(update_data)
        user_data.pop("password", None)

        return jsonify({
            'message': 'Profile updated successfully',
            'user': user_data
        }), 200