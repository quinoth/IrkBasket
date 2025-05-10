from flask import Flask, request, jsonify
import bcrypt
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

if __name__ == "__main__":
    app.run(debug=True)