from sqlmodel import Session, select
from models.models import User, Task
from database.db import engine, create_tables, test_connection
import datetime


def test_database_connectivity():
    """Test database connectivity"""
    print("Testing database connectivity...")
    success = test_connection()
    if success:
        print("Database connection successful")
    else:
        print("Database connection failed")
    return success


def test_table_creation():
    """Test table creation"""
    print("\nTesting table creation...")
    try:
        create_tables()
        print("Tables created successfully")
        return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        return False


def test_user_crud():
    """Test User CRUD operations"""
    print("\nTesting User CRUD operations...")

    with Session(engine) as session:
        # Create user
        print("  Creating user...")
        user = User(
            email="test@example.com",
            name="Test User",
            hashed_password="hashed123"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"  User created: ID {user.id}")

        user_id = user.id

        # Read user
        print("  Reading user...")
        retrieved_user = session.get(User, user_id)
        if retrieved_user:
            print(f"  User retrieved: {retrieved_user.name}")
        else:
            print("  Failed to retrieve user")
            return False

        # Update user
        print("  Updating user...")
        retrieved_user.name = "Updated Test User"
        session.add(retrieved_user)
        session.commit()
        print("  User updated")

        # Verify update
        updated_user = session.get(User, user_id)
        if updated_user and updated_user.name == "Updated Test User":
            print("  User update verified")
        else:
            print("  User update failed")
            return False

        # Delete user
        print("  Deleting user...")
        session.delete(retrieved_user)
        session.commit()
        print("  User deleted")

        # Verify deletion
        deleted_user = session.get(User, user_id)
        if deleted_user is None:
            print("  User deletion verified")
        else:
            print("  User deletion failed")
            return False

    return True


def test_task_crud():
    """Test Task CRUD operations"""
    print("\nTesting Task CRUD operations...")

    with Session(engine) as session:
        # Create a user first for the task
        user = User(
            email="taskuser@example.com",
            name="Task User",
            hashed_password="hashed123"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"  Created user for task test: ID {user.id}")

        user_id = user.id

        # Create task
        print("  Creating task...")
        task = Task(
            user_id=user_id,
            title="Test Task",
            description="Test Description",
            completed=False
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        print(f"  Task created: ID {task.id}")

        task_id = task.id

        # Read tasks by user
        print("  Reading tasks by user...")
        user_tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
        print(f"  Tasks retrieved: {len(user_tasks)} task(s)")

        # Update task
        print("  Updating task...")
        task.completed = True
        session.add(task)
        session.commit()
        print("  Task updated: completed=True")

        # Verify update
        updated_task = session.get(Task, task_id)
        if updated_task and updated_task.completed:
            print("  Task update verified")
        else:
            print("  Task update failed")
            return False

        # Delete task
        print("  Deleting task...")
        session.delete(task)
        session.commit()
        print("  Task deleted")

        # Verify deletion
        deleted_task = session.get(Task, task_id)
        if deleted_task is None:
            print("  Task deletion verified")
        else:
            print("  Task deletion failed")
            return False

        # Clean up user
        session.delete(user)
        session.commit()

    return True


def test_relationships():
    """Test User-Task relationships"""
    print("\nTesting relationships...")

    with Session(engine) as session:
        # Create user
        user = User(
            email="relation@example.com",
            name="Relation User",
            hashed_password="hashed123"
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"  Created user: ID {user.id}")

        user_id = user.id

        # Create task for user
        task = Task(
            user_id=user_id,
            title="Relationship Test Task",
            description="Testing relationships",
            completed=False
        )
        session.add(task)
        session.commit()
        session.refresh(task)
        print(f"  Created task: ID {task.id}")

        # Test user.tasks relationship
        print("  Testing user.tasks relationship...")
        user_with_tasks = session.get(User, user_id)
        user_tasks = user_with_tasks.tasks
        if user_tasks and len(user_tasks) > 0:
            print(f"  Access to user.tasks: {len(user_tasks)} task(s)")
        else:
            print("  Failed to access user.tasks")
            return False

        # Test task.user relationship
        print("  Testing task.user relationship...")
        task_with_user = session.get(Task, task.id)
        task_user = task_with_user.user
        if task_user and task_user.id == user_id:
            print(f"  Access to task.user: {task_user.name}")
        else:
            print("  Failed to access task.user")
            return False

        # Clean up
        session.delete(task)
        session.delete(user)
        session.commit()

    print("  Relationships working correctly")
    return True


def test_foreign_key_constraint():
    """Test foreign key constraint"""
    print("\nTesting foreign key constraint...")

    with Session(engine) as session:
        # Try to create task with invalid user_id
        print("  Attempting to create task with invalid user_id...")
        invalid_task = Task(
            user_id=999999,  # Invalid user ID
            title="Invalid Task",
            description="This should fail",
            completed=False
        )

        try:
            session.add(invalid_task)
            session.commit()
            print("  Foreign key constraint failed - task with invalid user_id was created")
            # Clean up if it somehow succeeded
            session.rollback()
            return False
        except Exception as e:
            session.rollback()
            print(f"  Foreign key constraint working: {str(e)[:50]}...")
            return True


def main():
    """Run all tests"""
    print("Starting database foundation tests...\n")

    # Run all tests
    results = []
    results.append(test_database_connectivity())
    results.append(test_table_creation())
    results.append(test_user_crud())
    results.append(test_task_crud())
    results.append(test_relationships())
    results.append(test_foreign_key_constraint())

    # Summary
    print(f"\nTest Summary:")
    print(f"   Total tests: {len(results)}")
    print(f"   Passed: {sum(results)}")
    print(f"   Failed: {len(results) - sum(results)}")

    if all(results):
        print("All tests passed! Database foundation is working correctly.")
        return True
    else:
        print("Some tests failed. Please check the output above.")
        return False


if __name__ == "__main__":
    main()