from flask_restful import Api, Resource, fields, marshal_with
from flask import request, current_app as app
from backend.model import post
from flask_security import auth_required, current_user
from backend.model import db

cache = app.cache

api = Api(prefix="/api")

post_fields = {
    "id": fields.Integer,
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


class postlist_api(Resource):

    @auth_required("token")
    @cache.cached(timeout=10, key_prefix="post_list")
    @marshal_with(post_fields)
    def get(self):
        posts = post.query.all()
        return posts

    @auth_required("token")
    def post(self):  # Create a new post
        data = request.get_json()

        new_post = post(
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
