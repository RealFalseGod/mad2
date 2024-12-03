


from celery import shared_task
import time
import flask_excel
from backend.model import post,servicebooking,db,User,UserRoles
from backend.celery.mail_service import send_email
from datetime import datetime, timedelta
from sqlalchemy import extract
from io import StringIO
import os
import csv

@shared_task(bind = True, ignore_result = False)
def create_csv(self):
    booking_count = servicebooking.query.count()

    # Ensure the directory exists
    download_dir = './backend/celery/userdownload/'
    if not os.path.exists(download_dir):
        os.makedirs(download_dir)

    # If no bookings, create an empty CSV with "No data present"
    if booking_count == 0:
        task_id = self.request.id or "default_task_id"
        filename = f'blog_data_{task_id}.csv'

        # Create an in-memory string buffer to write the CSV
        output = StringIO()
        writer = csv.writer(output)

        # Write a row with "No data present"
        writer.writerow(["No data present"])

        # Save the CSV file
        with open(os.path.join(download_dir, filename), 'w', newline='') as file:
            file.write(output.getvalue())

        return filename

    # If there are bookings, create a CSV for current month and year with 'done' status
    current_month = datetime.now().month
    current_year = datetime.now().year
    resource = servicebooking.query.filter(
        extract('month', servicebooking.booking_date) == current_month,
        extract('year', servicebooking.booking_date) == current_year,
        servicebooking.status == 'done'  # Assuming 'done' is the status you're looking for
    ).all()

    task_id = self.request.id or "default_task_id"
    filename = f'blog_data_{task_id}.csv'
    column_names = [column.name for column in servicebooking.__table__.columns]

    # Generate the CSV with actual data
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names=column_names, file_type='csv')

    with open(os.path.join(download_dir, filename), 'wb') as file:
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

@shared_task(ignore_result = False)
def expire_requests():
    current_datetime = datetime.utcnow()
    requests_to_expire = db.session.query(servicebooking).filter(
        servicebooking.status.in_(['pending', 'accepted']),  # Ensure the request is either pending or accepted
        servicebooking.booking_date < current_datetime  # Ensure the request date has passed
    ).all()
    for request in requests_to_expire:
        request.status = 'expired'
    for request in requests_to_expire:
        subject = "Booking expired"
        content = f"""
            <h1>Booking Confirmed</h1>
            <p>Dear {request.user.username},</p>
            <p>Your booking for the service id :<strong>{request.id}</strong> has expired .</p>
            <p>Thank you for using our service!</p>
            """
        send_email(request.user.email,subject,content)
    
    # Commit the changes to the database
    db.session.commit()

def monthly_report(user):
    current_month = datetime.now().month
    current_year = datetime.now().year
    # Assuming `ServiceBooking` is your SQLAlchemy model
    subject = "Monthly report"
    service_bookings = servicebooking.query.filter(servicebooking.user_id==user.id,
        extract("month", servicebooking.booking_date) == current_month,
        extract("year", servicebooking.booking_date) == current_year
    ).all()
    report_html = generate_html_report(service_bookings)
    send_email(user.email,subject,report_html)


def generate_html_report(bookings):
    if not bookings:
        return "<p>No bookings made this month.</p>"

    # Start HTML content
    html = """
    <html>
    <body>
        <h1>Monthly Service Bookings Report</h1>
        <p>Here are the details of the bookings made this month:</p>
        <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr>
                    <th>Booking ID</th>
                    <th>User ID</th>
                    <th>Post_id</th>
                    <th>Status</th>
                    <th>Booking Date</th>
                </tr>
            </thead>
            <tbody>
    """

    # Add rows for each booking
    for booking in bookings:
        html += f"""
        <tr>
            <td>{booking.id}</td>
            <td>{booking.user_id}</td>
            <td>{booking.post_id}</td>
            <td>{booking.status}</td>
            <td>{booking.booking_date.strftime('%Y-%m-%d')}</td>
        </tr>
        """

    # End HTML content
    html += """
            </tbody>
        </table>
    </body>
    </html>
    """

    return html

@shared_task(ignore_result = False)
def send_each_user():
    users_with_role = db.session.query(User).join(
            UserRoles, UserRoles.user_id == User.id
        ).filter(UserRoles.role_id == 2).all()
    print(users_with_role)
    for u in users_with_role:
        monthly_report(u)
