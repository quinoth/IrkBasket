from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import bcrypt
import jwt
import datetime
from db import get_db_connection
from config import SECRET_KEY

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

CORS(app, resources={
    r"/*": {
        "origins": "http://localhost:3000",
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'\d', password):
        return False
    return True
    

def get_user_data(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT role, team_id FROM users WHERE id = %s", (user_id,))
    data = cur.fetchone()
    cur.close()
    conn.close()
    if data:
        return {"role": data[0], "team_id": data[1]}
    return None    


@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([first_name, last_name, email, password, role]):
        return jsonify({'message': 'Missing fields'}), 400

    if not validate_password(password):
        return jsonify({'message': 'Password must be at least 8 characters long, include uppercase, lowercase, and a number'}), 400

    try:
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        conn = get_db_connection()
        cur = conn.cursor()
        
        cur.execute(
            "INSERT INTO users (first_name, last_name, email, password_hash, role) VALUES (%s, %s, %s, %s, %s)",
            (first_name, last_name, email, password_hash, role)
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
    email = data.get('email')
    password = data.get('password')

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, first_name, last_name, email, password_hash, role FROM users WHERE email = %s", (email,))
    user = cur.fetchone()
    cur.close()
    conn.close()

    if user and bcrypt.checkpw(password.encode('utf-8'), user[4].encode('utf-8')):
        token = jwt.encode({
            'id': user[0],
            'role': user[5], 
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user[0],
                'first_name': user[1],
                'last_name': user[2],
                'email': user[3],
                'role': user[5]
            },
            'message': 'Login successful'
        })
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
        cur.execute("SELECT id, first_name, last_name, email, role FROM users WHERE id = %s", (user_id,))
        user = cur.fetchone()
        cur.close()
        conn.close()
        
        if user:
            return jsonify({
                'id': user[0],
                'first_name': user[1],
                'last_name': user[2],
                'email': user[3],
                'role': user[4]
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
        
        
        
@app.route('/teams', methods=['GET'])
@token_required
def get_teams(user_id):
    user_data = get_user_data(user_id)
    if not user_data or user_data['role'] != 'trainer':
        return jsonify({"message": "Unauthorized"}), 403
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name, description FROM teams")
    teams = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": t[0], "name": t[1], "description": t[2]} for t in teams])

@app.route('/teams', methods=['POST'])
@token_required
def create_team(user_id):
    user_data = get_user_data(user_id)
    if not user_data or user_data['role'] != 'trainer':
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    name = data.get('name')
    description = data.get('description')
    if not name:
        return jsonify({"message": "Name is required"}), 400
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO teams (name, description) VALUES (%s, %s) RETURNING id", (name, description))
    team_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Team created", "id": team_id}), 201
    
    
@app.route('/schedules', methods=['GET'])
@token_required
def get_schedules(user_id):
    user_data = get_user_data(user_id)
    if not user_data:
        return jsonify({"message": "User not found"}), 404
    role = user_data['role']
    team_id = user_data['team_id']
    conn = get_db_connection()
    cur = conn.cursor()
    if role == 'trainer':
        cur.execute("SELECT id, team_id, event_type, date, time, location, description FROM schedules")
    else:
        if team_id is None:
            return jsonify({"message": "User is not assigned to a team"}), 400
        cur.execute("SELECT id, team_id, event_type, date, time, location, description FROM schedules WHERE team_id = %s", (team_id,))
    schedules = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": s[0], "team_id": s[1], "event_type": s[2], "date": str(s[3]), "time": str(s[4]), "location": s[5], "description": s[6]} for s in schedules])

@app.route('/schedules', methods=['POST'])
@token_required
def create_schedule(user_id):
    user_data = get_user_data(user_id)
    if not user_data or user_data['role'] != 'trainer':
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    team_id = data.get('team_id')
    event_type = data.get('event_type')
    date = data.get('date')
    time = data.get('time')
    location = data.get('location')
    description = data.get('description')
    if not all([team_id, event_type, date, time]):
        return jsonify({"message": "Missing required fields"}), 400
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO schedules (team_id, event_type, date, time, location, description, created_by) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING id", 
                (team_id, event_type, date, time, location, description, user_id))
    schedule_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Schedule created", "id": schedule_id}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)