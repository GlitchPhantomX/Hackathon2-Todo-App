import requests
import json

url = "http://localhost:8000/api/v1/auth/register"

data = {
    "email": "test@test.com",
    "name": "Test User",
    "password": "Test1234"
}

headers = {
    "Content-Type": "application/json",
    "Origin": "http://localhost:3000"
}

try:
    response = requests.post(url, json=data, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")