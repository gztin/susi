from flask import Flask

from db import db
from linebot.api import linebot_api

app = Flask(__name__)
app.config.from_pyfile("local.cfg", silent=True)

# Setup DB Connection
db.init_app(app)

API_PREFIX = "/api/v1"
app.register_blueprint(linebot_api, url_prefix=API_PREFIX + "/linebot")
