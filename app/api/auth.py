from flask_httpauth import HTTPBasicAuth, HTTPTokenAuth
from app.api.errors import error_response
from app.models import User

from app import db 

basic_auth = HTTPBasicAuth()
token_auth = HTTPTokenAuth(scheme='Bearer')


@basic_auth.verify_password
def verfiy_password(username, password):
    user = User.query.filter_by(name=username).first()
    if user and user.verify_password(password):
        return user


@basic_auth.error_handler
def basic_auth_error(status):
    return error_response(status)


@token_auth.verify_token
def verify_token(token):
    user = User.check_token(token)
    return user


@token_auth.error_handler
def token_auth_error(status):
    if status == 401:
        message = "User not authenticated"        
        return error_response(status, message)
    return error_response(status)