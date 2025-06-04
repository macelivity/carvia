#!/usr/bin/env python3
"""
Simple test script for JWT authentication endpoints
"""
import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_user_registration():
    """Test user registration"""
    print("Testing user registration...")
    
    user_data = {
        "username": "testuserss",
        "password": "password123",
        "vorname": "Max",
        "nachname": "Mustermann",
        "geburtsdatum": "1990-01-01",
        "rolle_id": 1,
        "hausnummer": "123",
        "plz": "12345",
        "ort": "Berlin",
        "strasse": "Musterstraße"
    }
    
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print(f"Registration Response: {response.status_code}")
    print(f"Response Body: {response.json()}")
    return response.status_code == 201

def test_user_login():
    """Test user login"""
    print("\nTesting user login...")
    
    login_data = {
        "username": "testuserss",
        "password": "password123"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login Response: {response.status_code}")
    print(f"Response Body: {response.json()}")
    
    if response.status_code == 200:
        return response.json().get("access_token")
    return None

def test_protected_route(token):
    """Test protected route with JWT token"""
    print("\nTesting protected route...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/protected", headers=headers)
    print(f"Protected Route Response: {response.status_code}")
    print(f"Response Body: {response.json()}")
    return response.status_code == 200

def test_user_profile(token):
    """Test getting user profile"""
    print("\nTesting user profile...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
    print(f"Profile Response: {response.status_code}")
    print(f"Response Body: {response.json()}")
    return response.status_code == 200

if __name__ == "__main__":
    print("Starting JWT Authentication Tests...")
    
    # Test registration
    registration_success = test_user_registration()
    
    if registration_success:
        # Test login
        access_token = test_user_login()
        
        if access_token:
            # Test protected routes
            test_protected_route(access_token)
            test_user_profile(access_token)
            print(f"\n✅ All tests completed! Access token: {access_token[:50]}...")
        else:
            print("❌ Login failed")
    else:
        print("❌ Registration failed")
