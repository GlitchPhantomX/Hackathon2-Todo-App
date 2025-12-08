"""
Services for the Todo Application

This module contains the TaskService interface and all required methods
for task management operations.
"""

from typing import List, Optional
from models import Task


class TaskService:
    """
    Service class for managing tasks with all required CRUD operations.
    """

    def __init__(self):
        """Initialize the task service with an empty task list."""
        self.tasks: List[Task] = []
        self.next_id = 1

    def create_task(self, title: str, description: str = None) -> Task:
        """
        Creates a new task with the given title and optional description.

        Args:
            title: Required string (1-200 characters)
            description: Optional string

        Returns:
            Task object with assigned ID and timestamp

        Raises:
            ValueError: If title is not between 1-200 characters
        """
        if not self.validate_title(title):
            raise ValueError("Title must be between 1 and 200 characters")

        task = Task(
            id=self.next_id,
            title=title,
            description=description
        )

        self.tasks.append(task)
        self.next_id += 1

        return task

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieves all tasks in the system.

        Returns:
            List of all Task objects, sorted by ID
        """
        return sorted(self.tasks, key=lambda t: t.id)

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieves a specific task by its ID.

        Args:
            task_id: Integer ID of the task to retrieve

        Returns:
            Task object if found, None if not found
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def update_task(self, task_id: int, title: str = None, description: str = None) -> bool:
        """
        Updates an existing task's title and/or description.

        Args:
            task_id: Integer ID of the task to update
            title: Optional new title (if provided, must be 1-200 characters)
            description: Optional new description

        Returns:
            True if update successful, False if task not found

        Raises:
            ValueError: If title is provided but not between 1-200 characters
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        if title is not None:
            if not self.validate_title(title):
                raise ValueError("Title must be between 1 and 200 characters")
            task.title = title

        if description is not None:
            task.description = description

        return True

    def delete_task(self, task_id: int) -> bool:
        """
        Removes a task from the system.

        Args:
            task_id: Integer ID of the task to delete

        Returns:
            True if deletion successful, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        self.tasks.remove(task)
        return True

    def toggle_task_completion(self, task_id: int) -> bool:
        """
        Toggles the completion status of a task.

        Args:
            task_id: Integer ID of the task to toggle

        Returns:
            True if toggle successful, False if task not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.completed = not task.completed
        return True

    def validate_title(self, title: str) -> bool:
        """
        Validates that a title meets requirements.

        Args:
            title: String to validate

        Returns:
            True if valid (1-200 characters), False otherwise
        """
        return 1 <= len(title) <= 200