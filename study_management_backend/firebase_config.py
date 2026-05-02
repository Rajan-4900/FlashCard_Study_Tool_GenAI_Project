import firebase_admin
from firebase_admin import credentials, firestore
import json
import os

# 🔒 SECURITY PATCH: Use Environment Variable for Production (Render)
# Falls back to local 'firebase_key.json' for development
firebase_creds_json = os.getenv('FIREBASE_CREDENTIALS')

if firebase_creds_json:
    # Use the JSON string from Environment Variable
    creds_dict = json.loads(firebase_creds_json)
    cred = credentials.Certificate(creds_dict)
else:
    # Fallback to local file
    try:
        cred = credentials.Certificate("firebase_key.json")
    except Exception as e:
        print(f"Error: Could not find firebase_key.json or FIREBASE_CREDENTIALS env var. {e}")
        raise e

if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)

db = firestore.client()