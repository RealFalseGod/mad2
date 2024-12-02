from flask_restful import Api, Resource, fields, marshal_with
from flask import request, current_app as app
from backend.model import post, servicebooking, review, review_of_p, UserRoles
from flask_security import auth_required, current_user
from backend.model import db, User
from datetime import datetime
from dateutil.parser import parse as parse_date
from backend.celery.tasks import email
from backend.celery.mail_service import send_email
from sqlalchemy import func
from sqlalchemy import extract

cache = app.cache

api = Api(prefix="/api")

post_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "service": fields.String,
    "content": fields.String,
    "price": fields.Integer,
    "user_id": fields.Integer,
    "authorized": fields.Integer,
}
post_fields2 = {
    "id": fields.Integer,
    "name": fields.String,
    "service": fields.String,
    "content": fields.String,
    "price": fields.Integer,
    "user_id": fields.Integer,
    "username": fields.String,  # Access the associated user's username
    "total_jobs": fields.Integer,  # Total number of jobs the user has done
    "average_stars": fields.Float,
    "pincode": fields.Integer,
    "address": fields.String,
    "authorized": fields.Integer,
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

get_fields = {
    "id": fields.Integer,
    "username": fields.String,
    "email": fields.String,
    "address": fields.String,
    "pincode": fields.String,
    "roles": fields.List(fields.String(attribute="name")),
    "active": fields.Boolean,
    "role": fields.String,
}

booking_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "post_id": fields.Integer,
    "booking_date": fields.DateTime,
    "username": fields.String(attribute="user.username"),
    "service": fields.String(attribute="post.service"),
    "post_name": fields.String(attribute="post.name"),
    "name": fields.String,
}
get_booking_fields = {
    "name": fields.String,
    "booking_id": fields.Integer,
    "booking_date": fields.DateTime,
    "service": fields.String,  # Service name
    "name": fields.String,  # Service name
    "user_name": fields.String,
    "status": fields.String,
}
get_booking_fields_for_user = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "post_id": fields.Integer,
    "booking_date": fields.DateTime,
    "status": fields.String,
    "post_details": fields.Nested(
        {
            "name": fields.String,  # The post name
            "service": fields.String,  # The service offered in the post
            "price": fields.Integer,  # The price of the service
            "username": fields.String,  # Username of the person who created the post
            "authorized": fields.Integer,
        }
    ),
}

user_booking_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "post_id": fields.Integer,
    "booking_date": fields.DateTime,
    "status": fields.String,
}

review_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "p_id": fields.Integer,  # Assuming `p_id` is the post ID or relevant identifier
    "star": fields.Float,
    "content": fields.String,
}

post_fields3 = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "name": fields.String,
    "content": fields.String,
    "service": fields.String,
    "price": fields.Float,
    "authorized": fields.Integer,
}

