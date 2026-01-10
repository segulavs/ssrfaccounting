"""Check user and test password verification"""
from database import SessionLocal
from models import User
from auth import verify_password, get_password_hash

db = SessionLocal()
try:
    user = db.query(User).filter(User.email == 'admin@ssrf.local').first()
    if user:
        print(f"User found: {user.email}")
        print(f"Is Admin: {user.is_admin}")
        print(f"Is Active: {user.is_active}")
        print(f"Password hash exists: {bool(user.hashed_password)}")
        
        # Test password verification
        test_password = "admin123"
        is_valid = verify_password(test_password, user.hashed_password)
        print(f"Password 'admin123' is valid: {is_valid}")
        
        # If password doesn't work, let's update it
        if not is_valid:
            print("\nPassword verification failed. Updating password...")
            user.hashed_password = get_password_hash(test_password)
            db.commit()
            print("Password updated successfully!")
            
            # Verify again
            is_valid = verify_password(test_password, user.hashed_password)
            print(f"Password 'admin123' is now valid: {is_valid}")
    else:
        print("User not found!")
finally:
    db.close()
