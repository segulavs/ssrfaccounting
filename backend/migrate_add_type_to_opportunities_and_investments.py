"""
Migration script to add type column to investment_opportunities and investments tables
"""
import os
import sys
from database import engine, DATABASE_URL

def migrate():
    """Add type column to investment_opportunities and investments tables if they don't exist"""
    
    # Check if using SQLite
    if DATABASE_URL.startswith("sqlite"):
        import sqlite3
        
        # Get database path from URL
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if db_path.startswith("./"):
            db_path = db_path[2:]
        
        if not os.path.exists(db_path):
            print(f"Database file {db_path} not found. It will be created with the new schema.")
            return
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        try:
            # Check if investment_opportunities table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='investment_opportunities'")
            if cursor.fetchone():
                # Check if column already exists
                cursor.execute("PRAGMA table_info(investment_opportunities)")
                columns = [column[1] for column in cursor.fetchall()]
                
                if 'type' not in columns:
                    # Add the column with default value
                    cursor.execute("""
                        ALTER TABLE investment_opportunities 
                        ADD COLUMN type VARCHAR DEFAULT 'real_estate'
                    """)
                    
                    # Update existing rows to have a default type
                    cursor.execute("""
                        UPDATE investment_opportunities 
                        SET type = 'real_estate' 
                        WHERE type IS NULL
                    """)
                    
                    # Create index
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investment_opportunities_type 
                        ON investment_opportunities(type)
                    """)
                    
                    print("Successfully added 'type' column to investment_opportunities table.")
                else:
                    print("Column 'type' already exists in investment_opportunities table.")
            
            # Check if investments table exists
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='investments'")
            if cursor.fetchone():
                # Check if column already exists
                cursor.execute("PRAGMA table_info(investments)")
                columns = [column[1] for column in cursor.fetchall()]
                
                if 'type' not in columns:
                    # Add the column with default value
                    cursor.execute("""
                        ALTER TABLE investments 
                        ADD COLUMN type VARCHAR DEFAULT 'real_estate'
                    """)
                    
                    # Update existing rows to have a default type
                    cursor.execute("""
                        UPDATE investments 
                        SET type = 'real_estate' 
                        WHERE type IS NULL
                    """)
                    
                    # Create index
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investments_type 
                        ON investments(type)
                    """)
                    
                    print("Successfully added 'type' column to investments table.")
                else:
                    print("Column 'type' already exists in investments table.")
            
            conn.commit()
            print("Migration completed successfully.")
                
        except sqlite3.Error as e:
            print(f"Error during migration: {e}")
            conn.rollback()
            sys.exit(1)
        finally:
            conn.close()
    
    else:
        # PostgreSQL or other database
        from sqlalchemy import text
        
        conn = engine.connect()
        trans = conn.begin()
        
        try:
            # Check if investment_opportunities table exists and add type column
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='investment_opportunities' AND column_name='type'
            """))
            
            if not result.fetchone():
                conn.execute(text("""
                    ALTER TABLE investment_opportunities 
                    ADD COLUMN type VARCHAR NOT NULL DEFAULT 'real_estate'
                """))
                
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_investment_opportunities_type 
                    ON investment_opportunities(type)
                """))
                
                print("Successfully added 'type' column to investment_opportunities table.")
            else:
                print("Column 'type' already exists in investment_opportunities table.")
            
            # Check if investments table exists and add type column
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='investments' AND column_name='type'
            """))
            
            if not result.fetchone():
                conn.execute(text("""
                    ALTER TABLE investments 
                    ADD COLUMN type VARCHAR NOT NULL DEFAULT 'real_estate'
                """))
                
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_investments_type 
                    ON investments(type)
                """))
                
                print("Successfully added 'type' column to investments table.")
            else:
                print("Column 'type' already exists in investments table.")
            
            trans.commit()
            print("Migration completed successfully.")
                
        except Exception as e:
            trans.rollback()
            print(f"Error during migration: {e}")
            sys.exit(1)
        finally:
            conn.close()

if __name__ == "__main__":
    migrate()
