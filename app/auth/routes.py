from app.auth import bp
from app.models import User
from app import login_manager, db

from flask import render_template, request, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_required, login_user, logout_user, current_user
#from app.auth.email import send_password_reset_email


#@login_manager.unauthorized_handler
#def unauthorized():
#    print("Unauthorized..")
#    return redirect(url_for("auth.login"))


@bp.route("/signup", methods = ["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("index.html")

    name = request.form.get("name")
    password = request.form.get("password")
    
    user = User.query.filter_by(name=name).first()
    
    if user:
        return redirect(url_for("auth.signup"))
    
    new_user = User(name=name, password_hash=generate_password_hash(password), is_online = True)
    db.session.add(new_user)
    db.session.commit()
    return redirect(url_for("main.index"))        
    

@bp.route("/login", methods = ["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
        
    if request.method == "GET":
        return render_template("index.html")
    
    name = request.json.get("name")
    password = request.json.get("password")

    user = User.query.filter_by(name=name).first()
    
    if user is None or not user.verify_password(password):
        return {"name": name, "is_authenticated": False}
    
    login_user(user)
    user.is_online = True
    db.session.commit()
    return {"name": user.name, "is_authenticated": True}
    

@bp.route("/logout", methods = ["GET"])
@login_required
def logout():
    current_user.is_online = False
    db.session.commit()   
    logout_user()
    return redirect(url_for("auth.login"))

'''
@bp.route("/reset-password", methods = ["GET", "POST"])
def reset_password():
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
        
    if request.method == "GET":
        return render_template("index.html")
    
    email = request.form.get("email")
    user = User.query.filter_by(email = email).first()
    if user:
        send_password_reset_email(user)
    return redirect(url_for("auth.login"))'''


@bp.route("/set-password/<string:token>", methods = ["GET", "POST"])
def set_password(token):
    if current_user.is_authenticated:
        return redirect(url_for("main.index"))
    
    if request.method == "GET":
        return render_template("index.html")
        
    user = User.verify_password_reset_token(token)
    if user:
        password = request.form.get("password")
        user.set_password(password)
        db.session.commit() 

    return redirect(url_for("auth.login"))   
