from datetime import datetime
from . import db


class SessionProgress(db.Model):
    """
    Stores one completed Study Mode session summary per user.
    """

    __tablename__ = 'session_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, index=True)

    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    wrong_answers = db.Column(db.Integer, nullable=False)
    score_percentage = db.Column(db.Float, nullable=False)

    completed_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, index=True)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'wrong_answers': self.wrong_answers,
            'score_percentage': self.score_percentage,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
        }

