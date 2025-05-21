from .movie_routes import movie_bp

def register_blueprints(app):
    app.register_blueprint(movie_bp, url_prefix="/movies")