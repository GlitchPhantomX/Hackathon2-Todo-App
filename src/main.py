#!/usr/bin/env python3
"""
Todo Application - Command Line Interface

This is the main entry point for the todo console application.
Users can add, view, update, delete, and mark tasks as complete/incomplete.
"""

# Handle import for both direct execution and module import
try:
    from services import TaskService
except ImportError:
    from services import TaskService


def display_menu():
    """Display the main menu options."""
    print("\n" + "="*30)
    print("     TODO APPLICATION")
    print("="*30)
    print("1. ➕ Add Task")
    print("2. 📋 View Tasks")
    print("3. ✏️  Update Task")
    print("4. ❌ Delete Task")
    print("5. ✅ Mark Task Complete/Incomplete")
    print("0. 🚪 Exit")
    print("="*30)


def main():
    """Main application loop"""
    task_service = TaskService()

    while True:
        display_menu()
        try:
            choice = input("Enter your choice: ").strip()

            # Validate menu selection input
            if not choice.isdigit() and choice not in ["0", "1", "2", "3", "4", "5"]:
                print("Invalid choice. Please enter a number between 0-5.")
                continue

            if choice == "0":
                confirm_exit = input("Are you sure you want to exit? (y/N): ").strip().lower()
                if confirm_exit in ['y', 'yes']:
                    print("Thank you for using the Todo Application. Goodbye!")
                    break
                else:
                    print("Exit cancelled. Returning to main menu.")
            elif choice == "1":
                title = input("Enter task title (1-200 characters): ").strip()

                if not title:
                    print("Title cannot be empty.")
                    continue

                if len(title) > 200:
                    print("Title cannot exceed 200 characters.")
                    continue

                description = input("Enter task description (optional, press Enter to skip): ").strip()
                if not description:
                    description = None

                try:
                    task = task_service.create_task(title, description)
                    print(f"Task created successfully with ID: {task.id}")
                except ValueError as e:
                    print(f"Error creating task: {e}")
            elif choice == "2":
                tasks = task_service.get_all_tasks()

                if not tasks:
                    print("\n📭 No tasks found.")
                else:
                    print("\n📋 TASK LIST")
                    print("="*60)
                    for i, task in enumerate(tasks, 1):
                        status_icon = "✅" if task.completed else "⏳"
                        timestamp_str = task.format_timestamp()

                        print(f"{i:2d}. [{task.id:2d}] {status_icon} {task.title}")
                        print(f"    Description: {task.description if task.description else 'None'}")
                        print(f"    Created: {timestamp_str}")
                        print("-" * 60)
                    print(f"Total: {len(tasks)} task(s)")
            elif choice == "3":
                try:
                    task_id_input = input("Enter task ID to update: ").strip()
                    if not task_id_input:
                        print("Task ID cannot be empty.")
                        continue

                    task_id = int(task_id_input)
                except ValueError:
                    print("Invalid task ID. Please enter a number.")
                    continue

                # Check if task exists
                task = task_service.get_task_by_id(task_id)
                if task is None:
                    print(f"Task with ID {task_id} not found.")
                    continue

                print(f"Current task: {task}")

                new_title = input(f"Enter new title (current: '{task.title}', press Enter to keep current): ").strip()
                if not new_title:
                    new_title = None  # Keep current title
                elif len(new_title) > 200:
                    print("Title cannot exceed 200 characters.")
                    continue

                new_description = input(f"Enter new description (current: '{task.description}', press Enter to keep current): ").strip()
                if not new_description:
                    new_description = None  # Keep current description

                try:
                    success = task_service.update_task(task_id, new_title, new_description)
                    if success:
                        print("Task updated successfully.")
                    else:
                        print("Failed to update task.")
                except ValueError as e:
                    print(f"Error updating task: {e}")
            elif choice == "4":
                try:
                    task_id_input = input("Enter task ID to delete: ").strip()
                    if not task_id_input:
                        print("Task ID cannot be empty.")
                        continue

                    task_id = int(task_id_input)
                except ValueError:
                    print("Invalid task ID. Please enter a number.")
                    continue

                # Check if task exists
                task = task_service.get_task_by_id(task_id)
                if task is None:
                    print(f"Task with ID {task_id} not found.")
                    continue

                print(f"You are about to delete: {task}")
                confirm = input("Are you sure you want to delete this task? (y/N): ").strip().lower()

                if confirm in ['y', 'yes']:
                    success = task_service.delete_task(task_id)
                    if success:
                        print("Task deleted successfully.")
                    else:
                        print("Failed to delete task.")
                else:
                    print("Task deletion cancelled.")
            elif choice == "5":
                try:
                    task_id_input = input("Enter task ID to toggle completion status: ").strip()
                    if not task_id_input:
                        print("Task ID cannot be empty.")
                        continue

                    task_id = int(task_id_input)
                except ValueError:
                    print("Invalid task ID. Please enter a number.")
                    continue

                # Check if task exists
                task = task_service.get_task_by_id(task_id)
                if task is None:
                    print(f"Task with ID {task_id} not found.")
                    continue

                print(f"Current task: {task}")
                success = task_service.toggle_task_completion(task_id)
                if success:
                    new_status = "completed" if task.completed else "incomplete"
                    print(f"Task marked as {new_status}.")
                else:
                    print("Failed to toggle task completion status.")
            else:
                print("Invalid choice. Please enter a number between 0-5.")
        except KeyboardInterrupt:
            confirm_exit = input("\nAre you sure you want to exit? (y/N): ").strip().lower()
            if confirm_exit in ['y', 'yes']:
                print("Thank you for using the Todo Application. Goodbye!")
                break
            else:
                print("Exit cancelled. Returning to main menu.")
        except Exception as e:
            print(f"An error occurred: {e}")


if __name__ == "__main__":
    main()