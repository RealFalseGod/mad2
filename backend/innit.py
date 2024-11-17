from flask_security import SQLAlchemyUserDatastore, hash_password
from backend.model import db
from flask import current_app as app


with app.app_context():
    # Initialize roles and users
    userdatastore: SQLAlchemyUserDatastore = app.security.datastore

    # Create roles if they don’t already exist
    userdatastore.find_or_create_role(name="admin", description="Administrator")
    userdatastore.find_or_create_role(name="user", description="Customer")
    userdatastore.find_or_create_role(name="staff", description="Provides services")

    # Create default admin user if they don’t exist
    if not userdatastore.find_user(email="admin@gmail.com"):
        userdatastore.create_user(
            email="admin@gmail.com",
            username="admin",
            password=hash_password("iamadmin"),
            address="admin address",
            pincode="123456",
            roles=[userdatastore.find_or_create_role("admin")],
        )

    # Create default customer user if they don’t exist
    if not userdatastore.find_user(email="user007@gmail.com"):
        userdatastore.create_user(
            email="user007@gmail.com",
            username="user007",
            password=hash_password("imuser"),
            address="user address",
            pincode="010101",
            roles=[userdatastore.find_or_create_role("user")],
        )

    db.session.commit()


