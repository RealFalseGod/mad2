from flask_restful import Api, Resource, fields, marshal_with
from flask import request, current_app as app
from backend.model import post, servicebooking,review
from flask_security import auth_required, current_user
from backend.model import db, User
from datetime import datetime
from dateutil.parser import parse as parse_date
from backend.celery.tasks import email
from backend.celery.mail_service import send_email
cache = app.cache

api = Api(prefix="/api")

post_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "service": fields.String,
    "content": fields.String,
    "price": fields.Integer,
    "user_id": fields.Integer,
}

user_fields = {
    "id": fields.Integer,
    "username": fields.String,
    "email": fields.String,
    "address": fields.String,
    "pincode": fields.String,
    "roles": fields.List(fields.String(attribute="name")),
    "active": fields.Boolean,
}

booking_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "post_id": fields.Integer,
    "booking_date": fields.DateTime,
    "username": fields.String(attribute="user.username"),
    "service": fields.String(attribute="post.service"),
    "post_name": fields.String(attribute="post.name"),
    "name":fields.String
}
get_booking_fields = {
    "name":fields.String,
    'booking_id': fields.Integer,
    'booking_date': fields.DateTime,
    'service':fields.String,  # Service name
    'name': fields.String,        # Service name
    'user_name': fields.String,
    'status': fields.String
}
get_booking_fields_for_user = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'post_id': fields.Integer,
    'booking_date': fields.DateTime,
    'status': fields.String,
    'post_details': fields.Nested({
        'name': fields.String,  # The post name
        'service': fields.String,  # The service offered in the post
        'price': fields.Integer,  # The price of the service
        'username': fields.String,  # Username of the person who created the post
    })
}

class user_list(Resource):
    @auth_required("token")
    @marshal_with(user_fields)
    def get(self):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to view this resource"}, 403
        else:
            users = User.query.all()
            # print(users)
            return users 
        
    @auth_required("token")
    def delete(self, user_id):
        if not current_user.has_role("admin") and current_user.id != 1:
            return {"message": "You are not authorized to delete this resource"}, 403
        else:
            user_instance = User.query.get(user_id)
            if not user_instance:
                return {"message": "no User found"}, 404
            try:
                db.session.delete(user_instance)
                db.session.commit()
                return {"message": "User deleted successfully"}, 204
            except Exception as e:
                db.session.rollback()
                return {"message": "Error deleting user"}, 500
            
    @auth_required("token")
    def put(self, user_id):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to update this resource"}, 403
        if user_id == 1:
            return {"message": "You cannot update the admin user"}, 403
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        try:
            user.active = not user.active
            db.session.commit()
            return {"message": "User status updated successfully"}, 200
        except:
            db.session.rollback()
            return {"message": "Error updating user status"}, 500

class get_user(Resource):
    @auth_required("token")
    @marshal_with(user_fields)
    def get(self,user_id):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to view this resource"}, 403
        else:
            users = User.query.get(user_id)
            # print(users)
            return users 
        
    
    

class post_api(Resource):

    @auth_required("token")
    @cache.memoize(timeout=5)
    @marshal_with(post_fields)
    def get(self, post_id):
        post_instance = post.query.get(post_id)

        if not post_instance:
            return {"message": "Post not found"}, 404
        return post_instance
    

    @auth_required("token")
    def delete(self, post_id):
        post_instance = post.query.get(post_id)

        if not post_instance:
            return {"message": "Post not found"}, 404

        if (post_instance.user_id == current_user.id) or current_user.has_role("admin"):
            try:
                db.session.delete(post_instance)
                db.session.commit()
                cache.delete_memoized(self.get, post_id)  # Clear the cache after deleting a post
            except:
                db.session.rollback()
                return {"message": "Error deleting post"}, 500
        else:
            return {"message": "You are not authorized to delete this post"}, 403

        return {"message": "Post deleted"}, 204
    
    @auth_required("token")   
    def put(self, post_id):
        data =request.get_json()
        post_instance = post.query.get(post_id)

        if not post_instance:
            return {"message": "Post not found"}, 404
        
        if post_instance.user_id == current_user.id:
            try:
                post_instance.name = data.get("name")
                post_instance.service = data.get("service")
                post_instance.content = data.get("content")
                post_instance.price = data.get("price") 
                db.session.commit()
                cache.delete_memoized(post_api.get, post_id)  # Clear the cache after updating a post
                cache.delete("post_list")  # Clear the cache for the post list
                return {"message": "Post updated"}, 200
            except:
                db.session.rollback()
                return {"message": "Error updating post"}, 500
        else:
            return {"message": "You are not authorized to update this post"}, 403  


