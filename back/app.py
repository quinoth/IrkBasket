from flask import Flask, request, jsonify
from flask_cors import CORS
import jwt
import bcrypt
import re
from datetime import datetime, timedelta
from functools import wraps
from db import get_db_connection

app = Flask(__name__)
CORS(app)
app.config.from_object('config')

def validate_password(password):
    if len(password) < 8:
        return False
    if not re.search(r'[A-Z]', password):
        return False
    if not re.search(r'[a-z]', password):
        return False
    if not re.search(r'[0-9]', password):
        return False
    return True

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            user_id = data['user_id']
        except:
            return jsonify({"message": "Token is invalid"}), 401
        return f(user_id, *args, **kwargs)
    return decorated

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

@app.route('/user', methods=['GET'])
@token_required
def get_user(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.team_id, t.name as team_name
        FROM users u
        LEFT JOIN teams t ON u.team_id = t.id
        WHERE u.id = %s
    """, (user_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if row:
        user = {
            "id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "email": row[3],
            "role": row[4],
            "team_id": row[5],
            "team_name": row[6]
        }
        return jsonify(user)
    else:
        return jsonify({"message": "User not found"}), 404

@app.route('/public/teams', methods=['GET'])
def get_public_teams():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, name FROM teams")
    teams = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"id": t[0], "name": t[1]} for t in teams])

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    team_id = data.get('team_id') if role == 'player' else None

    if not all([first_name, last_name, email, password, role]):
        return jsonify({"message": "All fields are required"}), 400

    if role not in ['player', 'trainer']:
        return jsonify({"message": "Invalid role"}), 400

    if role == 'player' and not team_id:
        return jsonify({"message": "Team ID is required for players"}), 400

    if not validate_password(password):
        return jsonify({"message": "Password must be at least 8 characters long and contain uppercase, lowercase, and numbers"}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (email,))
    if cur.fetchone():
        cur.close()
        conn.close()
        return jsonify({"message": "Email already exists"}), 400

    if role == 'player':
        cur.execute("SELECT id FROM teams WHERE id = %s", (team_id,))
        if cur.fetchone() is None:
            cur.close()
            conn.close()
            return jsonify({"message": "Team not found"}), 404

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    cur.execute("INSERT INTO users (first_name, last_name, email, password_hash, role, team_id) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (first_name, last_name, email, hashed_password, role, team_id))
    user_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()

    return jsonify({"message": "User registered successfully", "id": user_id}), 201

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
            'user_id': user[0],  # Изменено с 'id' на 'user_id' для соответствия @token_required
            'role': user[5], 
            'exp': datetime.utcnow() + timedelta(hours=1)
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

@app.route('/user/update', methods=['PUT'])
@token_required
def update_user(user_id):
    data = request.get_json()
    if not data or 'email' not in data:
        return jsonify({'message': 'Email is required'}), 400
    
    email = data['email'].strip()
    
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
    finally:
        cur.close()
        conn.close()

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

@app.route('/schedules/<int:schedule_id>/attendance', methods=['POST'])
@token_required
def record_attendance(user_id, schedule_id):
    user_data = get_user_data(user_id)
    if not user_data or user_data['role'] != 'trainer':
        return jsonify({"message": "Unauthorized"}), 403
    data = request.get_json()
    attendees = data.get('attendees', [])
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM attendance WHERE schedule_id = %s", (schedule_id,))
    for attendee_id in attendees:
        cur.execute("INSERT INTO attendance (schedule_id, user_id) VALUES (%s, %s)", (schedule_id, attendee_id))
    conn.commit()
    cur.close()
    conn.close()
    return jsonify({"message": "Attendance recorded"}), 200

@app.route('/attendance', methods=['GET'])
@token_required
def get_my_attendance(user_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT s.id, s.event_type, s.date, s.time, s.location
        FROM attendance a
        JOIN schedules s ON a.schedule_id = s.id
        WHERE a.user_id = %s
        ORDER BY s.date DESC, s.time DESC
    """, (user_id,))
    attendance = cur.fetchall()
    cur.close()
    conn.close()
    return jsonify([{"schedule_id": a[0], "event_type": a[1], "date": str(a[2]), "time": str(a[3]), "location": a[4]} for a in attendance])

if __name__ == '__main__':
    app.run(debug=True, port=5000)