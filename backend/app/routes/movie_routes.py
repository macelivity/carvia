from flask import Blueprint, request, jsonify
from app.models import movie_ops

movie_bp = Blueprint("movies", __name__)

# results in a 308: permanently moved code because /movies != /movies/
@movie_bp.route("/", methods=["GET"])
def list_movies():
    movies = movie_ops.get_all()
    return jsonify(movies)

@movie_bp.route("/", methods=["POST"])
def create_movie():
    data = request.get_json()
    movie_ops.create(data["title"], data.get("year"))
    return jsonify({"msg": "Movie added"}), 201

@movie_bp.route("/<int:movie_id>", methods=["GET"])
def get_movie(movie_id):
    movie = movie_ops.get_by_id(movie_id)
    if not movie:
        return jsonify({"error": "Not found"}), 404
    return jsonify(movie)

@movie_bp.route("/<int:movie_id>", methods=["PUT"])
def update_movie(movie_id):
    data = request.get_json()
    if not movie_ops.get_by_id(movie_id):
        return jsonify({"error": "Not found"}), 404
    movie_ops.update(movie_id, data["title"], data.get("year"))
    return jsonify({"msg": "Movie updated"})

@movie_bp.route("/<int:movie_id>", methods=["DELETE"])
def delete_movie(movie_id):
    if not movie_ops.get_by_id(movie_id):
        return jsonify({"error": "Not found"}), 404
    movie_ops.delete(movie_id)
    return jsonify({"msg": "Movie deleted"}), 204