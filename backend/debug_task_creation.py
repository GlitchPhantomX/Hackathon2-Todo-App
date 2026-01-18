import time
import requests
import json
import subprocess
import urllib.parse

def run_test():
    # Start the server in the background
    server_process = subprocess.Popen([
        'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000', '--log-level', 'info'
    ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1, universal_newlines=True)

    # Wait for server to start
    time.sleep(5)

    try:
        # Register user
        register_resp = requests.post('http://127.0.0.1:8000/api/v1/auth/register', json={
            'email': 'test@example.com',
            'name': 'Test User',
            'password': 'testpass123'
        })
        print(f"Register: {register_resp.status_code}")

        # Login using form data
        login_data = {'username': 'test@example.com', 'password': 'testpass123'}
        login_resp = requests.post(
            'http://127.0.0.1:8000/api/v1/auth/login',
            data=urllib.parse.urlencode(login_data),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        print(f"Login: {login_resp.status_code}")

        if login_resp.status_code == 200:
            token = login_resp.json()['access_token']

            # Create task
            task_resp = requests.post(
                'http://127.0.0.1:8000/api/v1/users/me/tasks',
                json={
                    'title': 'Test Task',
                    'description': 'Test description',
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

        # Read any server logs
        print("\n--- SERVER LOGS ---")
        # Poll for any output from server
        try:
            # Give a moment for any error logs to appear
            time.sleep(2)
            # We can't really read from a running subprocess easily, so let's just continue
        except:
            pass

    except Exception as e:
        print(f"Test error: {e}")
    finally:
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    run_test()