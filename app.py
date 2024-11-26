from flask import Flask
from flask_security import Security, SQLAlchemyUserDatastore
from backend.config import local
from backend.model import db, User, Role
from flask_caching import Cache
from backend.celery.celery_config import celery_init_app


def create_app():
    app = Flask(
        __name__,
        static_folder="frontend",
        template_folder="frontend",
        static_url_path="/static",
    )
    app.config.from_object(local)
    
    # Model initialization
    db.init_app(app)

    # Cache initialization
    cache = Cache(app)

    with app.app_context():
        db.create_all()

    # Flask-Security initialization
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache = cache
    app.security = Security(app, datastore=datastore, register_blueprint=False)
    app.app_context().push()


    from backend.resources import api
    # API initialization
    api.init_app(app)

    return app


app = create_app()

celery_app = celery_init_app(app)

import backend.innit

from backend.routes import *

# print("Running app.py")


if __name__ == "__main__":
    app.run()
