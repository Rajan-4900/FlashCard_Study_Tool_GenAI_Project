from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from firebase_config import db
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data.get('username')
    password = data.get('password')
    role = 'student'

    if username.lower() == 'admin':
        return jsonify({'error': 'Username reserved'}), 409

    # Check existing user in Firebase
    users = db.collection("users").where("username", "==", username).stream()
    for user in users:
        return jsonify({'error': 'Username already exists'}), 409

    hashed_password = generate_password_hash(password)

    new_user = {
        "username": username,
        "password": hashed_password,
        "role": role
    }

    doc_ref = db.collection("users").add(new_user)
    user_id = doc_ref[1].id

    new_user["id"] = user_id
    del new_user["password"]

    return jsonify({
        'message': 'User registered successfully',
        'user': new_user
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    username = data.get('username')
    password = data.get('password')

    # Admin fixed login
    if username == "Admin" and password == "Admin":
        users = db.collection("users").where("username", "==", "Admin").stream()
        admin_doc = None

        for user in users:
            admin_doc = user

        if not admin_doc:
            admin_data = {
                "username": "Admin",
                "password": generate_password_hash("Admin"),
                "role": "admin"
            }
            doc_ref = db.collection("users").add(admin_data)
            admin_id = doc_ref[1].id
        else:
            admin_id = admin_doc.id

        access_token = create_access_token(identity=str(admin_id), additional_claims={'role': 'admin'})

        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                "id": admin_id,
                "username": "Admin",
                "role": "admin"
            }
        }), 200

    # Find normal user
    users = db.collection("users").where("username", "==", username).stream()
    found_user = None

    for user in users:
        found_user = user

    if found_user:
        user_data = found_user.to_dict()

        if check_password_hash(user_data["password"], password):
            access_token = create_access_token(
                identity=str(found_user.id),
                additional_claims={'role': user_data["role"]}
            )

            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': {
                    "id": found_user.id,
                    "username": user_data["username"],
                    "role": user_data["role"]
                }
            }), 200

    return jsonify({'error': 'Invalid username or password'}), 401