class postlist_api(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="post_list")
    @marshal_with(post_fields)
    def get(self):
        posts = post.query.all()
        
        services = [{"id": post.id,"service": post.service, "content": post.content, "user_id": post.user_id, "name":post.name} for post in posts]
        return services

    @auth_required("token")
    def post(self):  # Create a new post
        data = request.get_json()

        new_post = post(
            name = data.get("name"),
            service=data.get("service"),
            content=data.get("content"),
            price=data.get("price"),
            user_id=current_user.id,
        )
        try:
            db.session.add(new_post)
            db.session.commit()
            cache.delete("post_list")  # Clear the cache after creating a new post
            return {"message": "Post created"}, 201
        except:
            db.session.rollback()
            return {"message": "Error creating post"}, 500
        
class bookings(Resource):
    def post(self):
        data = request.get_json()
        # print(data)
        user_id = current_user.id
        post_id = data.get("post_id")
        date= data.get("booking_date")
        booking_date = parse_date(date)

        if not post_id or not booking_date:
            return {"message": "Missing required fields"},
        post_count = servicebooking.query.filter_by(user_id=user_id, status='pending').count() 
        print(post_count,1111)
        if post_count>=5:
             return {"message": "Cant book more than 5 services"}, 500
        existing_booking = servicebooking.query.filter_by(
            user_id=user_id, post_id=post_id, booking_date=booking_date
        ).first()

        if existing_booking:
            return {"message": "You have already booked this service on this day"}, 400
        new_booking = servicebooking(
            user_id = user_id,
            post_id = post_id,
            booking_date = booking_date,
        )
        try:
            db.session.add(new_booking)
            db.session.commit()

            user = User.query.get(user_id)
            post_ins = post.query.get(post_id)
            subject = "Booking confirmed"
            content = f"""
            <h1>Booking Confirmed</h1>
            <p>Dear {user.username},</p>
            <p>Your booking for the service <strong>{post_ins.name}</strong> has been confirmed.</p>
            <p>Booking Date: {booking_date.strftime('%Y-%m-%d')}</p>
            <p>Thank you for using our service!</p>
            """
            email.delay(user.email, subject, content)
            return {"message": "Booking created"}, 201
        except Exception as e:
            db.session.rollback()
            
            return {"message": "Error creating booking"}, 500

class booking_list(Resource):
    @auth_required("token")
    @marshal_with(booking_fields)
    def get(self):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to view this resource"},
        bookings = servicebooking.query.all()
        return bookings     

class services_by_staff(Resource):
    @auth_required("token")
    @marshal_with(post_fields)
    def get(self, staff_id):
        # Ensure only admin or the staff member can access this data
        if not current_user.has_role("admin") and current_user.id != staff_id:
            return {"message": "You are not authorized to view this resource"}, 403
        
        posts = post.query.filter_by(user_id=staff_id).all()
        if not posts:
            return {"message": "No services found for this staff"}, 404
        
        return posts, 200    
class bookings_by_user(Resource):
    @auth_required("token")
    @marshal_with(get_booking_fields)
    def get(self, user_id):
        print(1)
        # Ensure only admin or the user can access this data
        if current_user.has_role("admin"):
            
            # If the user is admin or accessing their own bookings, get the bookings
            bookings = servicebooking.query.filter_by(user_id=user_id).all()
        elif current_user.has_role("staff"):
            # If the user is staff, fetch bookings for posts created by the staff
            bookings = db.session.query(servicebooking).join(post, post.id == servicebooking.post_id).filter(post.user_id == current_user.id).all()
        else:
            return {"message": "You are not authorized to view this resource"}, 403
        
        if not bookings:
            return {"message": "No bookings found for this user"}, 101
        
        result = []
        for booking in bookings:
            # Use a single query to fetch both 'service' and 'name'
            post_details = db.session.query(post.service, post.name).filter(post.id == booking.post_id).first()
            user_name = db.session.query(User.username).filter(User.id == booking.user_id).first()
            print(post_details.name)
            # Ensure to handle the case when post_details or user_name is None
            if post_details:
                service = post_details.service
                name = post_details.name
            
            user_name = user_name[0] if user_name else 'N/A'
            booking_date = booking.booking_date if isinstance(booking.booking_date, datetime) else datetime.strptime(booking.booking_date, '%Y-%m-%d')
            print(user_name)
            # Prepare booking info
            booking_info = {
                'booking_id': booking.id,
                'booking_date': booking_date,
                'service': service,  # Service name
                'name': name,        # Service name
                'user_name': user_name,
                'status': booking.status
            }
            result.append(booking_info)
            
        
        return result, 200

