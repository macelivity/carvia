from flask import Flask
from .routes.movie_routes import movie_bp
from .db import init_app as init_db

def create_app():
    app = Flask(__name__)
    
    init_db(app)
    app.register_blueprint(movie_bp, url_prefix="/movies")

    return app