"""
Migration script to add subscription_id column to investments table
"""
import os
import sys
from database import engine, DATABASE_URL

def migrate():
    """Add subscription_id column to investments table if it doesn't exist"""
    
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
            # Check if column already exists
            cursor.execute("PRAGMA table_info(investments)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'subscription_id' in columns:
                print("Column 'subscription_id' already exists in investments table. No migration needed.")
            else:
                # Add the column
                cursor.execute("""
                    ALTER TABLE investments 
                    ADD COLUMN subscription_id INTEGER
                """)
                
                # Create index for better query performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_investments_subscription_id 
                    ON investments(subscription_id)
                """)
                
                # Add foreign key constraint if possible (SQLite has limited FK support)
                # Note: SQLite doesn't enforce foreign keys by default, but we can add the constraint
                try:
                    cursor.execute("""
                        CREATE TABLE investments_new (
                            id INTEGER PRIMARY KEY,
                            portfolio_id INTEGER NOT NULL,
                            opportunity_id INTEGER,
                            subscription_id INTEGER,
                            name VARCHAR NOT NULL,
                            description TEXT,
                            initial_amount FLOAT NOT NULL,
                            current_value FLOAT,
                            currency VARCHAR(3) DEFAULT 'EUR',
                            investment_date DATE NOT NULL,
                            status VARCHAR DEFAULT 'active',
                            notes TEXT,
                            created_at DATETIME,
                            updated_at DATETIME,
                            FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
                            FOREIGN KEY (opportunity_id) REFERENCES investment_opportunities(id),
                            FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
                        )
                    """)
                    
                    cursor.execute("""
                        INSERT INTO investments_new 
                        SELECT id, portfolio_id, opportunity_id, NULL, name, description, 
                               initial_amount, current_value, currency, investment_date, 
                               status, notes, created_at, updated_at
                        FROM investments
                    """)
                    
                    cursor.execute("DROP TABLE investments")
                    cursor.execute("ALTER TABLE investments_new RENAME TO investments")
                    
                    # Recreate indexes
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investments_portfolio_id 
                        ON investments(portfolio_id)
                    """)
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investments_opportunity_id 
                        ON investments(opportunity_id)
                    """)
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investments_subscription_id 
                        ON investments(subscription_id)
                    """)
                    cursor.execute("""
                        CREATE INDEX IF NOT EXISTS idx_investments_investment_date 
                        ON investments(investment_date)
                    """)
                    
                    print("Successfully added 'subscription_id' column with foreign key constraint.")
                except sqlite3.OperationalError as e:
                    # If FK constraint fails, just add the column without FK
                    print(f"Note: Could not add foreign key constraint: {e}")
                    print("Column added without foreign key constraint (SQLite limitation).")
                
                conn.commit()
                print("Successfully added 'subscription_id' column to investments table.")
                print("Index created on subscription_id column.")
                
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
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='investments' AND column_name='subscription_id'
            """))
            
            if result.fetchone():
                print("Column 'subscription_id' already exists in investments table. No migration needed.")
            else:
                # Add the column
                conn.execute(text("""
                    ALTER TABLE investments 
                    ADD COLUMN subscription_id INTEGER
                """))
                
                # Create index
                conn.execute(text("""
                    CREATE INDEX IF NOT EXISTS idx_investments_subscription_id 
                    ON investments(subscription_id)
                """))
                
                # Add foreign key constraint
                conn.execute(text("""
                    ALTER TABLE investments 
                    ADD CONSTRAINT fk_investments_subscription_id 
                    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
                """))
                
                trans.commit()
                print("Successfully added 'subscription_id' column to investments table.")
                print("Index and foreign key constraint created.")
                
        except Exception as e:
            trans.rollback()
            print(f"Error during migration: {e}")
            sys.exit(1)
        finally:
            conn.close()

if __name__ == "__main__":
    migrate()
