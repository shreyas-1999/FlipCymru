from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import get_db_connection

flashcards_bp = Blueprint('flashcards', __name__)

@flashcards_bp.route('/categories')
@jwt_required()
def get_categories():
    user_id = get_jwt_identity()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT c.id, c.name, COALESCE(p.viewed_cards, 0) AS progress
        FROM categories c
        LEFT JOIN progress p ON c.id = p.category_id AND p.user_id = %s
    """, (user_id,))
    categories = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{'id': row[0], 'name': row[1], 'progress': row[2]} for row in categories])

@flashcards_bp.route('/cards/<int:category_id>')
@jwt_required()
def get_cards(category_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT english, welsh, pronunciation, audio_url FROM flashcards WHERE category_id = %s", (category_id,))
    cards = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([
        {'english': c[0], 'welsh': c[1], 'pronunciation': c[2], 'audio_url': c[3]} for c in cards
    ])

# Categories CRUD APIs
@flashcards_bp.route('/categories', methods=['POST'])
@jwt_required()
def add_category():
    name = request.json.get('name')
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO categories (name) VALUES (%s) RETURNING id", (name,))
    category_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': category_id, 'name': name}), 201

@flashcards_bp.route('/categories/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    name = request.json.get('name')
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("UPDATE categories SET name = %s WHERE id = %s", (name, id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': id, 'name': name})

@flashcards_bp.route('/categories/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM flashcards WHERE category_id = %s", (id,))
    cur.execute("DELETE FROM categories WHERE id = %s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'msg': 'Category deleted'})

# Flashcards CRUD APIs
@flashcards_bp.route('/cards', methods=['POST'])
@jwt_required()
def add_flashcard():
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO flashcards (category_id, english, welsh, pronunciation, audio_url)
        VALUES (%s, %s, %s, %s, %s) RETURNING id
    """, (data['category_id'], data['english'], data['welsh'], data['pronunciation'], data['audio_url']))
    card_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': card_id, **data}), 201

@flashcards_bp.route('/cards/<int:id>', methods=['PUT'])
@jwt_required()
def update_flashcard(id):
    data = request.json
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        UPDATE flashcards SET
        english = %s,
        welsh = %s,
        pronunciation = %s,
        audio_url = %s
        WHERE id = %s
    """, (data['english'], data['welsh'], data['pronunciation'], data['audio_url'], id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'id': id, **data})

@flashcards_bp.route('/cards/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_flashcard(id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM flashcards WHERE id = %s", (id,))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({'msg': 'Flashcard deleted'})
