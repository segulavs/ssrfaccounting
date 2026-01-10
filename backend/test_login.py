"""Test the login endpoint"""
import requests
import json

# Test login
url = "http://localhost:8000/api/portfolio/auth/login"
data = {
    "username": "admin@ssrf.local",
    "password": "admin123"
}

try:
    print(f"Testing login at: {url}")
    print(f"Data: {data}")
    response = requests.post(url, data=data, timeout=5)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Text: {response.text}")
    
    if response.status_code == 200:
        token_data = response.json()
        print(f"\n✅ Login successful!")
        print(f"Token: {token_data.get('access_token', '')[:50]}...")
        
        # Test getting user info
        headers = {"Authorization": f"Bearer {token_data.get('access_token')}"}
        me_response = requests.get("http://localhost:8000/api/portfolio/auth/me", headers=headers)
        print(f"\nUser Info Status: {me_response.status_code}")
        if me_response.status_code == 200:
            user_info = me_response.json()
            print(f"User: {user_info.get('email')}")
            print(f"Is Admin: {user_info.get('is_admin')}")
    else:
        print(f"\n❌ Login failed")
        try:
            error_detail = response.json()
            print(f"Error details: {json.dumps(error_detail, indent=2)}")
        except:
            print(f"Error text: {response.text}")
except requests.exceptions.ConnectionError as e:
    print("❌ Could not connect to server. Is the backend running?")
    print(f"Error: {e}")
    print("\nStart the backend server with:")
    print("  cd backend")
    print("  python main.py")
    print("\nOr with uvicorn:")
    print("  uvicorn main:app --reload")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
