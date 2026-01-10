"""Test token validation with fresh token"""
import requests
from jose import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# First, login to get a fresh token
login_url = "http://localhost:8000/api/portfolio/auth/login"
login_data = {
    "username": "admin@ssrf.local",
    "password": "admin123"
}

print("1. Logging in to get fresh token...")
response = requests.post(login_url, data=login_data)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"   ✅ Token received: {token[:50]}...")
    
    # Decode the token to see what's inside
    print("\n2. Decoding token...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"   ✅ Payload decoded: {payload}")
        user_id = payload.get("sub")
        print(f"   User ID (sub): {user_id} (type: {type(user_id).__name__})")
    except Exception as e:
        print(f"   ❌ Error decoding: {e}")
        import traceback
        traceback.print_exc()
        exit(1)
    
    # Test the /me endpoint
    print("\n3. Testing /auth/me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get("http://localhost:8000/api/portfolio/auth/me", headers=headers)
    print(f"   Status: {me_response.status_code}")
    
    if me_response.status_code == 200:
        user_info = me_response.json()
        print(f"   ✅ Success! User info: {user_info.get('email')}")
        print(f"   Is Admin: {user_info.get('is_admin')}")
    else:
        print(f"   ❌ Failed: {me_response.text}")
else:
    print(f"   ❌ Login failed: {response.text}")
