from flask_restful import Api, Resource, fields, marshal_with
from flask import request, current_app as app
from backend.model import post, servicebooking
from flask_security import auth_required, current_user
from backend.model import db, User
from datetime import datetime

cache = app.cache

api = Api(prefix="/api")

post_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "service": fields.String,
    "content": fields.String,
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
            except:
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
        print(data)
        user_id = current_user.id
        post_id = data.get("post_id")
        booking_date = datetime.strptime(data.get("booking_date"), "%Y-%m-%d")

        if not post_id or not booking_date:
            return {"message": "Missing required fields"},

        new_booking = servicebooking(
            user_id = user_id,
            post_id = post_id,
            booking_date = booking_date,
        )
        try:
            db.session.add(new_booking)
            db.session.commit()
            return {"message": "Booking created"}, 201
        except:
            db.session.rollback()
            return {"message": "Error creating booking"}, 500

        
        
api.add_resource(user_list, "/users", endpoint="users_list")
api.add_resource(user_list, "/users/<int:user_id>", endpoint="users_details")
api.add_resource(post_api, "/posts/<int:post_id>")
api.add_resource(postlist_api, "/posts")
api.add_resource(bookings, "/book_service")
