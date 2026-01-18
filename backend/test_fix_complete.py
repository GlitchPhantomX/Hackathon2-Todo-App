import time
import requests
import json
import subprocess
import urllib.parse

def run_test():
    print("Testing the fix for task creation...")

    # Register user with unique email
    register_data = {
        'email': 'testuser2@example.com',
        'name': 'Test User 2',
        'password': 'testpass123'
    }
    register_resp = requests.post('http://127.0.0.1:8000/api/v1/auth/register', json=register_data)
    print(f"Register: {register_resp.status_code}")
    if register_resp.status_code != 200:
        print(f"Register response: {register_resp.text}")
        # If user exists, try logging in anyway
        login_data = {'username': 'testuser2@example.com', 'password': 'testpass123'}
    else:
        login_data = {'username': 'testuser2@example.com', 'password': 'testpass123'}

    # Login using form data
    login_resp = requests.post(
        'http://127.0.0.1:8000/api/v1/auth/login',
        data=urllib.parse.urlencode(login_data),
        headers={'Content-Type': 'application/x-www-form-urlencoded'}
    )
    print(f"Login: {login_resp.status_code}")
    if login_resp.status_code != 200:
        print(f"Login response: {login_resp.text}")
        return

    token = login_resp.json()['access_token']

    # Create task - this is the main test
    task_resp = requests.post(
        'http://127.0.0.1:8000/api/v1/users/me/tasks',
        json={
            'title': 'Test Task',
            'description': 'Test description',  # Having a description value
            'priority': 'low',
            'due_date': '2025-01-30T00:00:00',
            'project_id': None,
            'tag_ids': [],
            'reminder_enabled': False
        },
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f"Task Creation: {task_resp.status_code}")
    print(f"Task Response: {task_resp.text}")

    # Also test with no description (None/null)
    task_resp2 = requests.post(
        'http://127.0.0.1:8000/api/v1/users/me/tasks',
        json={
            'title': 'Test Task No Desc',
            'description': '',  # Empty string
            'priority': 'low',
            'due_date': '2025-01-30T00:00:00',
            'project_id': None,
            'tag_ids': [],
            'reminder_enabled': False
        },
        headers={'Authorization': f'Bearer {token}'}
    )
    print(f"Task Creation (empty desc): {task_resp2.status_code}")
    print(f"Task Response (empty desc): {task_resp2.text}")

if __name__ == "__main__":
    run_test()