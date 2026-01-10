"""
Fix admin user password - ensure it's properly hashed
"""
from database import SessionLocal
from models import User
from auth import get_password_hash, verify_password

db = SessionLocal()
try:
    email = "admin@ssrf.local"
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        print(f"Found user: {user.email}")
        
        # Set a new password hash
        new_password = "admin123"
        print(f"Setting new password hash for: {new_password}")
        
        # Ensure password is not too long (bcrypt limit is 72 bytes)
        if len(new_password.encode('utf-8')) > 72:
            print("ERROR: Password is too long for bcrypt!")
            new_password = new_password[:72]
            print(f"Truncated to: {new_password}")
        
        user.hashed_password = get_password_hash(new_password)
        db.commit()
        
        print("✅ Password hash updated!")
        
        # Verify it works
        is_valid = verify_password(new_password, user.hashed_password)
        print(f"Verification test: {is_valid}")
        
        if is_valid:
            print("\n✅ Admin user is ready!")
            print(f"Email: {email}")
            print(f"Password: {new_password}")
        else:
            print("\n❌ Password verification failed!")
    else:
        print(f"User {email} not found. Creating new admin user...")
        new_password = "admin123"
        
        if len(new_password.encode('utf-8')) > 72:
            new_password = new_password[:72]
        
        admin_user = User(
            email=email,
            hashed_password=get_password_hash(new_password),
            full_name="Admin User",
            is_admin=True,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"✅ Admin user created!")
        print(f"Email: {email}")
        print(f"Password: {new_password}")
        
except Exception as e:
    db.rollback()
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()
