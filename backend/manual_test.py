#!/usr/bin/env python3
"""
Simple test to create a task using the authenticated endpoint
"""
import requests
import json

def test_task_creation_manual():
    print("Manual test - please use the following curl command to test:")
    print()
    print("# First, register a user:")
    print("curl -X POST http://localhost:8000/api/v1/auth/register \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -d '{\"email\":\"test@example.com\",\"name\":\"Test User\",\"password\":\"testpass123\"}'")
    print()
    print("# Then, login with form data (not JSON):")
    print("# Use a tool like Postman or Python requests with form data")
    print()
    print("# Finally, create a task with the obtained token:")
    print("curl -X POST http://localhost:8000/api/v1/users/me/tasks \\")
    print("  -H 'Content-Type: application/json' \\")
    print("  -H 'Authorization: Bearer YOUR_ACCESS_TOKEN_HERE' \\")
    print("  -d '{\"title\":\"Test Task\",\"description\":\"Test Description\",\"priority\":\"low\",\"due_date\":\"2025-01-30T00:00:00\",\"project_id\":null,\"tag_ids\":[],\"reminder_enabled\":false}'")

if __name__ == "__main__":
    test_task_creation_manual()