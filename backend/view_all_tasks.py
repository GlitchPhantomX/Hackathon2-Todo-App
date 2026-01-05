"""
View All Tasks in Database
Shows all tasks saved in Neon PostgreSQL database
"""

import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import pandas as pd

# Load environment
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

print("=" * 80)
print("📋 DATABASE TASKS VIEWER")
print("=" * 80)
print()

try:
    # Create engine
    engine = create_engine(DATABASE_URL, echo=False)
    
    with engine.connect() as conn:
        print("✅ Connected to database successfully!")
        print()
        
        # Get all tasks
        query = text("""
            SELECT 
                t.id,
                t.title,
                t.description,
                t.status,
                t.priority,
                t.completed,
                t.due_date,
                t.user_id,
                u.name as user_name,
                u.email as user_email,
                t.created_at,
                t.updated_at
            FROM tasks t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.created_at DESC
        """)
        
        result = conn.execute(query)
        tasks = result.fetchall()
        
        if not tasks:
            print("📝 No tasks found in database.")
            print()
        else:
            print(f"📊 Total Tasks Found: {len(tasks)}")
            print("=" * 80)
            print()
            
            for i, task in enumerate(tasks, 1):
                print(f"{'='*80}")
                print(f"Task #{i}")
                print(f"{'='*80}")
                print(f"🆔 ID:          {task.id}")
                print(f"📝 Title:       {task.title}")
                
                if task.description:
                    desc = task.description[:100] + "..." if len(task.description) > 100 else task.description
                    print(f"📄 Description: {desc}")
                
                status_emoji = "✅" if task.status == "completed" else "⏳"
                print(f"{status_emoji} Status:      {task.status.upper()}")
                
                priority_emoji = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(task.priority, "⚪")
                print(f"{priority_emoji} Priority:    {task.priority.upper()}")
                
                completed_emoji = "✅" if task.completed else "❌"
                print(f"{completed_emoji} Completed:   {task.completed}")
                
                if task.due_date:
                    print(f"📅 Due Date:    {task.due_date}")
                
                print(f"👤 User:        {task.user_name} ({task.user_email})")
                print(f"📅 Created:     {task.created_at}")
                print(f"📅 Updated:     {task.updated_at}")
                print()
        
        # Get statistics by user
        print("=" * 80)
        print("📊 STATISTICS BY USER")
        print("=" * 80)
        print()
        
        stats_query = text("""
            SELECT 
                u.name,
                u.email,
                COUNT(*) as total_tasks,
                SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
                SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
                SUM(CASE WHEN t.priority = 'high' THEN 1 ELSE 0 END) as high_priority,
                SUM(CASE WHEN t.priority = 'medium' THEN 1 ELSE 0 END) as medium_priority,
                SUM(CASE WHEN t.priority = 'low' THEN 1 ELSE 0 END) as low_priority
            FROM users u
            LEFT JOIN tasks t ON u.id = t.user_id
            GROUP BY u.id, u.name, u.email
            ORDER BY total_tasks DESC
        """)
        
        stats_result = conn.execute(stats_query)
        stats = stats_result.fetchall()
        
        for stat in stats:
            print(f"👤 User: {stat.name} ({stat.email})")
            print(f"   📊 Total Tasks:     {stat.total_tasks}")
            print(f"   ✅ Completed:       {stat.completed_tasks}")
            print(f"   ⏳ Pending:         {stat.pending_tasks}")
            print(f"   🔴 High Priority:   {stat.high_priority}")
            print(f"   🟡 Medium Priority: {stat.medium_priority}")
            print(f"   🟢 Low Priority:    {stat.low_priority}")
            
            if stat.total_tasks > 0:
                completion_rate = (stat.completed_tasks / stat.total_tasks) * 100
                print(f"   🎯 Completion Rate: {completion_rate:.1f}%")
            print()
        
        print("=" * 80)
        
except Exception as e:
    print(f"❌ ERROR: {e}")
    print()
    import traceback
    traceback.print_exc()