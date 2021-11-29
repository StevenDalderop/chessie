from app.api import bp
from app.api.errors import error_response
from app.api.auth import token_auth
from app.models import User
from app import db

from flask import request
from datetime import datetime, timedelta

@bp.route("/users", methods=["GET"])
@token_auth.login_required
def get_users():
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 100)

    is_online = request.args.get('is_online')
    if is_online is not None:
        users = User.query.filter((User.last_seen > datetime.utcnow() - timedelta(seconds = 300)) & User.is_online)
    else:
        users = User.query

    data = User.to_collection_dict(users, page, per_page, 'api.get_users')
    return data


@bp.route("/users/<int:id>", methods=["GET"])
@token_auth.login_required
def get_user(user_id):
    user = User.query.get_or_404(user_id).to_dict()
    return user


@bp.route("/users", methods=["POST"])
def create_user():
    data = request.get_json() or {}
    if 'name' not in data or 'password' not in data or data['name'] == "" or data['password'] == "":
        return error_response(400, 'No name or password provided')
    if User.query.filter_by(name = data['name']).first():
        return error_response(400, 'Name already exists')
    user = User()
    user.from_dict(data, new_user=True)
    db.session.add(user)
    db.session.commit()
    return user.to_dict(), 201


@bp.route("/users/<int:id>", methods=["PUT"])
@token_auth.login_required
def update_user(user_id):
    if token_auth.current_user().id != user_id:
        return error_response(403, 'is not current user')
    user = User.query.get_or_404(user_id)
    data = request.get_json() or {}
    if 'name' in data and data['name'] != user.name and \
        User.query.filter_by(name = data['name']).first():
        return error_response(400, 'invalid name')
    user.from_dict(data)
    db.session.commit()
    return user.to_dict()
