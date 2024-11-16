from flask import current_app as app, request, jsonify
from flask_security import auth_required, verify_password


datastore = app.security.datastore


@app.get("/")
@app.get("/home")
def home():
    return "<h1>Hello, World!</h1>"


@app.get("/protected")
@auth_required()
def protected():
    return "<h1>Admin Page</h1>"


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    email = data.get("eemail")
    password = data.get("password")
    address = data.get("address")
    pincode = data.get("pincode")

    if not email or not password:
        return jsonify({"error": "Invalid email or password"}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if verify_password(password, user.password):
        return (
            jsonify(
                {
                    "token": user.get_auth_token(),
                    "email": user.email,
                    "role": user.role,
                    "id": user.id,
                }
            ),
            200,
        )
