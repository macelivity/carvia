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
                ('admin', admin_hash, 2, 'Anna', 'Admin', 'admin@example.com', '1980-01-01', '1980-01-01', None, None, None, '2', '54321', 'Stadt', 'Strasse', 1),
                ('mitarbeiter', mitarbeiter_hash, 3, 'Mia', 'Mitarbeiter', 'mitarbeiter@example.com', '1985-01-01', '1985-01-01', None, None, None, '3', '67890', 'Stadt', 'Strasse', 1),
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
    {"endpoint": "/tarif/<int:tarif_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "204", "desc": "Delete tariff by ID."},
    # SCHADEN ENDPOINTS
    {"endpoint": "/schaden/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all damages."},
    {"endpoint": "/schaden/", "method": "POST", "role": "Mitarbeiter, Vehicle", "expected_result": "201", "desc": "Create a new damage entry."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "GET", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Get damage by ID."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "PUT", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Update damage by ID."},
    {"endpoint": "/schaden/<int:schaden_id>", "method": "DELETE", "role": "Mitarbeiter, Vehicle", "expected_result": "204", "desc": "Delete damage by ID."},
    # ROLLE ENDPOINTS
    {"endpoint": "/rolle/", "method": "GET", "role": "Mitarbeiter, Admin, Vehicle", "expected_result": "200", "desc": "Get all roles."},
    {"endpoint": "/rolle/", "method": "POST", "role": "Admin", "expected_result": "201", "desc": "Create a new role."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "GET", "role": "Mitarbeiter, Admin, Vehicle", "expected_result": "200", "desc": "Get role by ID."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "PUT", "role": "Admin", "expected_result": "200", "desc": "Update role by ID."},
    {"endpoint": "/rolle/<int:rolle_id>", "method": "DELETE", "role": "Admin", "expected_result": "204", "desc": "Delete role by ID."},
    # RESERVIERUNG ENDPOINTS
    {"endpoint": "/reservierung/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all reservations."},
    {"endpoint": "/reservierung/", "method": "POST", "role": "Mitglied, Mitarbeiter", "expected_result": "201", "desc": "Create a new reservation."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get reservation by ID."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "PUT", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Update reservation by ID."},
    {"endpoint": "/reservierung/<int:reservierung_id>", "method": "DELETE", "role": "Mitglied, Mitarbeiter", "expected_result": "204", "desc": "Delete reservation by ID."},
    {"endpoint": "/reservierung/user/<int:user_id>", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get all reservations for a user."},
    {"endpoint": "/reservierung/fahrzeug/<int:fahrzeug_id>", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all reservations for a vehicle."},
    {"endpoint": "/reservierung/<int:reservierung_id>/rechnung", "method": "GET", "role": "Mitglied, Mitarbeiter", "expected_result": "200", "desc": "Get invoice for reservation."},
    # RECHNUNG ENDPOINTS
    {"endpoint": "/rechnung/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all invoices."},
    {"endpoint": "/rechnung/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new invoice."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "GET", "role": "User, Mitarbeiter", "expected_result": "200", "desc": "Get invoice by ID."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update invoice by ID."},
    {"endpoint": "/rechnung/<int:rechnung_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "204", "desc": "Delete invoice by ID."},
    # MODELL ENDPOINTS
    {"endpoint": "/modell/", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get all models."},
    {"endpoint": "/modell/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new model."},
    {"endpoint": "/modell/<int:modell_id>", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get model by ID."},
    {"endpoint": "/modell/<int:modell_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update model by ID."},
    {"endpoint": "/modell/<int:modell_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "204", "desc": "Delete model by ID."},
    # GEODATUM ENDPOINTS
    {"endpoint": "/geodatum/", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get all geodata."},
    {"endpoint": "/geodatum/", "method": "POST", "role": "Vehicle", "expected_result": "201", "desc": "Create a new geodatum entry."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "GET", "role": "Mitarbeiter", "expected_result": "200", "desc": "Get geodatum by ID."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "PUT", "role": "Mitarbeiter, Vehicle", "expected_result": "200", "desc": "Update geodatum by ID."},
    {"endpoint": "/geodatum/<int:geodatum_id>", "method": "DELETE", "role": "Mitarbeiter, Vehicle", "expected_result": "204", "desc": "Delete geodatum by ID."},
    # FAHRZEUG ENDPOINTS
    {"endpoint": "/fahrzeug/", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get all vehicles."},
    {"endpoint": "/fahrzeug/filter", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get filtered vehicles."},
    {"endpoint": "/fahrzeug/", "method": "POST", "role": "Mitarbeiter", "expected_result": "201", "desc": "Create a new vehicle."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "GET", "role": "Alle", "expected_result": "200", "desc": "Get vehicle by ID."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "PUT", "role": "Mitarbeiter", "expected_result": "200", "desc": "Update vehicle by ID."},
    {"endpoint": "/fahrzeug/<int:fahrzeug_id>", "method": "DELETE", "role": "Mitarbeiter", "expected_result": "204", "desc": "Delete vehicle by ID."},
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

def should_role_have_access(endpoint_role_desc, role_name):
    """
    Determine if a role should have access to an endpoint based on the role description
    """
    role_desc = endpoint_role_desc.lower()
    
    # Handle "Alle" - everyone should have access
    if 'alle' in role_desc:
        return True
    
    # Handle "Authenticated" - any logged in user
    if 'authenticated' in role_desc:
        return True
    
    # Handle specific role mentions
    if role_name in role_desc:
        return True
    
    # Handle "User" referring to "Mitglied"
    if 'user' in role_desc and role_name == 'mitglied':
        return True
    
    return False

def test_single_endpoint_role(endpoint_info, role_name, token, test_count):
    """
    Test a single endpoint with a specific role and return detailed results
    """
    # Determine if this role should have access
    should_have_access = should_role_have_access(endpoint_info['role'], role_name)
    
    # Get test data for POST/PUT requests
    test_data = None
    if endpoint_info['method'] in ['POST', 'PUT']:
        test_data = get_test_data_for_endpoint(endpoint_info['endpoint'])
    
    # For endpoints that allow "Alle", we may test without token for some roles
    test_token = token
    if 'alle' in endpoint_info['role'].lower() and role_name == 'mitglied':
        test_token = None  # Test one role without token for public endpoints
    
    # Make the request
    response = test_endpoint(endpoint_info, test_token, test_data)
    
    if response:
        status = response.status_code
        
        # Determine if test passed based on authorization logic
        test_passed = False
        expected_behavior = ""
        
        if should_have_access:
            # Role should have access - success codes (200, 201, 204) are good
            if status in [200, 201, 204]:
                test_passed = True
                expected_behavior = "ALLOWED (success)"
            elif status in [400, 404, 422]:
                # These might be acceptable for endpoints that need valid data
                test_passed = True
                expected_behavior = f"ALLOWED (got {status} - might be data validation)"
            else:
                test_passed = False
                expected_behavior = f"ALLOWED (but got {status})"
        else:
            # Role should NOT have access - 403 Forbidden or 401 Unauthorized expected
            if status == 403:
                test_passed = True
                expected_behavior = "DENIED (403 as expected)"
            elif status == 401:
                test_passed = True
                expected_behavior = "DENIED (401 as expected)"
            else:
                test_passed = False
                expected_behavior = f"DENIED (but got {status} instead of 403/401)"
        
        # Color coding for display
        if test_passed:
            result_display = "✓ PASS"
            color = "\033[92m"  # Green
        else:
            result_display = "✗ FAIL"
            color = "\033[91m"  # Red
        
        print(f"    [{test_count}] Role: {role_name.upper():<12} | {color}{result_display:<8}\033[0m | Status: {status:<3} | {expected_behavior}")
        
        # Show response for failures or interesting cases
        if not test_passed or status not in [200, 201, 204, 403, 401, 400, 404, 422]:
            try:
                json_resp = response.json()
                if len(str(json_resp)) < 150:
                    print(f"        Response: {json_resp}")
            except:
                if len(response.text) < 150:
                    print(f"        Response: {response.text}")
        
        return {
            'endpoint': endpoint_info['endpoint'],
            'method': endpoint_info['method'],
            'role_tested': role_name,
            'should_have_access': should_have_access,
            'status_code': status,
            'test_passed': test_passed,
            'expected_behavior': expected_behavior,
            'desc': endpoint_info['desc']
        }
    else:
        print(f"    [{test_count}] Role: {role_name.upper():<12} | \033[91m✗ FAIL\033[0m     | ERROR | Request failed")
        return {
            'endpoint': endpoint_info['endpoint'],
            'method': endpoint_info['method'],
            'role_tested': role_name,
            'should_have_access': should_have_access,
            'status_code': 'ERROR',
            'test_passed': False,
            'expected_behavior': 'Request failed',
            'desc': endpoint_info['desc']
        }

def test_all_endpoints():
    """
    Test all endpoints with ALL user roles to validate authorization.
    Each endpoint gets 4 tests (one per role), for a total of 64 tests.
    """
    print("=== STARTING COMPREHENSIVE AUTHORIZATION TESTING ===")
    print("Testing each endpoint with 4 different roles to validate access control\n")
    
    # Get tokens for all user types
    tokens = {}
    print("🔑 Authenticating users...")
    for role, creds in USER_CREDENTIALS.items():
        token = get_jwt_token(creds["username"], creds["password"])
        if token:
            tokens[role] = token
            print(f"   ✓ Successfully got token for {role}")
        else:
            tokens[role] = None
            print(f"   ✗ Failed to get token for {role}")
    
    total_endpoints = len(endpoint_overview)
    total_tests = total_endpoints * 4
    print(f"\n🧪 Running {total_tests} authorization tests ({total_endpoints} endpoints × 4 roles)")
    print("=" * 80 + "\n")
    
    results = []
    test_count = 0
    
    for endpoint_idx, endpoint_info in enumerate(endpoint_overview, 1):
        print(f"[{endpoint_idx}/{total_endpoints}] 🔍 Testing {endpoint_info['method']} {endpoint_info['endpoint']}")
        print(f"    📋 Description: {endpoint_info['desc']}")
        print(f"    🎭 Allowed Roles: {endpoint_info['role']}")
        print()
        
        # Test with each role (4 tests per endpoint)
        for role_name in ['mitglied', 'mitarbeiter', 'admin', 'vehicle']:
            test_count += 1
            token = tokens.get(role_name)
            
            result = test_single_endpoint_role(endpoint_info, role_name, token, test_count)
            results.append(result)
        
        print()  # Empty line between endpoints
    
    # Generate comprehensive summary
    passed = sum(1 for r in results if r['test_passed'])
    failed = len(results) - passed
    
    print("=" * 80)
    print("🎯 COMPREHENSIVE AUTHORIZATION TEST SUMMARY")
    print("=" * 80)
    print(f"📊 Total Tests Run: {len(results)}")
    print(f"✅ Tests Passed: {passed}")
    print(f"❌ Tests Failed: {failed}")
    print(f"📈 Success Rate: {(passed/len(results))*100:.1f}%")
    
    # Breakdown by role
    print(f"\n🎭 BREAKDOWN BY ROLE")
    print("-" * 40)
    for role in ['mitglied', 'mitarbeiter', 'admin', 'vehicle']:
        role_results = [r for r in results if r['role_tested'] == role]
        role_passed = sum(1 for r in role_results if r['test_passed'])
        role_failed = len(role_results) - role_passed
        success_rate = (role_passed/len(role_results))*100 if role_results else 0
        print(f"{role.upper():<12}: {role_passed:>2}/{len(role_results)} passed ({success_rate:>5.1f}%) | {role_failed} failed")
    
    # Breakdown by endpoint
    print(f"\n🛡️ BREAKDOWN BY ENDPOINT")
    print("-" * 60)
    for endpoint_info in endpoint_overview:
        endpoint_results = [r for r in results if 
                          r['endpoint'] == endpoint_info['endpoint'] and 
                          r['method'] == endpoint_info['method']]
        endpoint_passed = sum(1 for r in endpoint_results if r['test_passed'])
        endpoint_failed = len(endpoint_results) - endpoint_passed
        success_rate = (endpoint_passed/len(endpoint_results))*100 if endpoint_results else 0
        
        status_icon = "✅" if endpoint_failed == 0 else "⚠️" if endpoint_failed <= 2 else "❌"
        print(f"{status_icon} {endpoint_info['method']:<6} {endpoint_info['endpoint']:<35} | {endpoint_passed}/4 passed ({success_rate:>5.1f}%)")
    
    # Show failed authorization tests in detail
    failed_tests = [r for r in results if not r['test_passed']]
    if failed_tests:
        print(f"\nFAILED AUTHORIZATION TESTS ({len(failed_tests)})")
        print("=" * 80)
        for i, test in enumerate(failed_tests, 1):
            access_note = "SHOULD HAVE ACCESS" if test['should_have_access'] else "SHOULD BE DENIED"
            print(f"{i:>2}. {test['method']} {test['endpoint']}")
            print(f"    Role: {test['role_tested'].upper()} | {access_note}")
            print(f"    Got Status: {test['status_code']} | {test['expected_behavior']}")
            print(f"    Description: {test['desc']}")
            print()
    
    # Show endpoints with perfect authorization
    print(f"ENDPOINTS WITH PERFECT AUTHORIZATION")
    print("=" * 60)
    endpoints_perfect = []
    for endpoint_info in endpoint_overview:
        endpoint_results = [r for r in results if 
                          r['endpoint'] == endpoint_info['endpoint'] and 
                          r['method'] == endpoint_info['method']]
        all_passed = all(r['test_passed'] for r in endpoint_results)
        if all_passed:
            endpoints_perfect.append(f"{endpoint_info['method']} {endpoint_info['endpoint']}")
    
    for endpoint in endpoints_perfect:
        print(f"{endpoint}")
    
    perfect_count = len(endpoints_perfect)
    total_endpoints = len(endpoint_overview)
    print(f"\nPerfect Authorization: {perfect_count}/{total_endpoints} endpoints ({(perfect_count/total_endpoints)*100:.1f}%)")
    
    # Security assessment
    print(f"\n🔐 SECURITY ASSESSMENT")
    print("=" * 40)
    if failed == 0:
        print("EXCELLENT: All authorization rules are working correctly!")
    elif failed <= total_tests * 0.05:  # Less than 5% failure
        print("GOOD: Authorization is mostly correct with minor issues.")
    elif failed <= total_tests * 0.15:  # Less than 15% failure  
        print("MODERATE: Several authorization issues need attention.")
    else:
        print("CRITICAL: Many authorization issues detected. Immediate action required!")
    
    # Return results for summary file generation
    return results

def generate_test_summary_file(results):
    """
    Generate a comprehensive test summary file
    """
    from datetime import datetime
    
    # Calculate summary statistics
    passed = sum(1 for r in results if r['test_passed'])
    failed = len(results) - passed
    success_rate = (passed/len(results))*100
    
    # Generate timestamp
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Create summary content
    summary_content = f"""# CarVia API Authorization Test Summary
Generated: {timestamp}
Test Script: api_test.py

## Executive Summary
- **Total Tests Run:** {len(results)}
- **Tests Passed:** {passed}
- **Tests Failed:** {failed}
- **Success Rate:** {success_rate:.1f}%

## Test Overview
This report contains the results of comprehensive authorization testing for the CarVia API.
Each endpoint was tested with 4 different user roles (Mitglied, Mitarbeiter, Admin, Vehicle)
to validate proper role-based access control.

Status Code 204 (No Content) is treated as a successful response for DELETE operations.

## Role-Based Results

"""
    
    # Add role breakdown
    for role in ['mitglied', 'mitarbeiter', 'admin', 'vehicle']:
        role_results = [r for r in results if r['role_tested'] == role]
        role_passed = sum(1 for r in role_results if r['test_passed'])
        role_failed = len(role_results) - role_passed
        role_success_rate = (role_passed/len(role_results))*100 if role_results else 0
        
        summary_content += f"### {role.upper()} Role\n"
        summary_content += f"- Tests Passed: {role_passed}/{len(role_results)} ({role_success_rate:.1f}%)\n"
        summary_content += f"- Tests Failed: {role_failed}\n\n"
    
    # Add endpoint breakdown
    summary_content += "## Endpoint Results\n\n"
    summary_content += "| Status | Method | Endpoint | Passed | Success Rate |\n"
    summary_content += "|--------|--------|----------|--------|-------------|\n"
    
    for endpoint_info in endpoint_overview:
        endpoint_results = [r for r in results if 
                          r['endpoint'] == endpoint_info['endpoint'] and 
                          r['method'] == endpoint_info['method']]
        endpoint_passed = sum(1 for r in endpoint_results if r['test_passed'])
        endpoint_failed = len(endpoint_results) - endpoint_passed
        success_rate = (endpoint_passed/len(endpoint_results))*100 if endpoint_results else 0
        
        status_icon = "✅" if endpoint_failed == 0 else "⚠️" if endpoint_failed <= 2 else "❌"
        summary_content += f"| {status_icon} | {endpoint_info['method']} | {endpoint_info['endpoint']} | {endpoint_passed}/4 | {success_rate:.1f}% |\n"
    
    # Add failed tests details
    failed_tests = [r for r in results if not r['test_passed']]
    if failed_tests:
        summary_content += f"\n## Failed Tests Details ({len(failed_tests)} failures)\n\n"
        for i, test in enumerate(failed_tests, 1):
            access_note = "SHOULD HAVE ACCESS" if test['should_have_access'] else "SHOULD BE DENIED"
            summary_content += f"### {i}. {test['method']} {test['endpoint']}\n"
            summary_content += f"- **Role:** {test['role_tested'].upper()}\n"
            summary_content += f"- **Expected:** {access_note}\n"
            summary_content += f"- **Got Status:** {test['status_code']}\n"
            summary_content += f"- **Result:** {test['expected_behavior']}\n"
            summary_content += f"- **Description:** {test['desc']}\n\n"
    
    # Add perfect endpoints
    summary_content += "## Endpoints with Perfect Authorization\n\n"
    endpoints_perfect = []
    for endpoint_info in endpoint_overview:
        endpoint_results = [r for r in results if 
                          r['endpoint'] == endpoint_info['endpoint'] and 
                          r['method'] == endpoint_info['method']]
        all_passed = all(r['test_passed'] for r in endpoint_results)
        if all_passed:
            endpoints_perfect.append(f"{endpoint_info['method']} {endpoint_info['endpoint']}")
    
    for endpoint in endpoints_perfect:
        summary_content += f"- ✅ {endpoint}\n"
    
    perfect_count = len(endpoints_perfect)
    total_endpoints = len(endpoint_overview)
    summary_content += f"\n**Perfect Authorization:** {perfect_count}/{total_endpoints} endpoints ({(perfect_count/total_endpoints)*100:.1f}%)\n"
    
    # Add security assessment
    summary_content += "\n## Security Assessment\n\n"
    total_tests = len(results)
    if failed == 0:
        summary_content += "🟢 **EXCELLENT:** All authorization rules are working correctly!\n"
    elif failed <= total_tests * 0.05:  # Less than 5% failure
        summary_content += "🟡 **GOOD:** Authorization is mostly correct with minor issues.\n"
    elif failed <= total_tests * 0.15:  # Less than 15% failure  
        summary_content += "🟠 **MODERATE:** Several authorization issues need attention.\n"
    else:
        summary_content += "🔴 **CRITICAL:** Many authorization issues detected. Immediate action required!\n"
    
    # Add detailed test results
    summary_content += "\n## Detailed Test Results\n\n"
    summary_content += "| Test # | Endpoint | Method | Role | Should Access | Status | Result | Expected Behavior |\n"
    summary_content += "|--------|----------|--------|------|---------------|--------|--------|-----------------|\n"
    
    for i, result in enumerate(results, 1):
        access_icon = "🔓" if result['should_have_access'] else "🔒"
        result_icon = "✅" if result['test_passed'] else "❌"
        summary_content += f"| {i} | {result['endpoint']} | {result['method']} | {result['role_tested'].upper()} | {access_icon} | {result['status_code']} | {result_icon} | {result['expected_behavior']} |\n"
    
    # Add footer
    summary_content += f"\n---\n*Report generated by CarVia API Test Suite on {timestamp}*\n"
    summary_content += f"*Total test cases: {len(results)} | Endpoints tested: {len(endpoint_overview)}*\n"
    
    # Write to file
    filename = f"test_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(summary_content)
        print(f"\n📄 Test summary file generated: {filename}")
        return filename
    except Exception as e:
        print(f"\n❌ Error generating test summary file: {e}")
        return None

if __name__ == "__main__":
    print("🚀 CarVia API Authorization Testing")
    print("=" * 50)
    
    # Create test users first
    print("👥 Creating test users...")
    create_test_users()
    print("✅ Test users setup complete!\n")
    
    # Run comprehensive authorization tests
    results = test_all_endpoints()
    
    # Generate test summary file
    summary_file = generate_test_summary_file(results)
    
    print(f"\n🏁 Testing completed! Check the summary above for results.")
    if summary_file:
        print(f"📄 Detailed test summary saved to: {summary_file}")
    print("=" * 80)
