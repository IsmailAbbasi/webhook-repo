from flask import Flask, request, jsonify, render_template
from models import collection
from datetime import datetime

app = Flask(__name__)

@app.route('/')
def index():
    events = list(collection.find().sort("timestamp", -1).limit(10))
    return render_template("index.html", events=events)

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()
    event_type = request.headers.get('X-GitHub-Event')
    timestamp = datetime.utcnow()

    event_data = {
        "event_type": event_type,
        "timestamp": timestamp,
    }

    if event_type == "push":
        event_data["author"] = data["pusher"]["name"]
        event_data["to_branch"] = data["ref"].split("/")[-1]
    elif event_type == "pull_request":
        event_data["author"] = data["sender"]["login"]
        event_data["from_branch"] = data["pull_request"]["head"]["ref"]
        event_data["to_branch"] = data["pull_request"]["base"]["ref"]
    elif event_type == "merge":
        event_data["author"] = data["sender"]["login"]
        event_data["from_branch"] = data["pull_request"]["head"]["ref"]
        event_data["to_branch"] = data["pull_request"]["base"]["ref"]

    collection.insert_one(event_data)
    return jsonify({"status": "success"}), 200

@app.route('/api/events')
def api_events():
    events = list(collection.find().sort("timestamp", -1).limit(10))
    for e in events:
        e["_id"] = str(e["_id"])
        e["timestamp"] = e["timestamp"].strftime("%d %B %Y - %I:%M %p UTC")
    return jsonify(events)

if __name__ == '__main__':
    app.run(debug=True)
