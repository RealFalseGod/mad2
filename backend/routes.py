from flask import current_app as app, request, jsonify, render_template, send_file
from flask_security import auth_required, verify_password, hash_password
from backend.model import db
from datetime import datetime
from celery.result import AsyncResult
from backend.celery.tasks import create_csv


datastore = app.security.datastore
cache = app.cache

@app.get("/")
@app.get("/home")
def home():
    return render_template("index.html")

@auth_required("token")
@app.get('/getcsv/<id>')
def getCSV(id):
    result = AsyncResult(id)
    print(result)
    print(result.ready())

    if result.ready():
        filename = result.result
        return send_file(f'./backend/celery/userdownload/{filename}') #, as_attachment=True
    else:
        return {"status": "Processing"}, 202
    
    
@auth_required('token') 
@app.get('/createcsv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200


@app.get('/getdata/<id>')
def getdata(id):
    result = AsyncResult(id)
    
    if result.ready():
        return {"result": result.result}, 200
    else:
        return {"status": "Processing"}, 202

# @app.get("/cache")
# @cache.cached(timeout=5)
# def cache():
#     return{'time': str(datetime.now()) }

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    
    if not email or not password:
        return jsonify({"error": "Invalid email or password"}), 400

    user = datastore.find_user(email=email)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.active==0:
        return jsonify({"error": "You are banned"}), 400

    if verify_password(password, user.password):
        return (
            jsonify(
                {
                    "token": user.get_auth_token(),
                    "username": user.username,
                    "email": user.email,
                    "role": user.roles[0].name,
                    "id": user.id,
                }
            ),
            200,
        )

    return jsonify({"error": "Invalid email or password"}), 400

@app.get("/protected")
@auth_required("token")
def protected():
    return "<h1>Admin Page</h1>"

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    address = data.get("address")
    pincode = data.get("pincode")
    role = data.get("role")

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
