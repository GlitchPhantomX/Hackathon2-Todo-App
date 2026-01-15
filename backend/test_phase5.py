#!/usr/bin/env python3
"""
Test script to create a recurring task for Phase 5 demonstration.
"""

import sqlite3
from datetime import datetime, timedelta
import os

def create_test_task():
    # Connect to the database
    db_path = os.path.join(os.path.dirname(__file__), 'todo_app.db')
    print(f"Connecting to database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Calculate due date (current time + 10 minutes)
        due_date = datetime.utcnow() + timedelta(minutes=10)
        due_date_str = due_date.strftime('%Y-%m-%d %H:%M:%S.%f')

        # Insert the test task
        cursor.execute("""
            INSERT INTO tasks (title, description, completed, due_date, priority, project_id, user_id, created_at, updated_at, is_recurring, frequency)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            '',           # title
            'Test task for Phase 5 demo 3',  # description
            False,                         # completed
            due_date_str,                  # due_date
            'medium',                      # priority
            None,                          # project_id
            2,                             # user_id
            datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f'),  # created_at
            datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S.%f'),  # updated_at
            True,                          # is_recurring
            'daily'                        # frequency
        ))

        # Commit the changes
        conn.commit()
        task_id = cursor.lastrowid
        print(f"Test task created! ID: {task_id}")
        print(f"Title: Phase 5 Live Demo")
        print(f"Due Date: {due_date_str}")
        print(f"Is Recurring: True")
        print(f"Frequency: daily")
        print(f"User ID: 2")

    except sqlite3.Error as e:
        print(f"Error creating test task: {e}")
        conn.rollback()
    except Exception as e:
        print(f"Unexpected error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Creating Phase 5 test task...")
    create_test_task()
    print("Test task creation completed.")