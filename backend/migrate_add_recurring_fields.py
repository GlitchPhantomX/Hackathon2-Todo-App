"""
Database Migration Script: Add Recurring Task Fields to tasks table

This script safely adds the recurring task fields to your PostgreSQL database.
It handles the case where the columns might already exist.

Fields added:
- is_recurring: Boolean (Default: false)
- frequency: String (Enum: 'daily', 'weekly', 'monthly', 'custom')
- recurrence_end_date: DateTime (Optional)
- parent_task_id: Integer (Foreign Key to tasks.id, Optional)
- recurrence_pattern: JSONB (For complex patterns, Optional)
- reminder_enabled: Boolean (Default: true)
- reminder_timing: String (Enum: '15min', '1hr', '1day', Default: '1hr')
- reminder_sent: Boolean (Default: false)
- timezone: String (Default: 'UTC')

Usage:
    python migrate_add_recurring_fields.py
"""

import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def migrate_add_recurring_fields():
    """Add recurring task fields to tasks table if they don't exist"""

    # Get database URL from environment
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL:
        print("❌ ERROR: DATABASE_URL not found in .env file")
        return False

    print("🔗 Connecting to PostgreSQL database...")
    print(f"   Database: {DATABASE_URL.split('@')[1].split('/')[0]}")  # Show host without credentials

    try:
        # Create database engine
        engine = create_engine(DATABASE_URL)

        with engine.connect() as conn:
            print("\n✅ Connected to database successfully!")

            # Check if recurring fields already exist
            print("\n🔍 Checking if recurring task fields exist...")

            # Check for is_recurring column
            check_is_recurring = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'is_recurring'
            """)

            result = conn.execute(check_is_recurring)
            is_recurring_exists = result.fetchone() is not None

            if is_recurring_exists:
                print("   ⚠️  'is_recurring' column already exists in tasks table")
            else:
                print("   ⚠️  'is_recurring' column NOT found - adding...")

                # Add is_recurring column
                add_is_recurring = text("""
                    ALTER TABLE tasks
                    ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE
                """)
                conn.execute(add_is_recurring)
                print("   ✅ 'is_recurring' column added successfully!")

            # Check for frequency column
            check_frequency = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'frequency'
            """)

            result = conn.execute(check_frequency)
            frequency_exists = result.fetchone() is not None

            if frequency_exists:
                print("   ⚠️  'frequency' column already exists in tasks table")
            else:
                print("   ⚠️  'frequency' column NOT found - adding...")

                # Add frequency column
                add_frequency = text("""
                    ALTER TABLE tasks
                    ADD COLUMN frequency VARCHAR(20) DEFAULT NULL
                """)
                conn.execute(add_frequency)
                print("   ✅ 'frequency' column added successfully!")

            # Check for recurrence_end_date column
            check_recurrence_end = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'recurrence_end_date'
            """)

            result = conn.execute(check_recurrence_end)
            recurrence_end_exists = result.fetchone() is not None

            if recurrence_end_exists:
                print("   ⚠️  'recurrence_end_date' column already exists in tasks table")
            else:
                print("   ⚠️  'recurrence_end_date' column NOT found - adding...")

                # Add recurrence_end_date column
                add_recurrence_end = text("""
                    ALTER TABLE tasks
                    ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
                """)
                conn.execute(add_recurrence_end)
                print("   ✅ 'recurrence_end_date' column added successfully!")

            # Check for parent_task_id column
            check_parent_task = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'parent_task_id'
            """)

            result = conn.execute(check_parent_task)
            parent_task_exists = result.fetchone() is not None

            if parent_task_exists:
                print("   ⚠️  'parent_task_id' column already exists in tasks table")
            else:
                print("   ⚠️  'parent_task_id' column NOT found - adding...")

                # Add parent_task_id column
                add_parent_task = text("""
                    ALTER TABLE tasks
                    ADD COLUMN parent_task_id INTEGER DEFAULT NULL
                """)
                conn.execute(add_parent_task)
                print("   ✅ 'parent_task_id' column added successfully!")

            # Check for recurrence_pattern column
            check_pattern = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'recurrence_pattern'
            """)

            result = conn.execute(check_pattern)
            pattern_exists = result.fetchone() is not None

            if pattern_exists:
                print("   ⚠️  'recurrence_pattern' column already exists in tasks table")
            else:
                print("   ⚠️  'recurrence_pattern' column NOT found - adding...")

                # Add recurrence_pattern column
                add_pattern = text("""
                    ALTER TABLE tasks
                    ADD COLUMN recurrence_pattern JSONB DEFAULT NULL
                """)
                conn.execute(add_pattern)
                print("   ✅ 'recurrence_pattern' column added successfully!")

            # Check for reminder_enabled column
            check_reminder_enabled = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'reminder_enabled'
            """)

            result = conn.execute(check_reminder_enabled)
            reminder_enabled_exists = result.fetchone() is not None

            if reminder_enabled_exists:
                print("   ⚠️  'reminder_enabled' column already exists in tasks table")
            else:
                print("   ⚠️  'reminder_enabled' column NOT found - adding...")

                # Add reminder_enabled column
                add_reminder_enabled = text("""
                    ALTER TABLE tasks
                    ADD COLUMN reminder_enabled BOOLEAN DEFAULT TRUE
                """)
                conn.execute(add_reminder_enabled)
                print("   ✅ 'reminder_enabled' column added successfully!")

            # Check for reminder_timing column
            check_reminder_timing = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'reminder_timing'
            """)

            result = conn.execute(check_reminder_timing)
            reminder_timing_exists = result.fetchone() is not None

            if reminder_timing_exists:
                print("   ⚠️  'reminder_timing' column already exists in tasks table")
            else:
                print("   ⚠️  'reminder_timing' column NOT found - adding...")

                # Add reminder_timing column
                add_reminder_timing = text("""
                    ALTER TABLE tasks
                    ADD COLUMN reminder_timing VARCHAR(10) DEFAULT '1hr'
                """)
                conn.execute(add_reminder_timing)
                print("   ✅ 'reminder_timing' column added successfully!")

            # Check for reminder_sent column
            check_reminder_sent = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'reminder_sent'
            """)

            result = conn.execute(check_reminder_sent)
            reminder_sent_exists = result.fetchone() is not None

            if reminder_sent_exists:
                print("   ⚠️  'reminder_sent' column already exists in tasks table")
            else:
                print("   ⚠️  'reminder_sent' column NOT found - adding...")

                # Add reminder_sent column
                add_reminder_sent = text("""
                    ALTER TABLE tasks
                    ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE
                """)
                conn.execute(add_reminder_sent)
                print("   ✅ 'reminder_sent' column added successfully!")

            # Check for timezone column
            check_timezone = text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name = 'timezone'
            """)

            result = conn.execute(check_timezone)
            timezone_exists = result.fetchone() is not None

            if timezone_exists:
                print("   ⚠️  'timezone' column already exists in tasks table")
            else:
                print("   ⚠️  'timezone' column NOT found - adding...")

                # Add timezone column
                add_timezone = text("""
                    ALTER TABLE tasks
                    ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC'
                """)
                conn.execute(add_timezone)
                print("   ✅ 'timezone' column added successfully!")

            # Add foreign key constraint for parent_task_id if it doesn't exist
            try:
                check_fk_constraint = text("""
                    SELECT constraint_name
                    FROM information_schema.table_constraints
                    WHERE constraint_type = 'FOREIGN KEY'
                    AND table_name = 'tasks'
                    AND constraint_name = 'fk_tasks_parent_task_id'
                """)

                result = conn.execute(check_fk_constraint)
                fk_exists = result.fetchone() is not None

                if not fk_exists:
                    print("   🔧 Adding foreign key constraint for parent_task_id...")

                    # Add foreign key constraint
                    add_fk_constraint = text("""
                        ALTER TABLE tasks
                        ADD CONSTRAINT fk_tasks_parent_task_id
                        FOREIGN KEY (parent_task_id) REFERENCES tasks(id)
                    """)
                    conn.execute(add_fk_constraint)
                    print("   ✅ Foreign key constraint added successfully!")
                else:
                    print("   ⚠️  Foreign key constraint already exists")

            except Exception as fk_error:
                print(f"   ⚠️  Could not add foreign key constraint: {fk_error}")

            conn.commit()

            # Verify the migration
            print("\n🔍 Verifying migration...")

            verify_query = text("""
                SELECT column_name, data_type
                FROM information_schema.columns
                WHERE table_name = 'tasks'
                AND column_name IN ('is_recurring', 'frequency', 'recurrence_end_date',
                                   'parent_task_id', 'recurrence_pattern', 'reminder_enabled',
                                   'reminder_timing', 'reminder_sent', 'timezone')
                ORDER BY column_name
            """)

            result = conn.execute(verify_query)
            columns_info = result.fetchall()

            print("   ✅ Columns verified:")
            for col_info in columns_info:
                print(f"      {col_info[0]}: {col_info[1]}")

            print("\n" + "="*60)
            print("🎉 MIGRATION COMPLETED SUCCESSFULLY!")
            print("="*60)
            print("\n✅ Your database is now ready for recurring tasks!")
            print("   The tasks table has been extended with recurring task fields.\n")

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
    print("🚀 RECURRING TASK FIELDS MIGRATION SCRIPT")
    print("="*60)
    print("Task: Add recurring task fields to tasks table")
    print("Database: PostgreSQL\n")

    success = migrate_add_recurring_fields()

    if success:
        print("✅ You can now use recurring tasks features!")
        print("   Run your application to test the new functionality.\n")
    else:
        print("❌ Migration failed. Please fix the errors and try again.\n")