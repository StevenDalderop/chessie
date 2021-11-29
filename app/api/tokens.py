from app.api import bp
from app.api.auth import basic_auth, token_auth
from app import db
from app.models import User

from flask import request
from flask_login import login_user

@bp.route("/tokens", methods=['POST'])
@basic_auth.login_required
def get_token():
    user = basic_auth.current_user()
    token = user.get_token()
    login_user(user)
    user.is_online = True
    db.session.commit()
    return {'token': token}


@bp.route("/tokens", methods=['DELETE'])
@token_auth.login_required
def revoke_token():
    token_auth.current_user().revoke_token()
    db.session.commit()
    return "", 204


@bp.route("/is_token_valid")
def is_authenticated():
    token = request.args.get("token")
    user = User.check_token(token)  
    if user:
        return {"user": user.to_dict()}
    return {"user": None}
