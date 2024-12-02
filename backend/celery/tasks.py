from celery import shared_task
import time
import flask_excel
from backend.model import post,servicebooking,db,User
from backend.celery.mail_service import send_email
from datetime import datetime, timedelta

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    resource = post.query.all()
    task_id = self.request.id
    filename = f'blog_data_{task_id}.csv'
    column_names = [column.name for column in post.__table__.columns]
    # print(column_names)
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names = column_names, file_type='csv' )

    with open(f'./backend/celery/userdownload/{filename}', 'wb') as file:
        file.write(csv_out.data)
    
    return filename

@shared_task(ignore_result = False)
def email(to,subject,content):
    send_email(to,subject,content)

@shared_task(ignore_result = False)
def send_tomorrow_reminders():
    tomorrow = datetime.now() + timedelta(days=1)
    tomorrow_date = tomorrow.date()
    bookings = servicebooking.query.filter(
        db.func.date(servicebooking.booking_date) == tomorrow_date,
        servicebooking.status == 'accepted'
    ).all()
    if not bookings:
        print("No bookings for tomorrow.")
        return
    for booking in bookings:
        user = User.query.get(booking.user_id)
        staff_id=booking.post.user_id
        staff= User.query.get(staff_id)
    subject = "Reminder: Service Scheduled for Tomorrow"
    user_message = f"""
        Dear {user.username},
        
        This is a reminder that your service booking is scheduled for tomorrow:
        - Service: {booking.post.name}
        - Description: {booking.post.content}
        - Price: {booking.post.price}
        - Staff: {staff.username}

        Please make necessary arrangements. 

        Regards,
        Your Service Team
        """

    staff_message = f"""
        Dear {staff.username},
        
        This is a reminder about the service booking you are assigned to tomorrow:
        - Service: {booking.post.name}
        - Description: {booking.post.content}
        - Price: {booking.post.price}
        - User: {user.username}

        Please ensure you're prepared for this service. 

        Regards,
        Your Service Team
        """

        # Send emails
    try:
        send_email(user.email, subject,user_message)
            # Email to the user
        send_email(staff.email, subject,staff_message)
        print(f"Reminder sent to {user.email} and {staff.email}")
    except Exception as e:
        print(f"Failed to send reminders for booking ID {booking.id}: {e}")