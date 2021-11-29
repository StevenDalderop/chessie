from app import db
from app.main import bp
from app.models import *

from flask import render_template, request, Response, redirect, url_for
from flask_login import login_required, current_user  

@bp.before_app_request
def before_request():
    if current_user.is_authenticated:
        current_user.last_seen = datetime.utcnow()
        db.session.commit()


@bp.route("/")
def index():
    return render_template("index.html")
    