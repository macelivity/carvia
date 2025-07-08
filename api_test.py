# --- SQL to create test users (Mitglied, Mitarbeiter, Admin, Vehicle) ---
import sqlite3
import bcrypt

def create_test_users():
    # Create users in both databases
    databases = ['backend/test_database.db']
    
    for db_path in databases:
        print(f"Creating users in {db_path}...")
        try:
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            
            # Hash passwords properly (password = username)
            mitglied_hash = bcrypt.hashpw('mitglied'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            admin_hash = bcrypt.hashpw('admin'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            mitarbeiter_hash = bcrypt.hashpw('mitarbeiter'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            vehicle_hash = bcrypt.hashpw('vehicle'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            # Ensure roles exist first
            c.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (1, 'Mitglied')")
            c.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (2, 'Admin')")
            c.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (3, 'Mitarbeiter')")
            c.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (4, 'Vehicle')")
            
            # Delete existing test users first to avoid conflicts
            c.execute("DELETE FROM Nutzer WHERE Username IN ('mitglied', 'admin', 'mitarbeiter', 'vehicle')")
            
            # Create users with different roles (without specifying UserID to avoid conflicts)
            users = [
                ('mitglied', mitglied_hash, 1, 'Max', 'Mustermann', 'mitglied@example.com', '1990-01-01', '1990-01-01', None, None, None, '1', '12345', 'Stadt', 'Strasse', 1),
                ('admin', admin_hash, 3, 'Anna', 'Admin', 'admin@example.com', '1980-01-01', '1980-01-01', None, None, None, '2', '54321', 'Stadt', 'Strasse', 1),
                ('mitarbeiter', mitarbeiter_hash, 2, 'Mia', 'Mitarbeiter', 'mitarbeiter@example.com', '1985-01-01', '1985-01-01', None, None, None, '3', '67890', 'Stadt', 'Strasse', 1),
                ('vehicle', vehicle_hash, 4, 'Vehicle', 'System', 'vehicle@example.com', '2020-01-01', '2020-01-01', None, None, None, '4', '11111', 'Stadt', 'Strasse', 1),
            ]
            for user in users:
                c.execute("""
                    INSERT INTO Nutzer (Username, PasswordHash, RolleID, Vorname, Nachname, Email, Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC, HausNummer, PLZ, Ort, Strasse, Angenommen)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, user)
            conn.commit()
            conn.close()
            print(f"✓ Successfully created users in {db_path}")
        except Exception as e:
            print(f"✗ Error creating users in {db_path}: {e}")

# EXTENDED ENDPOINT OVERVIEW (all endpoints from all route files)
endpoint_overview = [
    # USER ENDPOINTS
    {"endpoint": "/user/search", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Search users by first and/or last name."},
    {"endpoint": "/user/<int:user_id>/reservations", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get all reservations for a user (Mitarbeiter) Get own reservations (Mitglied)"},
    {"endpoint": "/user/users", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all users"},
    {"endpoint": "/user/identitycheck", "method": "POST", "role": "Alle", "expected_result": "200", "desc": "Upload identity check file for user."},
    {"endpoint": "/user/licensecheck", "method": "POST", "role": "Alle", "expected_result": "200", "desc": "Upload license check file for user."},
    {"endpoint": "/user/credidworthycheck", "method": "POST", "role": "Alle", "expected_result": "200", "desc": "Check creditworthiness for user."},
    {"endpoint": "/user/pending_applications", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all users with pending applications."},
    {"endpoint": "/user/application_status", "method": "POST", "role": "Mitarbeiter", "expected_result": "200", "desc": "Set application status for user."},
    # TARIF ENDPOINTS
    {"endpoint": "/tarif/", "method": "GET", "role": "Mitarbeiter, Admin, Mitglied", "expected_result": "200", "desc": "Get all tariffs."},
    {"endpoint": "/tarif/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new tariff."},
    {"endpoint": "/tarif/<int:tarif_id>", "method": "GET", "role": "Mitarbeiter, Admin, Mitglied", "expected_result": "200", "desc": "Get tariff by ID."},
    {"endpoint": "/tarif/<int:tarif_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update tariff by ID."},
    {"endpoint": "/tarif/<int:tarif_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "200", "desc": "Delete tariff by ID."},
    # SCHADEN ENDPOINTS
    {"endpoint": "/schaden/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all damages."},
    {"endpoint": "/schaden/", "method": "POST", "role": "Mitarbeiter, Vehicle", "expected_result": "201", "desc": "Create a new damage entry."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "GET", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Get damage by ID."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "PUT", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Update damage by ID."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "DELETE", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Delete damage by ID."},
    # ROLLE ENDPOINTS
    {"endpoint": "/rolle/", "method": "GET", "role": "Mitarbeiter, Admin, Vehicle", "expected_result": "200", "desc": "Get all roles."},
    {"endpoint": "/rolle/", "method": "POST", "role": "Admin", "expected_result": "201", "desc": "Create a new role."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "GET", "role": "Mitarbeiter, Admin, Vehicle", "expected_result": "200", "desc": "Get role by ID."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "PUT", "role": "Admin", "expected_result": "200", "desc": "Update role by ID."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "DELETE", "role": "Admin", "expected_result": "200", "desc": "Delete role by ID."},
    # RESERVIERUNG ENDPOINTS
    {"endpoint": "/reservierung/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all reservations."},
    {"endpoint": "/reservierung/", "method": "POST", "role": "Mitglied, Mitarbeiter", "expected_result": "201", "desc": "Create a new reservation."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get reservation by ID."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "PUT", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Update reservation by ID."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "DELETE", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Delete reservation by ID."},
    {"endpoint": "/reservierung/user/<int:user_id>", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get all reservations for a user."},
    {"endpoint": "/reservierung/fahrzeug/<int:fahrzeug_id>", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all reservations for a vehicle."},
    {"endpoint": "/reservierung/<int:reservierung_id>/rechnung", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get invoice for reservation."},
    # RECHNUNG ENDPOINTS
    {"endpoint": "/rechnung/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all invoices."},
    {"endpoint": "/rechnung/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new invoice."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "GET", "role": "User, Mitarbeiter", "expected_result": "200", "desc": "Get invoice by ID."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update invoice by ID."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "200", "desc": "Delete invoice by ID."},
    # MODELL ENDPOINTS
    {"endpoint": "/modell/", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get all models."},
    {"endpoint": "/modell/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new model."},
    {"endpoint": "/modell/<int:modell_id>", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get model by ID."},
    {"endpoint": "/modell/<int:modell_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update model by ID."},
    {"endpoint": "/modell/<int:modell_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "200", "desc": "Delete model by ID."},
    # GEODATUM ENDPOINTS
    {"endpoint": "/geodatum/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all geodata."},
    {"endpoint": "/geodatum/", "method": "POST", "role": "Vehicle", "expected_result": "201", "desc": "Create a new geodatum entry."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get geodatum by ID."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "PUT", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Update geodatum by ID."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "DELETE", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Delete geodatum by ID."},
    # FAHRZEUG ENDPOINTS
    {"endpoint": "/fahrzeug/", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get all vehicles."},
    {"endpoint": "/fahrzeug/filter", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get filtered vehicles."},
    {"endpoint": "/fahrzeug/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new vehicle."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get vehicle by ID."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update vehicle by ID."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "200", "desc": "Delete vehicle by ID."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>/location", "method": "GET", "role": "Mitglied, Mitarbeiter, Admin", "expected_result": "200", "desc": "Get vehicle location by ID."},
    # AUTH ENDPOINTS
    {"endpoint": "/auth/register", "method": "POST", "role": "Alle", "expected_result": "201", "desc": "Register a new user."},
    {"endpoint": "/auth/login", "method": "POST", "role": "Alle", "expected_result": "200", "desc": "Login and get JWT token."},
    {"endpoint": "/auth/users", "method": "GET", "role": "Mitarbeiter, Admin", "expected_result": "200", "desc": "Get all users (protected)."},
    {"endpoint": "/auth/users/not-approved", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all not approved users."},
    {"endpoint": "/auth/users/<int:user_id>/approve", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Approve user by ID."},
    {"endpoint": "/auth/refresh", "method": "POST", "role": "Alle (with refresh token)", "expected_result": "200", "desc": "Refresh JWT token."},
    {"endpoint": "/auth/profile", "method": "GET", "role": "Authenticated", "expected_result": "200", "desc": "Get current user profile."},
    {"endpoint": "/auth/profile", "method": "PUT", "role": "Authenticated", "expected_result": "200", "desc": "Update current user profile."},
    {"endpoint": "/auth/change-password", "method": "PUT", "role": "Authenticated", "expected_result": "200", "desc": "Change password for current user."},
]

import requests

BASE_URL = "http://localhost:5000/api"  # Adjust if your backend runs on a different port

# Helper: login and get JWT token for a user
USER_CREDENTIALS = {
    "mitglied": {"username": "mitglied", "password": "mitglied"},
    "admin": {"username": "admin", "password": "admin"},
    "mitarbeiter": {"username": "mitarbeiter", "password": "mitarbeiter"},
    "vehicle": {"username": "vehicle", "password": "vehicle"},
}

def get_jwt_token(username, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        return resp.json()["access_token"]
    return None

def get_refresh_token(username, password):
    resp = requests.post(f"{BASE_URL}/auth/login", json={"username": username, "password": password})
    if resp.status_code == 200:
        return resp.json().get("refresh_token")
    return None

def test_endpoint(endpoint_info, token=None, test_data=None):
    """Test a single endpoint with appropriate authentication and data"""
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    # Replace placeholders with test IDs
    url = endpoint_info["endpoint"]
    url = url.replace("<int:user_id>", "1")
    url = url.replace("<int:fahrzeug_id>", "1") 
    url = url.replace("<int:reservierung_id>", "1")
    url = url.replace("<int:rechnung_id>", "1")
    url = url.replace("<int:tarif_id>", "1")
    url = url.replace("<int:schaden_id>", "1")
    url = url.replace("<int:rolle_id>", "1")
    url = url.replace("<int:modell_id>", "1")
    url = url.replace("<int:geodatum_id>", "1")
    
    full_url = BASE_URL + url
    method = endpoint_info["method"]
    
    try:
        if method == "GET":
            # Add query params for search endpoints
            if "/search" in url:
                params = {"vorname": "Max", "nachname": "Mustermann"}
                resp = requests.get(full_url, headers=headers, params=params)
            elif "/filter" in url:
                params = {"fahrzeugtyp": "SUV"}
                resp = requests.get(full_url, headers=headers, params=params)
            else:
                resp = requests.get(full_url, headers=headers)
                
        elif method == "POST":
            # Special handling for file upload endpoints
            if "/identitycheck" in url or "/licensecheck" in url:
                # Create a minimal PNG file in memory (1x1 pixel PNG)
                import io
                
                # Minimal PNG file data (1x1 red pixel)
                png_data = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00\x07-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
                
                files = {'file': ('test.png', io.BytesIO(png_data), 'image/png')}
                data = {'user_id': '1'}
                
                # Don't include Content-Type in headers for multipart/form-data
                file_headers = {}
                if token:
                    file_headers["Authorization"] = f"Bearer {token}"
                
                resp = requests.post(full_url, headers=file_headers, files=files, data=data)
            else:
                if test_data:
                    resp = requests.post(full_url, headers=headers, json=test_data)
                else:
                    resp = requests.post(full_url, headers=headers, json={})
                
        elif method == "PUT":
            if test_data:
                resp = requests.put(full_url, headers=headers, json=test_data)
            else:
                resp = requests.put(full_url, headers=headers, json={})
                
        elif method == "DELETE":
            resp = requests.delete(full_url, headers=headers)
            
        return resp
    except requests.exceptions.RequestException as e:
        print(f"Request failed for {full_url}: {e}")
        return None

def get_test_data_for_endpoint(endpoint):
    """Get appropriate test data for POST/PUT requests"""
    test_data = {}
    
    if "/tarif" in endpoint:
        test_data = {
            "Name": "Test Tarif",
            "Freikilometer": 100,
            "Versicherungsschutz": "Vollkasko",
            "Multiplikator": 1.2
        }
    elif "/schaden" in endpoint:
        test_data = {
            "FahrzeugID": 1,
            "Beschreibung": "Test Schaden"
        }
    elif "/rolle" in endpoint:
        test_data = {
            "Bedeutung": "Test Rolle"
        }
    elif "/reservierung" in endpoint:
        test_data = {
            "FahrzeugID": 1,
            "UserID": 1,
            "RechnungID": 1,
            "TarifID": 1,
            "StartDatum": "2025-07-15",
            "EndDatum": "2025-07-16",
            "Abholort": "Test Ort",
            "AbholPlz": "12345",
            "Rueckgabeort": "Test Ort",
            "RueckgabePlz": "12345"
        }
    elif "/rechnung" in endpoint:
        test_data = {
            "ReservierungID": 1,
            "UserID": 1,
            "FahrzeugID": 1,
            "Preis": 99.99,
            "Bezahlt": False,
            "Austellungsdatum": "2025-07-08"
        }
    elif "/modell" in endpoint:
        test_data = {
            "ModellName": "Test Model",
            "Hersteller": "Test Manufacturer",
            "Fahrzeugtyp": "SUV",
            "Getriebeart": "Automatik",
            "Kraftstoffart": "Benzin",
            "Leistung": 150,
            "Türen": 4,
            "Sitze": 5,
            "Kofferraumvolumen": 500,
            "Stundenpreis": 25.50
        }
    elif "/geodatum" in endpoint:
        test_data = {
            "FahrzeugID": 1,
            "Longitude": 11.5820,
            "Latitude": 48.1351,
            "Zeit": "2025-07-08T12:00:00"
        }
    elif "/fahrzeug" in endpoint:
        test_data = {
            "ModellID": 1,
            "Kennzeichen": "M-TEST-123",
            "Reperaturzustand": "Gut",
            "Aktiv": True,
            "Reifen": "Sommerreifen",
            "Kilometerstand": 50000,
            "LetzterService": "2025-06-01",
            "TuevDatum": "2026-07-01",
            "ErstzulassungsDatum": "2020-01-01"
        }
    elif "/auth/register" in endpoint:
        test_data = {
            "username": "testuser",
            "password": "testpass123",
            "rolle_id": 1,
            "email": "test@example.com",
            "vorname": "Test",
            "nachname": "User",
            "geburtsdatum": "1990-01-01",
            "fuehrerschein": "B",
            "iban": "DE89370400440532013000",
            "bic": "COBADEFFXXX",
            "hausnummer": "1",
            "plz": "12345",
            "ort": "Teststadt",
            "strasse": "Teststraße"
        }
    elif "/auth/profile" in endpoint:
        test_data = {
            "vorname": "Updated",
            "nachname": "Name",
            "email": "updated@example.com"
        }
    elif "/auth/change-password" in endpoint:
        test_data = {
            "old_password": "mitglied",
            "new_password": "newpassword123"
        }
    elif "/user/identitycheck" in endpoint or "/user/licensecheck" in endpoint:
        # These endpoints use file uploads, handled in test_endpoint function
        test_data = None
    elif "/user/credidworthycheck" in endpoint:
        test_data = {
            "user_id": 1,
            "name": "Max Mustermann",
            "bic": "COBADEFFXXX",
            "iban": "DE89370400440532013000"
        }
    elif "/user/application_status" in endpoint:
        test_data = {
            "user_id": 1,
            "accepted": True
        }
    elif "/auth/users" in endpoint and "approve" in endpoint:
        test_data = {}
    elif "/auth/refresh" in endpoint:
        test_data = {}
    
    return test_data

def test_all_endpoints():
    """Test all endpoints with different user roles"""
    print("=== STARTING COMPREHENSIVE API ENDPOINT TESTING ===\n")
    
    # Get tokens for all user types
    tokens = {}
    for role, creds in USER_CREDENTIALS.items():
        token = get_jwt_token(creds["username"], creds["password"])
        if token:
            tokens[role] = token
            print(f"✓ Successfully got token for {role}")
        else:
            print(f"✗ Failed to get token for {role}")
    
    # Get refresh token for testing
    refresh_token = get_refresh_token("mitglied", "mitglied")
    
    print(f"\n=== Testing {len(endpoint_overview)} endpoints ===\n")
    
    results = []
    
    for i, endpoint_info in enumerate(endpoint_overview, 1):
        print(f"[{i}/{len(endpoint_overview)}] Testing {endpoint_info['method']} {endpoint_info['endpoint']}")
        print(f"    Description: {endpoint_info['desc']}")
        print(f"    Required Role: {endpoint_info['role']}")
        print(f"    Expected Status: {endpoint_info['expected_result']}")
        
        # Determine which token to use based on required role
        token = None
        role_used = "None"
        
        if endpoint_info['role'] == 'Alle':
            token = None  # No authentication needed
            role_used = "Public"
        elif 'Mitglied' in endpoint_info['role'] and 'mitglied' in tokens:
            token = tokens['mitglied']
            role_used = "Mitglied"
        elif 'Mitarbeiter' in endpoint_info['role'] and 'mitarbeiter' in tokens:
            token = tokens['mitarbeiter']
            role_used = "Mitarbeiter"
        elif 'Admin' in endpoint_info['role'] and 'admin' in tokens:
            token = tokens['admin']
            role_used = "Admin"
        elif 'Vehicle' in endpoint_info['role'] and 'vehicle' in tokens:
            token = tokens['vehicle']
            role_used = "Vehicle"
        elif 'Authenticated' in endpoint_info['role'] and 'mitglied' in tokens:
            token = tokens['mitglied']
            role_used = "Mitglied (any authenticated user)"
        elif 'refresh token' in endpoint_info['role'] and refresh_token:
            # Special case for refresh endpoint
            token = refresh_token
            role_used = "Refresh Token"
        
        # Get test data for POST/PUT requests
        test_data = None
        if endpoint_info['method'] in ['POST', 'PUT']:
            test_data = get_test_data_for_endpoint(endpoint_info['endpoint'])
        
        # Make the request
        response = test_endpoint(endpoint_info, token, test_data)
        expected = endpoint_info['expected_result']
        
        if response:
            status = response.status_code
            
            
            # Check if status matches expected
            if str(status) == expected:
                result = "✓ PASS"
                color = "\033[92m"  # Green
            else:
                result = "✗ FAIL"
                color = "\033[91m"  # Red
            
            print(f"    Token Used: {role_used}")
            print(f"    {color}Result: {result} (Status: {status}, Expected: {expected})\033[0m")
            
            # Try to parse response
            try:
                json_resp = response.json()
                if len(str(json_resp)) < 200:  # Only show short responses
                    print(f"    Response: {json_resp}")
            except:
                if len(response.text) < 200:
                    print(f"    Response: {response.text}")
            
            results.append({
                'endpoint': endpoint_info['endpoint'],
                'method': endpoint_info['method'],
                'role_used': role_used,
                'expected': expected,
                'actual': status,
                'passed': str(status) == expected,
                'desc': endpoint_info['desc']
            })
        else:
            print(f"    \033[91m✗ FAIL (Request failed)\033[0m")
            results.append({
                'endpoint': endpoint_info['endpoint'],
                'method': endpoint_info['method'],
                'role_used': role_used,
                'expected': expected,
                'actual': 'ERROR',
                'passed': False,
                'desc': endpoint_info['desc']
            })
        
        print()  # Empty line for readability
    
    # Summary
    passed = sum(1 for r in results if r['passed'])
    total = len(results)
    
    print("=== TEST SUMMARY ===")
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    # Show failed tests
    failed_tests = [r for r in results if not r['passed']]
    if failed_tests:
        print(f"\n=== FAILED TESTS ({len(failed_tests)}) ===")
        for test in failed_tests:
            print(f"✗ {test['method']} {test['endpoint']}")
            print(f"  Expected: {test['expected']}, Got: {test['actual']}")
            print(f"  Role: {test['role_used']}")
            print(f"  Description: {test['desc']}")
            print()
if __name__ == "__main__":
    # Create test users first
    print("Creating test users...")
    create_test_users()
    print("Test users created successfully!")
    print()
    
    # Test all endpoints
    test_all_endpoints()
