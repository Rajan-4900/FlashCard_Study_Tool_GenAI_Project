from firebase_config import db

doc_ref = db.collection("test").add({
    "message": "Firebase Connected Successfully"
})

print("Firebase connected and test data inserted")