from . import db, bcrypt

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student') # 'admin' or 'student'
    name = db.Column(db.String(120), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    profile_image = db.Column(db.Text, nullable=True)
    college = db.Column(db.String(200), nullable=True)
    semester = db.Column(db.String(50), nullable=True)
    year = db.Column(db.String(50), nullable=True)
    college_address = db.Column(db.Text, nullable=True)
    
    
    # Relationships
    flashcards = db.relationship('Flashcard', backref='user', lazy=True, cascade="all, delete-orphan")
    study_progress = db.relationship('StudyProgress', backref='user', lazy=True, cascade="all, delete-orphan")
    session_progress = db.relationship('SessionProgress', backref='user', lazy=True, cascade="all, delete-orphan")

    def set_password(self, plain_password):
        """Hash the password before saving."""
        self.password = bcrypt.generate_password_hash(plain_password).decode('utf-8')

    def check_password(self, plain_password):
        """Check the hashed password."""
        return bcrypt.check_password_hash(self.password, plain_password)

    def to_dict(self):
        """Return a dictionary representation of the user."""
        return {
            'id': self.id,
            'username': self.username,
            'role': self.role,
            'name': getattr(self, 'name', ''),
            'email': getattr(self, 'email', ''),
            'phone': getattr(self, 'phone', ''),
            'profile_image': getattr(self, 'profile_image', ''),
            'college': getattr(self, 'college', ''),
            'semester': getattr(self, 'semester', ''),
            'year': getattr(self, 'year', ''),
            'college_address': getattr(self, 'college_address', '')
        }