response_fields = {
    "user_role": fields.String,
    "jobs_done": fields.Integer,
    "stars": fields.Float,
    "bookings": fields.List(fields.Nested(user_booking_fields)),
    "reviews": fields.List(fields.Nested(review_fields)),
    "posts": fields.List(fields.Nested(post_fields3)),
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
        print("ohhohoh")
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
    @marshal_with(get_fields)
    def get(self, user_id):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to view this resource"}, 403
        else:
            users = User.query.get(user_id)
            role = UserRoles.query.filter_by(user_id=user_id).first().role_id
            print(users, role)
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
                print("jajaj")
                db.session.delete(post_instance)
                db.session.commit()
                cache.delete_memoized(
                    self.get, post_id
                )  # Clear the cache after deleting a post
            except:
                db.session.rollback()
                return {
                    "message": "Cannot delete a approved post with service history"
                }, 500
        else:
            return {"message": "You are not authorized to delete this post"}, 403

        return {"message": "Post deleted"}, 204

    @auth_required("token")
    def put(self, post_id):
        data = request.get_json()
        post_instance = post.query.get(post_id)

        if not post_instance:
            return {"message": "Post not found"}, 404

        if post_instance.user_id == current_user.id:
            try:
                post_instance.name = data.get("name")
                post_instance.service = data.get("service")
                post_instance.content = data.get("content")
                post_instance.price = data.get("price")
                post_instance.authorized = 0
                db.session.commit()
                cache.delete_memoized(
                    post_api.get, post_id
                )  # Clear the cache after updating a post
                cache.delete("post_list")  # Clear the cache for the post list
                return {"message": "Post updated"}, 200
            except:
                db.session.rollback()
                return {"message": "Error updating post"}, 500
        else:
            return {"message": "You are not authorized to update this post"}, 403


class postlist_api(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="postlist_api")
    @marshal_with(post_fields)
    def get(self):
        posts = post.query.all()

        services = [
            {
                "id": post.id,
                "service": post.service,
                "content": post.content,
                "user_id": post.user_id,
                "name": post.name,
            }
            for post in posts
        ]
        return services

    @auth_required("token")
    def post(self):  # Create a new post
        data = request.get_json()
        c = post.query.filter_by(user_id=current_user.id, authorized=1).count()
        if c >= 2:
            return {"message": "Cant create more than 2 posts"}, 500
        new_post = post(
            name=data.get("name"),
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


class postlist2(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="postlist2")
    @marshal_with(post_fields2)
    def get(self):
        postssssss = post.query.filter_by(authorized=1).all()
        services = []

        for posts in postssssss:
            user = User.query.get(posts.user_id)  # Fetch the user for the current post
            user_review = review_of_p.query.filter_by(p_id=posts.user_id).first()
            total_jobs = user_review.no_of_job if user_review else 0
            average_stars = float(user_review.star) if user_review else 0.0
            services.append(
                {
                    "id": posts.id,
                    "name": posts.name,
                    "service": posts.service,
                    "content": posts.content,
                    "price": posts.price,
                    "user_id": posts.user_id,
                    "username": user.username,  # Access the associated user's username
                    "total_jobs": total_jobs,  # Total number of jobs the user has done
                    "average_stars": average_stars,
                    "pincode": user.pincode,
                    "address": user.address,
                }
            )

        return services

    @auth_required("token")
    def post(self):  # Create a new post
        data = request.get_json()

        new_post = post(
            name=data.get("name"),
            service=data.get("service"),
            content=data.get("content"),
            price=data.get("price"),
            user_id=current_user.id,
        )
        try:
            db.session.add(new_post)
            db.session.commit()
            cache.delete("postlist2")  # Clear the cache after creating a new post
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
        date = data.get("booking_date")
        booking_date = parse_date(date)

        if not post_id or not booking_date:
            return ({"message": "Missing required fields"},)
        post_count = servicebooking.query.filter_by(
            user_id=user_id, status="pending"
        ).count()
        print(post_count, 1111)
        if post_count >= 5:
            return {"message": "Cant book more than 5 services"}, 500
        existing_booking = (
            servicebooking.query.filter_by(
                user_id=user_id, post_id=post_id, booking_date=booking_date, status=""
            )
            .filter(servicebooking.status != "rejected")
            .first()
        )

        if existing_booking:
            return {"message": "You have already booked this service on this day"}, 400
        new_booking = servicebooking(
            user_id=user_id,
            post_id=post_id,
            booking_date=booking_date,
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
            return ({"message": "You are not authorized to view this resource"},)
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
            bookings = (
                db.session.query(servicebooking)
                .join(post, post.id == servicebooking.post_id)
                .filter(post.user_id == current_user.id)
                .all()
            )
        else:
            return {"message": "You are not authorized to view this resource"}, 403

        if not bookings:
            return {"message": "No bookings found for this user"}, 101

        result = []
        for booking in bookings:
            # Use a single query to fetch both 'service' and 'name'
            post_details = (
                db.session.query(post.service, post.name)
                .filter(post.id == booking.post_id)
                .first()
            )
            user_name = (
                db.session.query(User.username)
                .filter(User.id == booking.user_id)
                .first()
            )
            print(post_details.name)
            # Ensure to handle the case when post_details or user_name is None
            if post_details:
                service = post_details.service
                name = post_details.name

            user_name = user_name[0] if user_name else "N/A"
            booking_date = (
                booking.booking_date
                if isinstance(booking.booking_date, datetime)
                else datetime.strptime(booking.booking_date, "%Y-%m-%d")
            )
            print(user_name)
            # Prepare booking info
            booking_info = {
                "booking_id": booking.id,
                "booking_date": booking_date,
                "service": service,  # Service name
                "name": name,  # Service name
                "user_name": user_name,
                "status": booking.status,
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
                    "name": post_data.name,
                    "service": post_data.service,
                    "price": post_data.price,
                    "username": post_data.user.username,  # Assuming `user` is a relationship on the `post` model
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


class cancel_booking(Resource):
    @auth_required("token")
    def put(self, booking_id):
        print("halo")
        booking = servicebooking.query.get(booking_id)
        ser_user = User.query.get(booking.user_id)
        if not booking:
            return {"message": "Booking not found"}, 404
        try:
            booking.status = "canceled"
            db.session.commit()
            subject = "Your Booking Has Been canceled"
            content = f"""
                <p>Dear {ser_user.username},</p>
                <p>We regret to inform you that your booking (Booking ID: {booking.id}) for the services has been canceld.</p>
                <p>If you have any questions or concerns, please contact us.</p>
                <p>Best regards,<br>Your Service Team</p>
            """
            send_email(ser_user.email, subject, content)
            return {"message": "Booking canceling successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error canceling booking: {str(e)}"}, 500


class done_and_review(Resource):
    @auth_required("token")
    def post(self, booking_id):
        booking = servicebooking.query.get(booking_id)
        p_id = post.query.get(booking.post_id).user_id
        data = request.get_json()
        review_text = data.get("review")
        star_rating = data.get("stars")
        print(data, 122)
        try:
            booking.status = "done"
            new_review = review(
                user_id=booking.user_id,
                post_id=booking.post_id,
                star=star_rating,
                content=review_text,
                p_id=p_id,
            )
            db.session.add(new_review)
            user_review_of_p = review_of_p.query.filter_by(p_id=p_id).first()
            if user_review_of_p:
                user_review_of_p.no_of_job += 1  # Increment the number of jobs by 1
                new_star = user_review_of_p.star  # Current star rating
                total_jobs = user_review_of_p.no_of_job
                # Calculate the new average star rating
                # Assuming you want to keep a running average
                updated_avg_star = (new_star + star_rating) / 2
                user_review_of_p.star = updated_avg_star
            else:
                user_review_of_p = review_of_p(
                    p_id=p_id,
                    no_of_job=1,  # First job done
                    star=star_rating,  # Set the initial star rating
                )
                db.session.add(user_review_of_p)
            db.session.commit()
            return {"message": "review done successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error review failed: {str(e)}"}, 500


class admin_bookings_for_user(Resource):
    @auth_required("token")
    @marshal_with(response_fields)
    def get(self, user_id):
        if not current_user.has_role("admin"):
            return {"message": "You are not authorized to view this resource"}, 403

        # Fetch the user's role
        role = UserRoles.query.filter_by(user_id=user_id).first().role_id

        if role == 2:  # Normal User
            bookings = servicebooking.query.filter_by(user_id=user_id).all()
            reviews = review.query.filter_by(user_id=user_id).all()
            return {
                "user_role": "user",
                "bookings": bookings,
                "reviews": reviews,
                "posts": [],  # No posts for normal users
            }

        elif role == 3:  # Staff
            posts = post.query.filter_by(user_id=user_id).all()
            reviews = review.query.filter_by(p_id=user_id).all()
            p_review = review_of_p.query.filter_by(p_id=user_id).first()
            if p_review:
                jobs_done = p_review.no_of_job
                stars = p_review.star
            else:
                jobs_done = 0  # Default value when there's no review
                stars = 0  # Default value or null when there's no review
            bookings = []
            for p in posts:
                bookings.extend(servicebooking.query.filter_by(post_id=p.id).all())
            return {
                "user_role": "staff",
                "bookings": bookings,
                "reviews": reviews,
                "posts": posts,
                "jobs_done": jobs_done,
                "stars": stars,
            }

        return {"message": "Invalid user role"}, 400


class get_postlist(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="get_postlist")
    @marshal_with(post_fields)
    def get(self):
        posts = post.query.filter_by(user_id=current_user.id).all()
        return posts


class get_authpostlist(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="get_authpostlist")
    @marshal_with(post_fields)
    def get(self):
        posts = post.query.all()
        return posts


class authorize(Resource):
    @auth_required("token")
    def patch(self, post_id):
        posts = post.query.get(post_id)
        if not posts:
            return {"message": "Post not found"}, 404

        posts.authorized = 1
        db.session.commit()
        return {"message": "Post authorized successfully"}, 200


class unauthorize(Resource):
    @auth_required("token")
    def patch(self, post_id):
        posts = post.query.get(post_id)
        if not post:
            return {"message": "Post not found"}, 404

        posts.authorized = 0
        db.session.commit()
        return {"message": "Post unauthorized successfully"}, 200


class get_admin_stats(Resource):
    admin_stats_fields = {
        "total_active_users": fields.Integer,
        "staff_users": fields.Integer,
        "regular_users": fields.Integer,
        "total_reviews_count": fields.Integer,
        "average_rating": fields.Float,
        "recent_reviews": fields.List(
            fields.Nested(
                {
                    "user_id": fields.Integer,
                    "post_id": fields.Integer,
                    "star": fields.Integer,
                    "content": fields.String,
                }
            )
        ),
        "top_3_staff_by_reviews": fields.List(
            fields.Nested(
                {
                    "id": fields.Integer,
                    "username": fields.String,
                    "star": fields.Float,
                }
            )
        ),
        "total_jobs_done": fields.Integer,
        "total_requests_this_month": fields.Integer,
        "total_requests_expired_this_month": fields.Integer,
        "total_jobs_this_month": fields.Integer,
        "total_pending_this_month": fields.Integer,
    }

    @auth_required("token")
    @marshal_with(admin_stats_fields)
    def get(self):
        print("works")
        active_users_count = User.query.filter_by(active=True).count() - 1

        # Count staff users
        staff_users_count = (
            db.session.query(User)
            .join(UserRoles)
            .filter(
                User.active == True,  # Ensure the user is active
                UserRoles.role_id == 3,  # Ensure the user has role_id 2
            )
            .count()
        )
        total_reviews_count = review.query.count()
        average_rating = db.session.query(db.func.avg(review.star)).scalar()
        recent_reviews = (
            db.session.query(
                review.user_id, review.post_id, review.star, review.content
            )
            .order_by(review.id.desc())
            .limit(5)
            .all()
        )
        # Count regular users
        regular_users_count = (
            db.session.query(User)
            .join(UserRoles)
            .filter(
                User.active == True,
                UserRoles.role_id == 2,
            )
            .count()
        )
        top_3_staff_by_reviews = (
            db.session.query(
                User.id,  # User ID
                User.username,  # Assuming there's a 'username' field
                review_of_p.star,
            )
            .join(
                review_of_p,
                review_of_p.p_id == User.id,
            )
            .order_by(review_of_p.star.desc())
            .limit(3)
            .all()
        )
        total_jobs_done = (
            db.session.query(func.count(servicebooking.id))
            .filter(servicebooking.status == "done")
            .scalar()
        )
        total_requests_this_month = (
            db.session.query(func.count(servicebooking.id))
            .filter(
                func.extract("month", servicebooking.booking_date)
                == datetime.now().month,
                func.extract("year", servicebooking.booking_date)
                == datetime.now().year,
            )
            .scalar()
        )
        total_requests_expired_this_month = (
            db.session.query(func.count(servicebooking.id))
            .filter(
                func.extract("month", servicebooking.booking_date)
                == datetime.now().month,
                func.extract("year", servicebooking.booking_date)
                == datetime.now().year,
                servicebooking.status == "expired",
            )
            .scalar()
        )
        total_jobs_this_month = (
            db.session.query(func.count(servicebooking.id))
            .filter(
                func.extract("month", servicebooking.booking_date)
                == datetime.now().month,
                func.extract("year", servicebooking.booking_date)
                == datetime.now().year,
                servicebooking.status == "done",
            )
            .scalar()
        )
        total_pending_this_month = (
            db.session.query(func.count(servicebooking.id))
            .filter(
                func.extract("month", servicebooking.booking_date)
                == datetime.now().month,
                func.extract("year", servicebooking.booking_date)
                == datetime.now().year,
                servicebooking.status == "accepted",
            )
            .scalar()
        )

        response_data = {
            "total_active_users": active_users_count,
            "staff_users": staff_users_count,
            "regular_users": regular_users_count,
            "total_reviews_count": total_reviews_count,
            "average_rating": average_rating,
            "recent_reviews": [
                {
                    "user_id": review.user_id,
                    "post_id": review.post_id,
                    "star": review.star,
                    "content": review.content,
                }
                for review in recent_reviews
            ],
            "top_3_staff_by_reviews": [
                {
                    "id": staff[0],
                    "username": staff[1],
                    "star": staff[2],
                }
                for staff in top_3_staff_by_reviews
            ],
            "total_jobs_done": total_jobs_done,
            "total_requests_this_month": total_requests_this_month,
            "total_requests_expired_this_month": total_requests_expired_this_month,
            "total_jobs_this_month": total_jobs_this_month,
            "total_pending_this_month": total_pending_this_month,
        }

        return response_data


class get_staff_stats(Resource):
    staff_stats_fields = {
        "total_jobs_done": fields.Integer,
        "total_jobs_to_do": fields.Integer,
        "total_jobs_requests": fields.Integer,
        "rating": fields.Float,
        "recent_reviews": fields.List(fields.Nested(review_fields)),
    }

    @auth_required("token")
    def get(self):
        p_id = current_user.id
        total_jobs_done = (
            db.session.query(func.count(servicebooking.id))
            .join(
                post, post.id == servicebooking.post_id
            )  # Join post table using post_id
            .filter(
                servicebooking.status == "done",  # Filter for completed jobs
                post.user_id == p_id,  # Match the desired staff_id from post table
            )
            .scalar()
        )
        total_jobs_to_do = (
            db.session.query(func.count(servicebooking.id))
            .join(
                post, post.id == servicebooking.post_id
            )  # Join post table using post_id
            .filter(
                servicebooking.status == "accepted",  # Filter for completed jobs
                post.user_id == p_id,  # Match the desired staff_id from post table
            )
            .scalar()
        )
        total_jobs_requests = (
            db.session.query(func.count(servicebooking.id))
            .join(
                post, post.id == servicebooking.post_id
            )  # Join post table using post_id
            .filter(
                servicebooking.status == "pending",  # Filter for completed jobs
                post.user_id == p_id,  # Match the desired staff_id from post table
            )
            .scalar()
        )
        print(total_jobs_done, total_jobs_to_do, total_jobs_requests)
        r = review_of_p.query.filter_by(p_id=p_id).first()
        rating = 0
        if r:
            rating = int(r.star)
        revs = (
            review.query.filter_by(p_id=p_id).order_by(review.id.desc()).limit(3).all()
        )

        response_data = {
            "total_jobs_done": total_jobs_done,
            "total_jobs_to_do": total_jobs_to_do,
            "total_jobs_requests": total_jobs_requests,
            "rating": rating,
            "recent_reviews": [
                {
                    "user_id": rev.user_id,
                    "post_id": rev.post_id,
                    "star": int(rev.star),
                    "content": rev.content,
                }
                for rev in revs
            ],
        }

        return response_data


class get_user_stats(Resource):
    user_stats_fields = {
    "total_jobs_done": fields.Integer,
    "total_jobs_pending": fields.Integer,
    "jobs_rejected_this_month": fields.Integer,
    "last_two_reviews": fields.List(fields.Nested(review_fields)),
}
    @auth_required("token")

    def get(self):
        print("haha")
        ui = current_user.id
        total_jobs_done = servicebooking.query.filter_by(user_id=ui, status="done").count()
        total_jobs_pending = servicebooking.query.filter_by(
            user_id=ui, status="accepted"
        ).count()
        last_two_reviews = (
            review.query.filter_by(user_id=ui)
            .order_by(
                review.id.desc()
            )  # Replace 'id' with 'timestamp' if that's the ordering field
            .limit(2)
            .all()
        )
        current_month = datetime.now().month
        current_year = datetime.now().year
        jobs_rejected_this_month = servicebooking.query.filter(
            servicebooking.user_id == ui,  # Match the specific user
            servicebooking.status == "rejected",  # Filter for rejected jobs
            extract("month", servicebooking.booking_date)
            == current_month,  # Filter for the current month
            extract("year", servicebooking.booking_date)
            == current_year,  # Filter for the current year
        ).count()  # Get the count of such jobs
        print(total_jobs_pending,total_jobs_done,last_two_reviews,jobs_rejected_this_month)
        data = {
                "total_jobs_done": total_jobs_done,
                "total_jobs_pending": total_jobs_pending,
                "jobs_rejected_this_month": jobs_rejected_this_month,
                "last_two_reviews": [
                    {
                    "post_id": r.post_id,
                    "star": int(r.star),
                    "content": r.content,
                    }
                    for r in last_two_reviews
                ] if last_two_reviews else [],
            }
        
        return data


api.add_resource(user_list, "/users", endpoint="users_list")
api.add_resource(user_list, "/users/<int:user_id>")
api.add_resource(get_user, "/user/<int:user_id>")
api.add_resource(post_api, "/posts/<int:post_id>")
api.add_resource(postlist_api, "/posts")
api.add_resource(bookings, "/book_service")
api.add_resource(booking_list, "/bookings")
api.add_resource(services_by_staff, "/staff/<int:staff_id>/services")
api.add_resource(bookings_by_user, "/bookings/<int:user_id>")
api.add_resource(reject_booking, "/bookings/reject/<int:booking_id>")
api.add_resource(accept_booking, "/bookings/accept/<int:booking_id>")
api.add_resource(cancel_booking, "/bookings/cancel/<int:booking_id>")
api.add_resource(bookings_for_user, "/books")
api.add_resource(done_and_review, "/review/<int:booking_id>")
api.add_resource(postlist2, "/post_list")
api.add_resource(admin_bookings_for_user, "/admin_book/<int:user_id>")
api.add_resource(get_postlist, "/get_postlist")
api.add_resource(get_authpostlist, "/get_authpostlist")
api.add_resource(authorize, "/authorize/<int:post_id>")
api.add_resource(unauthorize, "/unauthorize/<int:post_id>")
api.add_resource(get_admin_stats, "/get_admin_stat")
api.add_resource(get_staff_stats, "/get_staff_stat")
api.add_resource(get_user_stats, "/get_user_stat")