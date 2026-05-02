from . import db

class Flashcard(db.Model):
    __tablename__ = 'flashcards'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    answer = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(80), nullable=False, default='General')

    # Relationships
    study_progress = db.relationship('StudyProgress', backref='flashcard', lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        """Return a dictionary representation of the flashcard."""
        is_global = False
        owner_role = 'student'
        owner_username = None
        try:
            if self.user:
                owner_role = self.user.role
                owner_username = self.user.username
                is_global = (self.user.role == 'admin')
        except Exception:
            pass

        return {
            'id': self.id,
            'user_id': self.user_id,
            'owner_username': owner_username,
            'question': getattr(self, 'question', ''),
            'answer': getattr(self, 'answer', ''),
            'category': getattr(self, 'category', 'General'),
            'is_global': is_global,
            'owner_role': owner_role,
        }
