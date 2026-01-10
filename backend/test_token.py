"""Test token validation"""
import requests
from jose import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"

# First, login to get a token
login_url = "http://localhost:8000/api/portfolio/auth/login"
login_data = {
    "username": "admin@ssrf.local",
    "password": "admin123"
}

print("1. Logging in...")
response = requests.post(login_url, data=login_data)
print(f"   Status: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    token = token_data.get("access_token")
    print(f"   Token received: {token[:50]}...")
    
    # Decode the token to see what's inside
    print("\n2. Decoding token...")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print(f"   Payload: {payload}")
        user_id = payload.get("sub")
        print(f"   User ID: {user_id}")
    except Exception as e:
        print(f"   Error decoding: {e}")
    
    # Test the /me endpoint
    print("\n3. Testing /auth/me endpoint...")
    headers = {"Authorization": f"Bearer {token}"}
    me_response = requests.get("http://localhost:8000/api/portfolio/auth/me", headers=headers)
    print(f"   Status: {me_response.status_code}")
    print(f"   Response: {me_response.text}")
    
    if me_response.status_code == 401:
        print("\n   ❌ Token validation failed!")
        print("   Checking if token is being sent correctly...")
        # Try with different header format
        headers2 = {"Authorization": f"bearer {token}"}
        me_response2 = requests.get("http://localhost:8000/api/portfolio/auth/me", headers=headers2)
        print(f"   Status with lowercase 'bearer': {me_response2.status_code}")
else:
    print(f"   ❌ Login failed: {response.text}")
