from flask import Flask, jsonify
from config.settings import Config
from models import db, bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Allow the React dev server (and other origins) to call this API from the browser.
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    # Custom JWT error handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'authorization_required',
            'message': 'Request does not contain an access token.'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'invalid_token',
            'message': 'Signature verification failed.'
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'token_expired',
            'message': 'The token has expired.'
        }), 401

    from routes.auth import auth_bp
    from routes.student import student_bp
    from routes.admin import admin_bp
    from routes.study import study_bp
    from routes.profile import profile_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(student_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(study_bp)
    app.register_blueprint(profile_bp)

    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        
        # Ensure category column exists in flashcards
        from sqlalchemy import text
        try:
            db.session.execute(text("ALTER TABLE flashcards ADD COLUMN category VARCHAR(80) NOT NULL DEFAULT 'General'"))
            db.session.commit()
        except Exception:
            db.session.rollback()

        try:
            db.session.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR(120)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN email VARCHAR(120)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN phone VARCHAR(20)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN profile_image TEXT"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN college VARCHAR(200)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN semester VARCHAR(50)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN year VARCHAR(50)"))
            db.session.execute(text("ALTER TABLE users ADD COLUMN college_address TEXT"))
            db.session.commit()
        except Exception:
            db.session.rollback()

    # Basic root route
    @app.route('/', methods=['GET'])
    def index():
        return jsonify({'message': 'Welcome to the Study Management System API'})

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, host='0.0.0.0', port=5000)
