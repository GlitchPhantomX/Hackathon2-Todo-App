import requests
import urllib.parse
import time

print("Waiting for server to start...")
time.sleep(3)  # Give the server time to start

try:
    # Register user
    print("Registering user...")
    register_resp = requests.post('http://127.0.0.1:8001/api/v1/auth/register', json={
        'email': 'finaltest@example.com',
        'name': 'Final Test',
        'password': 'testpass123'
    })
    print(f"Register status: {register_resp.status_code}")

    if register_resp.status_code == 200:
        # Login
        print("Logging in...")
        login_data = {'username': 'finaltest@example.com', 'password': 'testpass123'}
        login_resp = requests.post(
            'http://127.0.0.1:8001/api/v1/auth/login',
            data=urllib.parse.urlencode(login_data),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        print(f"Login status: {login_resp.status_code}")

        if login_resp.status_code == 200:
            token = login_resp.json()['access_token']
            print("Creating task...")

            # Test the original failing case from the problem statement
            task_payload = {
                "title": "Research New Framework",
                "description": "Research and evaluate new frontend framework options",
                "priority": "low",
                "due_date": "2025-01-30T00:00:00",
                "project_id": None,
                "tag_ids": [],
                # Note: reminder_enabled is not specified, should default to False
            }

            task_resp = requests.post(
                'http://127.0.0.1:8001/api/v1/users/me/tasks',
                json=task_payload,
                headers={'Authorization': f'Bearer {token}'}
            )

            print(f"Task creation status: {task_resp.status_code}")
            print(f"Task response: {task_resp.text}")

            if task_resp.status_code == 201:
                print("SUCCESS: Task created successfully!")
            else:
                print("FAILED: Task creation failed")
        else:
            print(f"Login failed: {login_resp.text}")
    else:
        print(f"Registration failed: {register_resp.text}")

except Exception as e:
    print(f"Error during test: {e}")
    import traceback
    traceback.print_exc()