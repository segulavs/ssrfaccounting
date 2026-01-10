"""
Script to create the first admin user for the portfolio app.
Run this script once to create an admin user.
"""
import sys
from database import SessionLocal
from models import User
from auth import get_password_hash

def create_admin(email: str, password: str, full_name: str = None):
    """Create an admin user"""
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email {email} already exists!")
            return False
        
        # Create admin user
        admin_user = User(
            email=email,
            hashed_password=get_password_hash(password),
            full_name=full_name,
            is_admin=True,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print(f"Admin user created successfully: {email}")
        return True
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python create_admin.py <email> <password> [full_name]")
        print("Example: python create_admin.py admin@example.com mypassword 'Admin User'")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    full_name = sys.argv[3] if len(sys.argv) > 3 else None
    
    create_admin(email, password, full_name)
