from flask import current_app as app
from flask_security import auth_required

@app.get("/")
@app.get("/home")
def home():
    return "<h1>Hello, World!</h1>"

@app.get("/protected")
@auth_required()
def protected():
    return "<h1>Admin Page</h1>"


