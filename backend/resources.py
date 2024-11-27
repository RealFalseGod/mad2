from flask_restful import Api, Resource, fields, marshal_with
from flask import request, current_app as app
from backend.model import post
from flask_security import auth_required, current_user
from backend.model import db

cache = app.cache

api = Api(prefix="/api")

post_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "service": fields.String,
    "content": fields.String,
    "user_id": fields.Integer,
}


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

        if post_instance.user_id == current_user.id:
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
        

     
            
        


api.add_resource(post_api, "/posts/<int:post_id>")
api.add_resource(postlist_api, "/posts")
