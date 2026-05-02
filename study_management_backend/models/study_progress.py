from . import db

class StudyProgress(db.Model):
    __tablename__ = 'study_progress'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    card_id = db.Column(db.Integer, db.ForeignKey('flashcards.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False) # 'got_it' or 'try_again'

    def to_dict(self):
        """Return a dictionary representation of the study progress."""
        return {
            'id': self.id,
            'user_id': self.user_id,
            'card_id': self.card_id,
            'status': self.status
        }
