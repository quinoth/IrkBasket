from flask import Flask, jsonify
from config import SECRET_KEY
app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

@app.route("/")
def home():
    return "Hello world"

if __name__ == "__main__":
    app.run(debug=True)