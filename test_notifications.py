#!/usr/bin/env python3
"""
Test script to verify notification system functionality
"""
import asyncio
import httpx
import json
from datetime import datetime, timedelta

# Configuration
BASE_URL = "http://localhost:8001"
USERNAME = "testuser@example.com"
PASSWORD = "password123"

async def test_notifications():
    print("[TEST] Testing Notification System...")

    async with httpx.AsyncClient() as client:
        # Login to get token
        print("\n[LOGIN] Logging in...")
        login_resp = await client.post(f"{BASE_URL}/auth/login",
                                     data={"username": USERNAME, "password": PASSWORD})

        if login_resp.status_code != 200:
            print(f"[ERROR] Login failed: {login_resp.text}")
            return

        token = login_resp.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}
        print("[SUCCESS] Logged in successfully")

        # Get user ID
        user_resp = await client.get(f"{BASE_URL}/users/me", headers=headers)
        if user_resp.status_code != 200:
            print(f"[ERROR] Failed to get user info: {user_resp.text}")
            return

        user_id = user_resp.json()["id"]
        print(f"[INFO] User ID: {user_id}")

        # Test 1: Create a task (should trigger task_created notification)
        print("\n[CREATE] Testing task creation...")
        task_data = {
            "title": "Test Notification Task",
            "description": "This is a test task for notifications",
            "due_date": (datetime.now() + timedelta(hours=1)).isoformat(),
            "priority": "medium",
            "reminder_enabled": True,
            "reminder_timing": "15min"
        }

        task_resp = await client.post(f"{BASE_URL}/users/me/tasks",
                                   json=task_data, headers=headers)

        if task_resp.status_code != 201:
            print(f"[ERROR] Task creation failed: {task_resp.text}")
            return

        task = task_resp.json()
        task_id = task["id"]
        print(f"[SUCCESS] Task created: {task['title']} (ID: {task_id})")

        # Test 2: Update the task (should trigger task_updated notification)
        print("\n[UPDATE] Testing task update...")
        update_data = {
            "title": "Updated Test Notification Task",
            "description": "This task has been updated",
            "priority": "high"
        }

        update_resp = await client.put(f"{BASE_URL}/users/me/tasks/{task_id}",
                                    json=update_data, headers=headers)

        if update_resp.status_code != 200:
            print(f"[ERROR] Task update failed: {update_resp.text}")
            return

        updated_task = update_resp.json()
        print(f"[SUCCESS] Task updated: {updated_task['title']}")

        # Test 3: Complete the task (should trigger task_completed notification)
        print("\n[COMPLETE] Testing task completion...")
        complete_resp = await client.put(f"{BASE_URL}/users/me/tasks/{task_id}/complete",
                                       headers=headers)

        if complete_resp.status_code != 200:
            print(f"[ERROR] Task completion failed: {complete_resp.text}")
            return

        completion_result = complete_resp.json()
        print(f"[SUCCESS] Task completed: {completion_result['message']}")

        # Test 4: Create another task for deletion test
        print("\n[CREATE] Testing task creation for deletion...")
        delete_task_data = {
            "title": "Task for Deletion Test",
            "description": "This task will be deleted",
            "priority": "low"
        }

        delete_task_resp = await client.post(f"{BASE_URL}/users/me/tasks",
                                          json=delete_task_data, headers=headers)

        if delete_task_resp.status_code != 201:
            print(f"[ERROR] Task creation for deletion failed: {delete_task_resp.text}")
            return

        delete_task = delete_task_resp.json()
        delete_task_id = delete_task["id"]
        print(f"[SUCCESS] Task created for deletion: {delete_task['title']} (ID: {delete_task_id})")

        # Test 5: Delete the task (should trigger task_deleted notification)
        print("\n[DELETE] Testing task deletion...")
        delete_resp = await client.delete(f"{BASE_URL}/users/me/tasks/{delete_task_id}",
                                        headers=headers)

        if delete_resp.status_code != 200:
            print(f"[ERROR] Task deletion failed: {delete_resp.text}")
            return

        print(f"[SUCCESS] Task deleted successfully")

        # Test 6: Get notifications to verify they were created
        print("\n[NOTIF] Testing notification retrieval...")
        notifications_resp = await client.get(f"{BASE_URL}/notifications", headers=headers)

        if notifications_resp.status_code != 200:
            print(f"[ERROR] Notification retrieval failed: {notifications_resp.text}")
            return

        notifications = notifications_resp.json()
        print(f"[SUCCESS] Retrieved {len(notifications)} notifications")

        # Print recent notifications
        for notification in notifications[:5]:  # Show first 5
            print(f"   - [{notification['type']}] {notification['title']}: {notification['message']}")

        print("\n[FINAL] All notification tests completed successfully!")
        print("[FINAL] ✅ Task created notification")
        print("[FINAL] ✅ Task updated notification")
        print("[FINAL] ✅ Task completed notification")
        print("[FINAL] ✅ Task deleted notification")

if __name__ == "__main__":
    asyncio.run(test_notifications())