class bookings_for_user(Resource):
    @auth_required("token")
    @marshal_with(get_booking_fields_for_user)
    def get(self):
        print(current_user.id)
        
        if current_user.has_role("admin"):
            # Admin should be able to see all bookings (as per the original code)
            bookings = servicebooking.query.filter_by(user_id=current_user.id).all()
            return bookings
        elif current_user.has_role("user"):
            # For a user, we fetch their bookings and include post details
            bookings = servicebooking.query.filter_by(user_id=current_user.id).all()

            # Add the additional details (post details + username of the user who created the post)
            for booking in bookings:
                post_data = booking.post  # The associated post object
                # Append the additional post details to the booking
                booking.post_details = {
                    'name': post_data.name,
                    'service': post_data.service,
                    'price': post_data.price,
                    'username': post_data.user.username  # Assuming `user` is a relationship on the `post` model
                }
            
            return bookings
        else:
            return {"message": "You are not authorized to view this resource"}, 403

class reject_booking(Resource):
    @auth_required("token")
    def put(self, booking_id):
        print("comming")
        if not current_user.has_role("admin") and not current_user.has_role("staff"):
            return {"message": "You are not authorized to perform this action"}, 403
        
        booking = servicebooking.query.get(booking_id)
        ser_user = User.query.get(booking.user_id)
        if not booking:
            return {"message": "Booking not found"}, 404

        try:
            booking.status = "rejected"  # Update status to "rejected"
            db.session.commit()
            subject = "Your Booking Has Been Rejected"
            content = f"""
                <p>Dear {ser_user.username},</p>
                <p>We regret to inform you that your booking (Booking ID: {booking.id}) for the services has been rejected.</p>
                <p>If you have any questions or concerns, please contact us.</p>
                <p>Best regards,<br>Your Service Team</p>
            """
            send_email(ser_user.email, subject, content)
            return {"message": "Booking rejected successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error rejecting booking: {str(e)}"}, 500



class accept_booking(Resource):
    @auth_required("token")
    def put(self, booking_id):
        print("comming")
        if not current_user.has_role("admin") and not current_user.has_role("staff"):
            return {"message": "You are not authorized to perform this action"}, 403
        
        booking = servicebooking.query.get(booking_id)
        ser_user = User.query.get(booking.user_id)
        if not booking:
            return {"message": "Booking not found"}, 404

        try:
            booking.status = "accepted"  # Update status to "accepted"
            db.session.commit()

            subject = "Your Booking Has Been Accepted"
            content = f"""
                <p>Dear {ser_user.username},</p>
                <p>We are pleased to inform you that your booking (Booking ID: {booking.id}) for the services has been accepted.</p>
                <p>If you have any further questions or need assistance, feel free to contact us.</p>
                <p>Best regards,<br>Your Service Team</p>
            """
            send_email(ser_user.email, subject, content)

            return {"message": "Booking accepted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error accepting booking: {str(e)}"}, 500

class done_and_review(Resource):
    @auth_required("token")
    def post(self, booking_id):       
        booking = servicebooking.query.get(booking_id)
        p_id=post.query.get(booking.post_id).user_id
        data = request.get_json()
        review_text = data.get("review")
        star_rating = data.get("stars")
        print(data,122)
        try:
            booking.status = "done" 
            new_review =review(
                user_id=booking.user_id,
                post_id=booking.post_id,
                star=star_rating,
                content=review_text,
                p_id=p_id
            )
            db.session.add(new_review)
            db.session.commit()
            return {"message": "review done successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error review failed: {str(e)}"}, 500
        
api.add_resource(user_list, "/users", endpoint="users_list")
api.add_resource(get_user, "/user/<int:user_id>")
api.add_resource(post_api, "/posts/<int:post_id>")
api.add_resource(postlist_api, "/posts")
api.add_resource(bookings, "/book_service")
api.add_resource(booking_list, "/bookings")
api.add_resource(services_by_staff, "/staff/<int:staff_id>/services")
api.add_resource(bookings_by_user, "/bookings/<int:user_id>")

api.add_resource(reject_booking, "/bookings/reject/<int:booking_id>")
api.add_resource(accept_booking, "/bookings/accept/<int:booking_id>")
api.add_resource(bookings_for_user, "/books")
api.add_resource(done_and_review, "/review/<int:booking_id>")
