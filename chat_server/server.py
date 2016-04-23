#!/usr/bin/env python

# Set this variable to "threading", "eventlet" or "gevent" to test the
# different async modes, or leave it set to None for the application to choose
# the best option based on available packages.
async_mode = None

if async_mode is None:
    try:
        import eventlet
        async_mode = 'eventlet'
    except ImportError:
        pass

    if async_mode is None:
        try:
            from gevent import monkey
            async_mode = 'gevent'
        except ImportError:
            pass

    if async_mode is None:
        async_mode = 'threading'

    print('async_mode is ' + async_mode)

# monkey patching is necessary because this application uses a background
# thread
if async_mode == 'eventlet':
    import eventlet
    eventlet.monkey_patch()
elif async_mode == 'gevent':
    from gevent import monkey
    monkey.patch_all()

import uuid
import time
from threading import Thread
from flask import Flask, render_template, session, request
from flask_socketio import SocketIO, emit, join_room, leave_room, \
    close_room, rooms, disconnect

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, async_mode=async_mode)

clients = {}




@app.route('/')
def index():
    return render_template('chat_room.html')


@socketio.on('register', namespace='/test')
def registerClient(message):
    clients[message["data"]] = request.sid
    emit('new client', {'all_clients': clients, 'just_added': message["data"]}, namespace='/test', broadcast=True)


@socketio.on('send message', namespace='/test')
def sendMessage(message):
    to_sid = clients[message["t"]]
    from_sid = clients[message["f"]]
    text = message["data"]
    print(to_sid, from_sid, text)
    emit('message sent', {"person_chatting": message["f"], "from": message["f"], "message": text}, room=to_sid)
    emit('message sent', {"person_chatting": message["t"], "from": message["f"], "message": text}, room=from_sid)


@socketio.on('create new chat', namespace='/test')
def createChat(message):
    to_sid = clients[message["t"]]
    from_sid = clients[message["f"]]
    print("creating new chat...")
    print(to_sid, from_sid);
    emit('make new chat', {"to": message["t"], "from": message["f"]}, room=to_sid)
    emit('make new chat', {"to": message["f"], "from": message["t"]}, room=from_sid)


@socketio.on('close chat', namespace='/test')
def createChat(message):
    to_sid = clients[message["t"]]
    from_sid = clients[message["f"]]
    print("creating new chat...")
    print(to_sid, from_sid);
    emit('closing chat', {"from": message["f"]}, room=to_sid)
    emit('closing chat', {"from": message["t"]}, room=from_sid)



@socketio.on('disconnect request', namespace='/test')
def disconnect_request(message):
    if message["data"] != "":
        clients.pop(message["data"])
        print("updating client dict...")
        emit('new client', {'all_clients': clients}, namespace='/test', broadcast=True)
        emit('closing chat', {"from": message["data"]}, namespace='/test', broadcast=True)
    disconnect()

@socketio.on('connect', namespace='/test')
def test_connect():
    emit('new client', {'all_clients': clients}, namespace='/test', broadcast=True)
    print("client connected")

@socketio.on_error('/test') # handles the '/chat' namespace
def error_handler_chat(e):
    print("error :( ")


if __name__ == '__main__':
    socketio.run(app, debug=True)
