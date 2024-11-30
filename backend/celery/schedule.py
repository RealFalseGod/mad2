from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email


celery_app = app.extensions["celery"]
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # sender.add_periodic_task(10.0, email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'))
    sender.add_periodic_task(crontab(hour=5, minute=14), email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'), name='daily reminder')
    sender.add_periodic_task(crontab(hour=5, minute=14, day_of_week='monday'), email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'), name='weekly reminder')

@celery_app.task
def test(arg):
    print(arg)
 