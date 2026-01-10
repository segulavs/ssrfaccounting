"""Test login function directly"""
from database import SessionLocal
from models import User
from auth import verify_password

# Test the login logic directly
db = SessionLocal()
try:
    username = "admin@ssrf.local"
    password = "admin123"
    
    print(f"Looking for user: {username}")
    user = db.query(User).filter(User.email == username).first()
    
    if not user:
        print("❌ User not found!")
    else:
        print(f"✅ User found: {user.email}")
        print(f"   Is Admin: {user.is_admin}")
        print(f"   Is Active: {user.is_active}")
        
        print(f"\nVerifying password...")
        is_valid = verify_password(password, user.hashed_password)
        print(f"Password valid: {is_valid}")
        
        if is_valid and user.is_active:
            print("\n✅ Login should work!")
        else:
            print("\n❌ Login would fail:")
            if not is_valid:
                print("  - Password is incorrect")
            if not user.is_active:
                print("  - User is not active")
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
