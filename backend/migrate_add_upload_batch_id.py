"""
Migration script to add upload_batch_id column to transactions table
"""
import sqlite3
import os

# Database file path
db_path = "ssrf_accounting.db"

if not os.path.exists(db_path):
    print(f"Database file {db_path} not found. Creating it...")
    # If database doesn't exist, SQLAlchemy will create it with the new schema
    exit(0)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Check if column already exists
    cursor.execute("PRAGMA table_info(transactions)")
    columns = [column[1] for column in cursor.fetchall()]
    
    if 'upload_batch_id' in columns:
        print("Column 'upload_batch_id' already exists. No migration needed.")
    else:
        # Add the column
        cursor.execute("""
            ALTER TABLE transactions 
            ADD COLUMN upload_batch_id TEXT
        """)
        
        # Create index for better query performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_transactions_upload_batch_id 
            ON transactions(upload_batch_id)
        """)
        
        conn.commit()
        print("Successfully added 'upload_batch_id' column to transactions table.")
        print("Index created on upload_batch_id column.")
        
except sqlite3.Error as e:
    print(f"Error during migration: {e}")
    conn.rollback()
finally:
    conn.close()
