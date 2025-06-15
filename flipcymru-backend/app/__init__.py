from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os

def create_app():
    app = Flask(__name__)
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret')  # fallback value

    # Initialize CORS and JWT
    CORS(app, origins=["http://localhost:8000"], supports_credentials=True)
    JWTManager(app)  

    # Import and register blueprints
    from .auth import auth_bp
    from .flashcards import flashcards_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(flashcards_bp, url_prefix='/api')

    return app
