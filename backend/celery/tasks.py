from celery import shared_task
import time
import flask_excel
from backend.model import post
from backend.celery.mail_service import send_emails


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
    send_emails(to,subject,content)