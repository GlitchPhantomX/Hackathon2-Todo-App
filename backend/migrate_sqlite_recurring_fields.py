"""
Database Migration Script: Add Recurring Task Fields to SQLite tasks table

This script safely adds the recurring task fields to your SQLite database.
SQLite doesn't support adding multiple columns in one ALTER TABLE statement,
so we need to add them one by one.

Fields added:
- is_recurring: BOOLEAN (Default: false)
- frequency: TEXT (Default: NULL)
- recurrence_end_date: TIMESTAMP (Default: NULL)
- parent_task_id: INTEGER (Default: NULL)
- recurrence_pattern: TEXT (For JSON data, Default: NULL)
- reminder_enabled: BOOLEAN (Default: true)
- reminder_timing: TEXT (Default: '1hr')
- reminder_sent: BOOLEAN (Default: false)
- timezone: TEXT (Default: 'UTC')

Usage:
    python migrate_sqlite_recurring_fields.py
"""

import sqlite3
import os
from datetime import datetime

def migrate_add_recurring_fields():
    """Add recurring task fields to SQLite tasks table if they don't exist"""

    db_path = 'todo_app.db'

    if not os.path.exists(db_path):
        print(f"ERROR: Database file '{db_path}' not found")
        return False

    print(f"Connecting to SQLite database: {db_path}")

    try:
        # Connect to SQLite database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        print("\nConnected to database successfully!")

        # Check existing columns in the tasks table
        cursor.execute("PRAGMA table_info(tasks)")
        existing_columns = [column[1] for column in cursor.fetchall()]

        print(f"\n🔍 Current columns in tasks table: {existing_columns}")

        # Define the columns we need to add
        columns_to_add = []

        if 'is_recurring' not in existing_columns:
            columns_to_add.append(("is_recurring", "INTEGER DEFAULT 0"))  # SQLite uses INTEGER for BOOLEAN

        if 'frequency' not in existing_columns:
            columns_to_add.append(("frequency", "TEXT DEFAULT NULL"))

        if 'recurrence_end_date' not in existing_columns:
            columns_to_add.append(("recurrence_end_date", "TIMESTAMP DEFAULT NULL"))

        if 'parent_task_id' not in existing_columns:
            columns_to_add.append(("parent_task_id", "INTEGER DEFAULT NULL"))

        if 'recurrence_pattern' not in existing_columns:
            columns_to_add.append(("recurrence_pattern", "TEXT DEFAULT NULL"))

        if 'reminder_enabled' not in existing_columns:
            columns_to_add.append(("reminder_enabled", "INTEGER DEFAULT 1"))  # SQLite uses INTEGER for BOOLEAN

        if 'reminder_timing' not in existing_columns:
            columns_to_add.append(("reminder_timing", "TEXT DEFAULT '1hr'"))

        if 'reminder_sent' not in existing_columns:
            columns_to_add.append(("reminder_sent", "INTEGER DEFAULT 0"))  # SQLite uses INTEGER for BOOLEAN

        if 'timezone' not in existing_columns:
            columns_to_add.append(("timezone", "TEXT DEFAULT 'UTC'"))

        # Add each column individually (SQLite limitation)
        for column_name, column_def in columns_to_add:
            print(f"   Adding column '{column_name}'...")
            alter_query = f"ALTER TABLE tasks ADD COLUMN {column_name} {column_def}"
            cursor.execute(alter_query)
            print(f"   Column '{column_name}' added successfully!")

        # Commit the changes
        conn.commit()

        # Verify the migration
        print("\n🔍 Verifying migration...")
        cursor.execute("PRAGMA table_info(tasks)")
        all_columns = [column[1] for column in cursor.fetchall()]

        print("   Updated columns in tasks table:")
        for col in all_columns:
            marker = "✓" if col in ['is_recurring', 'frequency', 'recurrence_end_date',
                                  'parent_task_id', 'recurrence_pattern', 'reminder_enabled',
                                  'reminder_timing', 'reminder_sent', 'timezone'] else " "
            print(f"      {marker} {col}")

        # Check specifically for our new columns
        new_columns_added = []
        missing_columns = []

        for col_name, _ in columns_to_add:
            if col_name in all_columns:
                new_columns_added.append(col_name)
            else:
                missing_columns.append(col_name)

        if missing_columns:
            print(f"\nWarning: These columns were not added: {missing_columns}")

        print(f"\nSummary: Added {len(new_columns_added)} new columns")
        if new_columns_added:
            print(f"   New columns: {', '.join(new_columns_added)}")

        print("\n" + "="*60)
        print("SQLITE MIGRATION COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\nYour database is now ready for recurring tasks!")
        print("   The tasks table has been extended with recurring task fields.\n")

        conn.close()
        return True

    except Exception as e:
        print("\n" + "="*60)
        print("MIGRATION FAILED!")
        print("="*60)
        print(f"\nError: {str(e)}")
        print("\nPlease check:")
        print("1. Database file exists and is accessible")
        print("2. You have write permissions to the database file")
        print("3. The tasks table exists in the database")
        print()

        if 'conn' in locals():
            conn.close()
        return False


if __name__ == "__main__":
    print("\n" + "="*60)
    print("SQLITE RECURRING TASK FIELDS MIGRATION SCRIPT")
    print("="*60)
    print("Task: Add recurring task fields to SQLite tasks table")
    print("Database: SQLite\n")

    success = migrate_add_recurring_fields()

    if success:
        print("You can now use recurring tasks features!")
        print("   Run your application to test the new functionality.\n")
    else:
        print("Migration failed. Please fix the errors and try again.\n")