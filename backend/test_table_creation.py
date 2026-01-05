"""
Manual Table Creation Test
Tests if tables can be created in Neon PostgreSQL
"""

import os
from dotenv import load_dotenv
from sqlmodel import SQLModel, create_engine
from sqlalchemy import inspect

# Load environment
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 70)
print("🧪 MANUAL TABLE CREATION TEST")
print("=" * 70)
print(f"📍 Database URL: {DATABASE_URL[:50]}...")
print()

try:
    # Create engine
    print("🔧 Creating database engine...")
    engine = create_engine(DATABASE_URL, echo=True)  # echo=True to see SQL
    print("✅ Engine created")
    print()
    
    # Import models
    print("📦 Importing models...")
    from models import User, Task, Conversation, ChatMessage
    print("✅ Models imported successfully:")
    print(f"   - User: {User}")
    print(f"   - Task: {Task}")
    print(f"   - Conversation: {Conversation}")
    print(f"   - ChatMessage: {ChatMessage}")
    print()
    
    # Check metadata
    print("🔍 Checking SQLModel metadata...")
    print(f"   Tables in metadata: {len(SQLModel.metadata.tables)}")
    for table_name in SQLModel.metadata.tables.keys():
        print(f"      - {table_name}")
    print()
    
    # Create tables
    print("🚀 Creating tables...")
    print("-" * 70)
    SQLModel.metadata.create_all(engine)
    print("-" * 70)
    print("✅ create_all() completed without errors!")
    print()
    
    # Verify tables exist
    print("🔍 Verifying tables in database...")
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    print(f"📊 Tables found in database: {len(tables)}")
    for table in tables:
        print(f"   ✅ {table}")
    print()
    
    if len(tables) == 0:
        print("⚠️  WARNING: create_all() ran but NO tables in database!")
        print("   This suggests:")
        print("   1. Wrong database connection")
        print("   2. Or models not properly registered in SQLModel.metadata")
    else:
        print("🎉 SUCCESS! Tables created in database!")
    
    print("=" * 70)
    
except Exception as e:
    print()
    print("=" * 70)
    print("❌ ERROR OCCURRED!")
    print("=" * 70)
    print(f"Error Type: {type(e).__name__}")
    print(f"Error Message: {e}")
    print()
    import traceback
    print("Full Traceback:")
    print("-" * 70)
    traceback.print_exc()
    print("=" * 70)