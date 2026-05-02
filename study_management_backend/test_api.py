import sys
import json
import urllib.request

base_url = 'http://127.0.0.1:5000/api'

def request(url, method='GET', data=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
        
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode('utf-8')
        
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())
    except Exception as e:
        return 0, str(e)

# 1. Register
print("Registering...")
status, body = request(f"{base_url}/register", 'POST', {'username': 'debug_user', 'password': '123'})
print(status, body)

# 2. Login
print("Logging in...")
status, body = request(f"{base_url}/login", 'POST', {'username': 'debug_user', 'password': '123'})
print(status, body)
token = body.get('access_token')

# 3. Create Card
print("Creating card...")
status, body = request(f"{base_url}/cards", 'POST', {'question': 'q1', 'answer': 'a1', 'category': 'test_cat'}, token=token)
print(status, body)

# 4. Get Cards
print("Getting cards...")
status, body = request(f"{base_url}/cards", 'GET', token=token)
print(status, body)
