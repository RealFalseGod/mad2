from flask import current_app as app, request, jsonify
from flask_security import auth_required, verify_password, hash_password, login_user
from backend.model import db


datastore = app.security.datastore


@app.get("/")
@app.get("/home")
def home():
    return "<h1>Hello, World!</h1>"


@app.get("/protected")
@auth_required()
def protected():
    print(request.headers)
    return "<h1>Admin Page</h1>"


# @app.route("/login", methods=["POST"])
# def login():
#     username = request.json.get("username")
#     password = request.json.get("password")
#     user = datastore.find_user(username=username)

#     if user and verify_password(password, user.password):
#         login_user(user)  # Logs in the user and creates a session
#         # Flask-Security automatically manages the token for the session if configured properly
#         return (
#             jsonify(
#                 {
#                     "token": user.get_auth_token(),
#                     "email": user.email,
#                     "role": user.roles[0].name,
#                     "id": user.id,
#                 }
#             ),
#             200,
#         )
#     return jsonify({"msg": "Bad username or password"}), 401


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if username:
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
                    "role": user.roles[0].name,
                    "id": user.id,
                }
            ),
            200,
        )

    return jsonify({"error": "Invalid email or password"}), 400


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    address = data.get("address")
    pincode = data.get("pincode")
    role = data.get("register as in customer or staff")

    if not email or not password or role not in ["user", "staff"]:
        return jsonify({"error": "Invalid inputs"}), 400

    if datastore.find_user(email=email):
        return jsonify({"error": "User already exists"}), 400

    user = datastore.find_user(username=username)
    if user:
        return jsonify({"error": "Username already exists"}), 400

    try:
        datastore.create_user(
            email=email,
            username=username,
            password=hash_password(password),
            address=address,
            pincode=pincode,
            roles=[role],
            active=True,
        )
        db.session.commit()
        return jsonify({"message": "User created successfully"}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
