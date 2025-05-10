from flask import Flask, request, jsonify
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
        }, app.config['SECRET_KEY'])
        return jsonify({'token': token})
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
        
        
@app.route('/user', methods=['GET'])
def get_user():
    token = request.headers.get('Authorization')
    if not token:
        return jsonify({'message': 'Missing token'}), 401

    try:
        data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'message': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'message': 'Invalid token'}), 401

if __name__ == "__main__":
    app.run(debug=True)