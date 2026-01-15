import sqlite3
from pathlib import Path

def add_reminder_sent_column():
    """Add the reminder_sent column to the tasks table if it doesn't exist."""

    # Get the database path (same as used by the app)
    db_path = Path("todo_app.db")

    if not db_path.exists():
        print(f"Database {db_path} not found!")
        return False

    try:
        # Connect to the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        # Check if the column already exists
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]

        if 'reminder_sent' in columns:
            print("Column 'reminder_sent' already exists in tasks table.")
            conn.close()
            return True

        # Add the reminder_sent column to the tasks table
        print("Adding 'reminder_sent' column to tasks table...")
        cursor.execute("ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT 0")

        # Commit the changes
        conn.commit()
        print("Successfully added 'reminder_sent' column to tasks table!")

        # Verify the column was added
        cursor.execute("PRAGMA table_info(tasks)")
        columns = [column[1] for column in cursor.fetchall()]
        print(f"Current columns in tasks table: {columns}")

        conn.close()
        return True

    except sqlite3.Error as e:
        print(f"SQLite error: {e}")
        return False
    except Exception as e:
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = add_reminder_sent_column()
    if success:
        print("\nDatabase update completed successfully!")
        print("You can now run the notification service without the 'no such column' error.")
    else:
        print("\nDatabase update failed!")