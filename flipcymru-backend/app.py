# flipcymru-python-backend/app.py

import os
from flask import Flask, jsonify, request
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth, firestore
import google.genai as genai
from flask_cors import CORS
from functools import wraps # Import wraps for decorators

# Load environment variables from .env file
load_dotenv()

# --- Flask App Setup ---
app = Flask(__name__)
# Enable CORS for all routes by default.
# For production, it's highly recommended to restrict this to your frontend's specific domain(s):
# CORS(app, resources={r"/api/*": {"origins": "https://yourfrontenddomain.com"}})
CORS(app)

# --- Firebase Admin SDK Initialization ---
# The path to your service account key file
# Make sure serviceAccountKey.json is in the same directory as app.py
SERVICE_ACCOUNT_KEY_PATH = os.path.join(os.path.dirname(__file__), 'serviceAccountKey.json')

try:
    # Initialize Firebase Admin SDK using the service account key
    cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
    firebase_admin.initialize_app(cred)
    print("Firebase Admin SDK initialized successfully!")
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")
    # It's critical for the app to function, so exit if initialization fails
    exit(1)

# Get Firestore client
db = firestore.client()

# --- Gemini API Initialization ---
# Get your Gemini API key from environment variables
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    print("WARNING: GEMINI_API_KEY not found in .env. AI features will not work.")
else:
    try:
        # With google-genai, the API key is typically picked up directly from environment variables.
        # No explicit configure() call is usually needed here.
        # We'll just test by listing models, which will use the environment variable.
        _ = genai.list_models() # Attempt a small operation to confirm connectivity
        print("Gemini API configured successfully using google-genai!")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")


# --- Utility for Authentication ---
def verify_firebase_token(id_token):
    """
    Verifies a Firebase ID token.
    Returns the decoded token (dict) if valid, None otherwise.
    """
    try:
        decoded_token = auth.verify_id_token(id_token)
        return decoded_token
    except Exception as e:
        # Log the error for debugging purposes, but don't expose too much info to the client
        print(f"Error verifying Firebase ID token: {e}")
        return None

