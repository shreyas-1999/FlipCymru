from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .models import get_db_connection
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    email = data['email']
    password = bcrypt.hashpw(data['password'].encode(), bcrypt.gensalt())
    name = data['name']

    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO users (email, password, name) VALUES (%s, %s, %s) RETURNING id",
                    (email, password, name))
        user_id = cur.fetchone()[0]
        token = create_access_token(identity=user_id)
        conn.commit()
        return jsonify(access_token=token)
    except:
        return jsonify({'msg': 'User exists'}), 409
    finally:
        cur.close()
        conn.close()


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, password, name FROM users WHERE email=%s", (data['email'],))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and bcrypt.checkpw(data['password'].encode(), user[1].encode()):
        token = create_access_token(identity=user[0])
        return jsonify(access_token=token, name=user[2])
    return jsonify({'msg': 'Invalid credentials'}), 401


@auth_bp.route('/google-login', methods=['POST', 'OPTIONS'])
def google_login():
    if request.method == 'OPTIONS':
        return '', 204

    data = request.get_json()
    email = data.get('email')
    name = data.get('name')

    if not email or not name:
        return jsonify({'error': 'Missing email or name'}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM users WHERE email = %s", (email,))
    user = cur.fetchone()

    if not user:
        cur.execute("INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id, name", (email, name))
        user = cur.fetchone()

    conn.commit()
    cur.close()
    conn.close()

    access_token = create_access_token(identity=user[0])
    return jsonify(access_token=access_token, name=user[1])
