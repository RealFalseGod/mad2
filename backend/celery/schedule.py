from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email,send_tomorrow_reminders,expire_requests,send_each_user


celery_app = app.extensions["celery"]
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    #sender.add_periodic_task(10.0, email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'))
    #sender.add_periodic_task(crontab(hour=17, minute=3), email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'), name='daily reminder')
    #sender.add_periodic_task(crontab(hour=5, minute=14, day_of_week='monday'), email.s('user@gmail.com', 'reminder to login', '<h1>login to your account</h1>'), name='weekly reminder')
    sender.add_periodic_task(crontab(hour=17, minute=0), send_tomorrow_reminders_task.s(), name='Daily service reminder')
    sender.add_periodic_task(crontab(hour=17, minute=0), haha_expired().s(),name='service expired')
    sender.add_periodic_task(crontab(minute=0, hour=17, day_of_month='28-31'), month_report().s(),name='service expired')
    


@celery_app.task
def test(arg):
    print(arg)
@celery_app.task
def send_tomorrow_reminders_task():
    """Celery task to send email reminders for tomorrow's services."""
    try:
        send_tomorrow_reminders()  # Call your email reminder function
        print("Successfully sent tomorrow's service reminders.")
    except Exception as e:
        print(f"Error sending reminders: {e}")

@celery_app.task
def haha_expired():
    try:
        expire_requests()  # Call your email reminder function
        print("it expired.")
    except Exception as e:
        print(f"Error sending exprieres: {e}")
    
@celery_app.task
def month_report():
    try:
        send_each_user()  
    except Exception as e:
        print(f"Error sending report: {e}")