from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from models import db
from models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Input validation
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
        
    username = data.get('username')
    password = data.get('password')
    role = 'student' # Force all new registrations to be students
    
    if username.lower() == 'admin':
        return jsonify({'error': 'Username reserved'}), 409
    
    # Check if user exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 409
        
    # Create new user
    new_user = User(username=username, role=role)
    new_user.set_password(password)
    
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Input validation
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    # Hardcoded admin login logic
    if username == "Admin" and password == "Admin":
        admin_user = User.query.filter_by(username="Admin").first()
        if not admin_user:
            admin_user = User(username="Admin", role="admin")
            admin_user.set_password("Admin")
            db.session.add(admin_user)
            db.session.commit()
            
        access_token = create_access_token(identity=str(admin_user.id), additional_claims={'role': 'admin'})
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': admin_user.to_dict()
        }), 200

    # Find user
    user = User.query.filter_by(username=username).first()
    
    # Check password
    if user and user.check_password(password):
        # Prevent any other admin user from logging in
        if user.role == 'admin' and user.username != "Admin":
            return jsonify({'error': 'Invalid username or password'}), 401
            
        # Create JWT token
        # You can also pass additional claims like user role
        access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': user.to_dict()
        }), 200
        
    return jsonify({'error': 'Invalid username or password'}), 401
