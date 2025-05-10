from flask import Flask, request, jsonify
import re
import bcrypt
import jwt
import datetime
from db import get_db_connection
app = Flask(__name__)
from config import SECRET_KEY
app.config['SECRET_KEY'] = SECRET_KEY

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')
    role = data.get('role')

    if not all([username, password, email, role]):
        return jsonify({'message': 'Missing fields'}), 400

    try:
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO users (username, password_hash, email, role) VALUES (%s, %s, %s, %s)",
            (username, password_hash, email, role)
        )
        
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'message': str(e)}), 500
        
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()
    
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[2].encode('utf-8')):
        token = jwt.encode({
            'id': user[0],
            'role': user[4],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

@app.route('/user', methods=['GET'])
def get_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Authorization header is missing or invalid'}), 401
    
    token = auth_header.split(' ')[1] 

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = data['id']
        
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, username, email, role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user:
            return jsonify({
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'role': user[3]
            })
        return jsonify({'message': 'User not found'}), 404
        
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token has expired'}), 401
    except jwt.InvalidTokenError as e:
        return jsonify({'message': f'Invalid token: {str(e)}'}), 401
        
        
@app.route('/user/update', methods=['PUT'])
def update_user():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({'message': 'Authorization header is missing or invalid'}), 401
    
    token = auth_header.split(' ')[1].strip()

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = data['id']
        
        update_data = request.get_json()
        if not update_data:
            return jsonify({'message': 'No data provided'}), 400
            
        if 'email' not in update_data:
            return jsonify({'message': 'Email is required'}), 400
            
        email = update_data['email'].strip()
        
        if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
            return jsonify({'message': 'Invalid email format'}), 400
            
        conn = get_db_connection()
        cur = conn.cursor()
        
        try:
            cur.execute("SELECT id FROM users WHERE email = %s AND id != %s", (email, user_id))
            if cur.fetchone():
                return jsonify({'message': 'Email already in use by another user'}), 400
            
            cur.execute("UPDATE users SET email = %s WHERE id = %s RETURNING id", (email, user_id))
            updated_user = cur.fetchone()
            conn.commit()
            
            if not updated_user:
                return jsonify({'message': 'User not found'}), 404
                
            return jsonify({
                'message': 'Profile updated successfully',
                'email': email
            })
            
        except Exception as e:
            conn.rollback()
            return jsonify({'message': f'Database error: {str(e)}'}), 500
            
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError as e:
        return jsonify({'message': f'Invalid token: {str(e)}'}), 401
    except Exception as e:
        return jsonify({'message': f'Server error: {str(e)}'}), 500
    finally:
        if 'cur' in locals(): cur.close()
        if 'conn' in locals(): conn.close()

if __name__ == "__main__":
    app.run(debug=True)