from app import db
from app.errors import bp

from flask import render_template
from flask_login import login_required

@bp.app_errorhandler(404)
@login_required
def not_found(e):
    return render_template("index.html")

@bp.app_errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return render_template('index.html'), 500  