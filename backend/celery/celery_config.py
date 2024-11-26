from celery import Celery, Task
from flask import Flask

class celeryconfig():
    broker_url = 'redis://localhost:6379/0'
    result_backend = 'redis://localhost:6379/1'
    timezone = 'Asia/Kolkata'
    # task_serializer = 'json'
    # result_serializer = 'json'
    # accept_content = ['json']    
    # enable_utc = True


def celery_init_app(app: Flask) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(celeryconfig)
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app