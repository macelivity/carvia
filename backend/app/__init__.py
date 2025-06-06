from flask import Flask, jsonify
from flask_cors import CORS
import logging
import json
import os
from flask_jwt_extended import JWTManager
from .db import init_app as init_db
from .routes.schaden_routes import bp as schaden_bp
from .routes.fahrzeug_routes import bp as fahrzeug_bp
from .routes.modell_routes import bp as modell_bp
from .routes.geodatum_routes import bp as geodatum_bp
from .routes.auth_routes import bp as auth_bp

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Configure logging
    logging.basicConfig(level=logging.DEBUG)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Authorization token is required"}), 401
    
    # Central error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        logging.exception("Unhandled exception occurred")
        return jsonify({"error": "Internal server error"}), 500
    
    init_db(app)
    
    # Register all blueprints
    app.register_blueprint(auth_bp)  # Auth routes at /auth
    app.register_blueprint(schaden_bp, url_prefix="/schaden")
    app.register_blueprint(fahrzeug_bp, url_prefix="/fahrzeug")
    app.register_blueprint(modell_bp, url_prefix="/modell")
    app.register_blueprint(geodatum_bp, url_prefix="/geodatum")

    return app