"""
Quick Database Schema Inspector
Checks if tasks table and status column exist
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 60)
print("🔍 DATABASE SCHEMA INSPECTOR")
print("=" * 60)

try:
    # Create engine
    engine = create_engine(DATABASE_URL, echo=False)
    
    # Test connection
    with engine.connect() as conn:
        print("✅ Connected to database successfully!")
        
        # Get inspector
        inspector = inspect(engine)
        
        # Check if tasks table exists
        tables = inspector.get_table_names()
        print(f"\n📊 Tables in database: {len(tables)}")
        for table in tables:
            print(f"   - {table}")
        
        if "tasks" in tables:
            print("\n✅ 'tasks' table EXISTS")
            
            # Get columns
            columns = inspector.get_columns("tasks")
            print(f"\n📋 Columns in 'tasks' table: {len(columns)}")
            
            status_found = False
            for col in columns:
                indicator = "✅" if col['name'] == 'status' else "  "
                print(f"   {indicator} {col['name']:<20} {str(col['type']):<20} nullable={col['nullable']}")
                if col['name'] == 'status':
                    status_found = True
            
            if status_found:
                print("\n🎉 'status' column EXISTS in tasks table!")
                
                # Check if any tasks exist
                with engine.connect() as conn:
                    result = conn.execute(text("SELECT COUNT(*) FROM tasks"))
                    count = result.scalar()
                    print(f"📊 Total tasks in database: {count}")
            else:
                print("\n❌ 'status' column MISSING from tasks table!")
        else:
            print("\n❌ 'tasks' table DOES NOT EXIST")
            print("   → Application ne abhi tak tables create nahi kiye hain")
            print("   → Ya connection wrong database se hai")
    
    print("\n" + "=" * 60)
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    print("\nPlease check:")
    print("1. DATABASE_URL in .env file")
    print("2. Database is accessible")
    print("3. Network connection")