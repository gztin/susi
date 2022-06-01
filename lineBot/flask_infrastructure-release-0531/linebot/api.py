from flask import Blueprint, current_app, jsonify

# from models import UserStatus
# from db import db

linebot_api = Blueprint("linebot", __name__)


@linebot_api.route("/message", methods=["GET"])
def get_user_message():
    FB_APP_SECRET = current_app.config.get("FB_APP_SECRET")
    print(FB_APP_SECRET)

    return jsonify(
        {
            "Status": "Ok",
            "Message": "SUCCESS",
        }
    )


@linebot_api.route("/welcome")
def home():

    return "Hello, Flask!"
