from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from backend.config import local
from backend.model import db, User, Role


def create_app():
    app = Flask(__name__)
    app.config.from_object(local)

    # Model initialization
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Flask-Security initialization
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    app.app_context().push()
    return app


app = create_app()
import backend.innit

from backend.routes import *

print("Running app.py")


if __name__ == "__main__":
    app.run()
