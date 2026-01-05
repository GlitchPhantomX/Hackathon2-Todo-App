"""
Database Migration Script: Add 'status' column to tasks table

This script safely adds the missing 'status' column to your Neon PostgreSQL database.
It handles the case where the column might already exist.

Usage:
    python fix_database_add_status.py
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def migrate_add_status_column():
    """Add status column to tasks table if it doesn't exist"""
    
    # Get database URL from environment
    DATABASE_URL = os.getenv("DATABASE_URL")
    
    if not DATABASE_URL:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        return False
    
    print("🔗 Connecting to Neon PostgreSQL database...")
    print(f"   Database: {DATABASE_URL.split('@')[1].split('/')[0]}")  # Show host without credentials
    
    try:
        # Create database engine
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            print("\n✅ Connected to database successfully!")
            
            # Check if status column already exists
            print("\n🔍 Checking if 'status' column exists...")
            
            check_query = text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'tasks' 
                AND column_name = 'status'
            """)
            
            result = conn.execute(check_query)
            column_exists = result.fetchone() is not None
            
            if column_exists:
                print("   ⚠️  'status' column already exists in tasks table")
                print("   ✅ No migration needed!")
                return True
            
            print("   ⚠️  'status' column NOT found")
            print("\n🔧 Adding 'status' column to tasks table...")
            
            # Add status column with default value
            add_column_query = text("""
                ALTER TABLE tasks 
                ADD COLUMN status VARCHAR(20) DEFAULT 'pending' NOT NULL
            """)
            
            conn.execute(add_column_query)
            conn.commit()
            
            print("   ✅ Column added successfully!")
            
            # Update existing tasks to have 'pending' status
            print("\n🔄 Updating existing tasks...")
            
            update_query = text("""
                UPDATE tasks 
                SET status = 'pending' 
                WHERE status IS NULL
            """)
            
            result = conn.execute(update_query)
            conn.commit()
            
            rows_updated = result.rowcount
            print(f"   ✅ Updated {rows_updated} existing task(s)")
            
            # Verify the migration
            print("\n🔍 Verifying migration...")
            
            verify_query = text("""
                SELECT column_name, data_type, column_default
                FROM information_schema.columns 
                WHERE table_name = 'tasks' 
                AND column_name = 'status'
            """)
            
            result = conn.execute(verify_query)
            column_info = result.fetchone()
            
            if column_info:
                print(f"   ✅ Column verified:")
                print(f"      Name: {column_info[0]}")
                print(f"      Type: {column_info[1]}")
                print(f"      Default: {column_info[2]}")
            
            print("\n" + "="*60)
            print("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n✅ Your database is now ready!")
            print("   You can now run your application without errors.\n")
            
            return True
            
    except Exception as e:
        print("\n" + "="*60)
        print("❌ MIGRATION FAILED!")
        print("="*60)
        print(f"\nError: {str(e)}")
        print("\nPlease check:")
        print("1. Database URL is correct in .env file")
        print("2. Database is accessible")
        print("3. You have proper permissions")
        print()
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 DATABASE MIGRATION SCRIPT")
    print("="*60)
    print("Task: Add 'status' column to tasks table")
    print("Database: Neon PostgreSQL\n")
    
    success = migrate_add_status_column()
    
    if success:
        print("✅ You can now restart your application!")
        print("   Run: uvicorn main:app --reload\n")
    else:
        print("❌ Migration failed. Please fix the errors and try again.\n")