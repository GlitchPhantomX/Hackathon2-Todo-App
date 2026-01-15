#!/usr/bin/env python3
"""
Database migration script to add missing columns for recurring tasks.
"""

import sqlite3
import os

def migrate_database():
    # Connect to the database
    db_path = os.path.join(os.path.dirname(__file__), 'todo_app.db')
    print(f"Connecting to database: {db_path}")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if is_recurring column exists
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]

        # Add is_recurring column if it doesn't exist
        if 'is_recurring' not in columns:
            print("Adding 'is_recurring' column to tasks table...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT 0")
            print("SUCCESS: Added 'is_recurring' column")
        else:
            print("'is_recurring' column already exists")

        # Add frequency column if it doesn't exist
        if 'frequency' not in columns:
            print("Adding 'frequency' column to tasks table...")
            cursor.execute("ALTER TABLE tasks ADD COLUMN frequency VARCHAR")
            print("SUCCESS: Added 'frequency' column")
        else:
            print("'frequency' column already exists")

        # Commit the changes
        conn.commit()
        print("\nDatabase migration completed successfully!")
        print("Columns added:")
        print("- is_recurring (BOOLEAN, DEFAULT 0)")
        print("- frequency (VARCHAR)")

    except sqlite3.Error as e:
        print(f"ERROR: Error during migration: {e}")
        conn.rollback()
    except Exception as e:
        print(f"ERROR: Unexpected error: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    print("Starting database migration for recurring task support...")
    migrate_database()
    print("Migration script completed.")