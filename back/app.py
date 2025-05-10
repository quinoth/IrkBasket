from flask import Flask, request, jsonify
from config import SECRET_KEY
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

@app.route('/register', methods=['POST'])
def register():
    pass

if __name__ == "__main__":
    app.run(debug=True)