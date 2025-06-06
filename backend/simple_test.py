import requests
import json

print("Starting JWT authentication test...")

try:
    # Test login and get token
    print("Attempting login...")
    login_data = {'username': 'testuser', 'password': 'password123'}
    r = requests.post('http://127.0.0.1:5000/auth/login', json=login_data)
    print(f"Login Status: {r.status_code}")

    if r.status_code == 200:
        response = r.json()
        token = response.get('access_token')
        print(f"Token received successfully (length: {len(token) if token else 0})")
        
        # Test protected route
        print("Testing protected route...")
        headers = {'Authorization': f'Bearer {token}'}
        protected_r = requests.get('http://127.0.0.1:5000/auth/protected', headers=headers)
        print(f"Protected route status: {protected_r.status_code}")
        if protected_r.status_code == 200:
            print(f"Protected route response: {protected_r.json()}")
        
        # Test profile
        print("Testing profile endpoint...")
        profile_r = requests.get('http://127.0.0.1:5000/auth/profile', headers=headers)
        print(f"Profile status: {profile_r.status_code}")
        if profile_r.status_code == 200:
            profile_data = profile_r.json()
            user = profile_data['user']
            print(f"User profile: {user['Username']} - {user['Vorname']} {user['Nachname']}")
        else:
            print(f"Profile error: {profile_r.text}")
    else:
        print(f"Login failed: {r.text}")

except Exception as e:
    print(f"Error during test: {e}")

print("Test completed.")
