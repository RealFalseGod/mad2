from app import app
from flask_security import auth_required

@app.get("/")
def home():
    return "<h1>Hello, World!</h1>"

@app.get("/protected")
@auth_required()
def protected():
    return "<h1>Admin Page</h1>"


