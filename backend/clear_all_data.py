#!/usr/bin/env python3
"""
Script to clear all data from the SSRF Accounting database.
This will delete all transactions, cash transactions, and projects.
"""

from database import SessionLocal, engine, Base
from models import Transaction, CashTransaction, Project
import os

def clear_all_data():
    """Delete all data from all tables."""
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Delete all transactions
        deleted_transactions = db.query(Transaction).delete()
        print(f"Deleted {deleted_transactions} transactions")
        
        # Delete all cash transactions
        deleted_cash = db.query(CashTransaction).delete()
        print(f"Deleted {deleted_cash} cash transactions")
        
        # Delete all projects
        deleted_projects = db.query(Project).delete()
        print(f"Deleted {deleted_projects} projects")
        
        # Commit the changes
        db.commit()
        print("\nAll data has been cleared successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error clearing data: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_data()
