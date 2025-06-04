#!/usr/bin/env python3
"""Debug script to test JWT configuration and token creation/validation"""

import os
import json
import sys
sys.path.append(os.path.dirname(__file__))

from app import create_app
from flask_jwt_extended import create_access_token, decode_token
import jwt

def debug_jwt_config():
    """Debug JWT configuration and test token creation/validation"""
    print("=== JWT Debug Information ===")
    
    # Create Flask app
    app = create_app()
    
    with app.app_context():
        # Check JWT secret key
        jwt_secret = app.config.get("JWT_SECRET_KEY")
        print(f"JWT_SECRET_KEY in app config: {jwt_secret}")
        print(f"JWT_SECRET_KEY type: {type(jwt_secret)}")
        print(f"JWT_SECRET_KEY is None: {jwt_secret is None}")
        
        if jwt_secret is None:
            print("❌ ERROR: JWT_SECRET_KEY is None! This will cause signature verification to fail.")
            return
          # Test token creation
        try:
            test_user_id = "4"  # Use string instead of int
            access_token = create_access_token(identity=test_user_id)
            print(f"✅ Successfully created token: {access_token}")
            
            # Try to decode with Flask-JWT-Extended
            try:
                decoded = decode_token(access_token)
                print(f"✅ Successfully decoded with Flask-JWT-Extended: {decoded}")
            except Exception as e:
                print(f"❌ Failed to decode with Flask-JWT-Extended: {e}")
            
            # Try to decode with PyJWT directly
            try:
                decoded_direct = jwt.decode(access_token, jwt_secret, algorithms=["HS256"])
                print(f"✅ Successfully decoded with PyJWT directly: {decoded_direct}")
            except Exception as e:
                print(f"❌ Failed to decode with PyJWT directly: {e}")
                
        except Exception as e:
            print(f"❌ Failed to create token: {e}")

def check_config_file():
    """Check if config file exists and can be loaded"""
    print("\n=== Config File Debug ===")
    
    # Check different possible config paths
    possible_paths = [
        "config.json",
        "../config.json", 
        "../../config.json",
        os.path.join(os.path.dirname(__file__), "../../config.json"),
        os.path.join(os.path.dirname(__file__), "../config.json"),
    ]
    
    for path in possible_paths:
        abs_path = os.path.abspath(path)
        print(f"Checking: {abs_path}")
        if os.path.exists(abs_path):
            print(f"✅ Config file exists at: {abs_path}")
            try:
                with open(abs_path) as f:
                    config = json.load(f)
                    print(f"JWT_SECRET_KEY in config: {config.get('JWT_SECRET_KEY')}")
                    break
            except Exception as e:
                print(f"❌ Error reading config: {e}")
        else:
            print(f"❌ Config file not found at: {abs_path}")

if __name__ == "__main__":
    check_config_file()
    debug_jwt_config()
