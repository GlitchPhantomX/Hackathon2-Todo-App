#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test script to verify task creation endpoint works correctly
This script tests the POST /api/v1/users/me/tasks endpoint
"""
import requests
import json
import sys
import io

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Configuration
BASE_URL = "http://localhost:8000"
API_URL = f"{BASE_URL}/api/v1"

def get_auth_token():
    """Login with demo user and get JWT token"""
    print("📝 Logging in with demo user...")
    response = requests.post(
        f"{API_URL}/auth/login",
        data={
            "username": "demo@example.com",
            "password": "demo123"
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login successful!")
        return data.get("access_token")
    else:
        print(f"❌ Login failed: {response.status_code}")
        print(f"   Response: {response.text}")
        return None

def test_create_task(token):
    """Test creating a task"""
    print("\n📋 Testing task creation...")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    task_data = {
        "title": "Test Task from API",
        "description": "This is a test task created via API",
        "priority": "medium",
        "completed": False
    }

    print(f"📤 POST {API_URL}/users/me/tasks")
    print(f"   Headers: {headers}")
    print(f"   Body: {json.dumps(task_data, indent=2)}")

    response = requests.post(
        f"{API_URL}/users/me/tasks",
        headers=headers,
        json=task_data
    )

    print(f"\n📥 Response Status: {response.status_code}")
    print(f"   Response Headers: {dict(response.headers)}")

    if response.status_code == 201:
        data = response.json()
        print(f"✅ Task created successfully!")
        print(f"   Task ID: {data.get('id')}")
        print(f"   Title: {data.get('title')}")
        print(f"   Created At: {data.get('created_at')}")
        return data
    else:
        print(f"❌ Task creation failed!")
        print(f"   Response: {response.text}")
        return None

def test_cors_headers(token):
    """Test CORS headers on OPTIONS request"""
    print("\n🌐 Testing CORS preflight...")

    headers = {
        "Origin": "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
    }

    print(f"📤 OPTIONS {API_URL}/users/me/tasks")
    print(f"   Headers: {headers}")

    response = requests.options(
        f"{API_URL}/users/me/tasks",
        headers=headers
    )

    print(f"\n📥 Response Status: {response.status_code}")
    print(f"   CORS Headers:")
    for header, value in response.headers.items():
        if 'access-control' in header.lower():
            print(f"   - {header}: {value}")

    if response.status_code == 200:
        print(f"✅ CORS preflight successful!")
        return True
    else:
        print(f"❌ CORS preflight failed!")
        return False

def main():
    print("=" * 80)
    print("🧪 TASK CREATION TEST SUITE")
    print("=" * 80)

    # Step 1: Get authentication token
    token = get_auth_token()
    if not token:
        print("\n❌ Cannot proceed without authentication token")
        return

    # Step 2: Test CORS preflight
    test_cors_headers(token)

    # Step 3: Test task creation
    task = test_create_task(token)

    print("\n" + "=" * 80)
    if task:
        print("✅ ALL TESTS PASSED!")
    else:
        print("❌ SOME TESTS FAILED")
    print("=" * 80)

if __name__ == "__main__":
    main()
