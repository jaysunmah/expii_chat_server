from flask import Flask

app = Flask(__name__)
#imported last to avoid reference circularity between the two app(s)
from app import views