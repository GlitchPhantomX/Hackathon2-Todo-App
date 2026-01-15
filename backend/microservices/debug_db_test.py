#!/usr/bin/env python3
"""
Debug script to test database connection and verify tasks can be read
"""
import os
import sys
import inspect

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe())))
backend_dir = os.path.dirname(current_dir)  # Go up from microservices to backend

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Import using the same mechanism as the notification service
import importlib.util

# Load backend models
models_path = os.path.join(backend_dir, "models.py")
if not os.path.exists(models_path):
    print(f"Models file not found at: {models_path}")
    print(f"Files in backend dir: {os.listdir(backend_dir)}")
    sys.exit(1)
models_spec = importlib.util.spec_from_file_location("models", models_path)
models_module = importlib.util.module_from_spec(models_spec)
models_spec.loader.exec_module(models_module)
Task = models_module.Task

# Load db_utils from microservices
db_utils_path = os.path.join(current_dir, "db_utils.py")  # Current directory (microservices)
db_utils_spec = importlib.util.spec_from_file_location("db_utils", db_utils_path)
db_utils_module = importlib.util.module_from_spec(db_utils_spec)
db_utils_spec.loader.exec_module(db_utils_module)
get_db_session = db_utils_module.get_db_session

from datetime import datetime, timedelta

print("Testing database connection and task retrieval...")

try:
    with get_db_session() as db:
        # Get total count
        total_tasks = db.query(Task).count()
        print(f"Total tasks in database: {total_tasks}")

        # Get first 3 tasks
        sample_tasks = db.query(Task).limit(3).all()
        print(f"First 3 tasks:")
        for i, task in enumerate(sample_tasks):
            print(f"  {i+1}. ID={task.id}, Title='{task.title}', Due={task.due_date}, Completed={task.completed}, User={task.user_id}")

        # Test with current time window
        now = datetime.utcnow()
        future_time = now + timedelta(minutes=30)  # Same as notification window
        print(f"\nCurrent time: {now}")
        print(f"Future time (30 min): {future_time}")

        upcoming_tasks = db.query(Task).filter(
            Task.completed == False,
            Task.due_date.isnot(None),  # Ensure due_date is not None
            Task.due_date >= now,
            Task.due_date <= future_time
        ).all()

        print(f"\nTasks due in next 30 minutes: {len(upcoming_tasks)}")
        if upcoming_tasks:
            for task in upcoming_tasks:
                print(f"  - ID={task.id}, Title='{task.title}', Due={task.due_date}, User={task.user_id}")
        else:
            print("  No tasks found in the 30-minute window")

        # Check for any tasks with due dates in the future
        future_tasks = db.query(Task).filter(
            Task.completed == False,
            Task.due_date.isnot(None),
            Task.due_date > now
        ).limit(5).all()

        print(f"\nFirst 5 incomplete tasks with future due dates:")
        for task in future_tasks:
            print(f"  - ID={task.id}, Title='{task.title}', Due={task.due_date}, User={task.user_id}")

except Exception as e:
    print(f"Error connecting to database: {e}")
    import traceback
    traceback.print_exc()