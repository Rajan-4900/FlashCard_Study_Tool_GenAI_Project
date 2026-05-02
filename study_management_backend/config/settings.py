import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'super-secret-default-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-super-secret-key')