def auth_required(f):
    """
    Decorator to protect Flask routes, requiring a valid Firebase ID Token.
    The decoded user information will be available in `request.user`.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get the Authorization header from the request
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"message": "Authorization header missing!"}), 401 # Unauthorized

        try:
            # Expected format: "Bearer <ID_TOKEN>"
            id_token = auth_header.split(" ")[1]
            decoded_token = verify_firebase_token(id_token)

            if not decoded_token:
                # If token is invalid or expired, return unauthorized
                return jsonify({"message": "Invalid or expired token!"}), 401

            # Attach the decoded user information to the request object
            # This allows subsequent route logic to access user's UID, email, etc.
            request.user = decoded_token
        except IndexError:
            # Handle cases where the header format is incorrect
            return jsonify({"message": "Token format is 'Bearer <token>'"}), 401
        except Exception as e:
            # Catch any other unexpected errors during authentication
            return jsonify({"message": f"Authentication error: {str(e)}"}), 401
        
        return f(*args, **kwargs) # Proceed to the original route function
    return decorated_function


# --- Basic Route for Testing ---
@app.route('/')
def home():
    """
    A simple home route to confirm the backend is running.
    """
    return jsonify({"message": "FlipCymru Python Backend API is running!", "status": "success"})

# --- Health Check (Good practice for deployment) ---
@app.route('/health')
def health_check():
    """
    Checks the health of the backend, including Firebase connection.
    """
    firebase_status = "error"
    try:
        # Attempt to get a dummy document to verify Firestore connectivity
        db.collection('health_check').document('test').get()
        firebase_status = "connected"
    except Exception as e:
        firebase_status = f"error: {e}"

    gemini_status = "configured" if GEMINI_API_KEY else "not configured (missing API key)"
    if GEMINI_API_KEY:
        try:
            # Attempt a small operation with Gemini, e.g., list models
            _ = genai.list_models()
            gemini_status = "connected"
        except Exception as e:
            gemini_status = f"error: {e}"

    return jsonify({
        "status": "healthy",
        "firebase_connection": firebase_status,
        "gemini_api": gemini_status
    })

# --- User Authentication APIs ---

@app.route('/register', methods=['POST'])
def register_user():
    """
    Handles new user registration.
    Creates a user in Firebase Authentication and stores additional profile data in Firestore.
    Expected JSON: {"email": "user@example.com", "password": "strongpassword", "displayName": "John Doe"}
    """
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('displayName', '') # Optional display name

    # Basic input validation
    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    try:
        # Create user in Firebase Authentication
        user = auth.create_user(email=email, password=password, display_name=display_name)
        
        # Store additional user info in Firestore
        # This document uses the Firebase Auth UID as its ID, linking the records
        user_ref = db.collection('users').document(user.uid)
        user_ref.set({
            'email': user.email,
            'displayName': user.display_name,
            'createdAt': firestore.SERVER_TIMESTAMP # Firestore's server timestamp
        })

        return jsonify({"message": "User registered successfully!", "uid": user.uid, "email": user.email}), 201 # Created
    except auth.EmailAlreadyExistsError:
        return jsonify({"message": "Email already registered. Please use a different email or log in."}), 409 # Conflict
    except Exception as e:
        print(f"Error during user registration: {e}")
        return jsonify({"message": f"Error registering user: {str(e)}"}), 500 # Internal Server Error

@app.route('/login', methods=['POST'])
def login_user():
    """
    Handles user login by verifying a Firebase ID Token received from the frontend.
    This endpoint does NOT take email/password. It expects the frontend to have
    already authenticated with Firebase client-side and sent the resulting ID Token.
    Expected JSON: {"idToken": "FIREBASE_ID_TOKEN_HERE"}
    """
    data = request.get_json()
    id_token = data.get('idToken')

    if not id_token:
        return jsonify({"message": "Firebase ID Token is required"}), 400

    decoded_token = verify_firebase_token(id_token)
    if not decoded_token:
        # Error message from verify_firebase_token is already logged server-side
        return jsonify({"message": "Invalid or expired Firebase ID Token."}), 401
    
    # Optionally, fetch comprehensive user details from Firebase Auth and Firestore
    user_uid = decoded_token['uid']
    try:
        user_record = auth.get_user(user_uid) # Get user record from Firebase Auth
        user_firestore_doc = db.collection('users').document(user_uid).get()
        
        response_data = {
            "message": "User authenticated successfully!",
            "uid": user_record.uid,
            "email": user_record.email,
            "displayName": user_record.display_name,
            "emailVerified": user_record.email_verified,
            "createdAt": user_record.creation_time.isoformat() if user_record.creation_time else None
        }
        
        if user_firestore_doc.exists:
            # Merge Firestore data into the response
            response_data['profile'] = user_firestore_doc.to_dict()
        else:
            # If for some reason Firestore doc doesn't exist, create a basic one
            # This handles edge cases where auth user is created but firestore doc isn't
            db.collection('users').document(user_uid).set({
                'email': user_record.email,
                'displayName': user_record.display_name,
                'createdAt': firestore.SERVER_TIMESTAMP
            })
            response_data['profile'] = {
                'email': user_record.email,
                'displayName': user_record.display_name,
            }


        return jsonify(response_data), 200 # OK
    except auth.UserNotFoundError:
        return jsonify({"message": "User not found in Firebase Authentication."}), 404
    except Exception as e:
        print(f"Error fetching user details after token verification: {e}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500


# --- Example Protected Route ---
@app.route('/profile', methods=['GET'])
@auth_required
def get_user_profile():
    """
    An example of a protected route.
    Requires a valid Firebase ID Token in the 'Authorization: Bearer <token>' header.
    Returns the decoded user information.
    """
    # request.user contains the decoded Firebase ID token data, attached by the decorator
    user_uid = request.user['uid']
    user_email = request.user.get('email', 'N/A')
    
    # Fetch actual user profile from Firestore if more details are needed
    try:
        user_doc = db.collection('users').document(user_uid).get()
        if user_doc.exists:
            profile_data = user_doc.to_dict()
            return jsonify({
                "message": f"User profile for {user_email}",
                "uid": user_uid,
                "email": user_email,
                "profile_data": profile_data
            }), 200
        else:
            return jsonify({"message": "User profile not found in Firestore."}), 404
    except Exception as e:
        print(f"Error fetching user profile from Firestore: {e}")
        return jsonify({"message": f"Failed to retrieve profile: {str(e)}"}), 500


# --- Run the Flask App ---
if __name__ == '__main__':
    # Use environment variable for port, default to 5000
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port) # debug=True is for development, set to False in production
