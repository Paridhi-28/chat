# app2.py
import socketio
import openai
import os
import sys

# Ensure your API key is set in the environment!
openai.api_key = os.getenv('OPENAI_API_KEY')
if openai.api_key is None:
    print("OPENAI_API_KEY environment variable is not set.", flush=True)
    sys.exit(1)

model = "gpt-4o-mini"  # or "gpt-3.5-turbo", etc.

# Enable logging for debugging purposes.
sio = socketio.Client(logger=True, engineio_logger=True)

@sio.event
def connect():
    print("Connected to server.", flush=True)

@sio.event
def messages(data):
    print("Message received from server:", flush=True)
    print(data, flush=True)
    # Only respond if the last message is from the user.
    if isinstance(data, list) and data and data[-1].get("role") == "user":
        Response(data).response()

@sio.event
def disconnect():
    print("Disconnected from server.", flush=True)

class Response:
    def __init__(self, data):
        print("Initializing response processing", flush=True)
        self.data = data

    def response(self):
        try:
            response = openai.chat.completions.create(
                model=model,
                messages=self.data
            )
            reply = response.choices[0].message.content
            print("Reply generated, sending back to server", flush=True)
            sio.emit('ai response', reply)
        except Exception as e:
            print("Error generating reply:", e, flush=True)

# Specify transports to force a websocket connection.
sio.connect('http://localhost:5000', transports=['websocket'])
sio.wait()
