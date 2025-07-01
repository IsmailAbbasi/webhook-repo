from flask import Flask, request, jsonify, render_template
from pymongo import MongoClient
from datetime import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')

# ✅ 1. Connect to MongoDB (replace with your actual URI)
client = MongoClient("mongodb+srv://ismailabbasi118:Aa9J5z8h41W6@github-webhooks.v5e2xl7.mongodb.net/?retryWrites=true&w=majority&appName=github-webhooks")
db = client.github_webhooks
collection = db.events

@app.route('/')
def home():
    return render_template('index.html')  # ⬅️ Renders your UI!


# ✅ 2. Webhook endpoint to receive events from GitHub
@app.route('/webhook', methods=['POST'])
def webhook():
    print("🔥 /webhook HIT 🔥")
    try:
        data = request.get_json(force=True)
        print("📦 Payload:", data)

        event_type = request.headers.get("X-GitHub-Event", "unknown")
        timestamp = datetime.utcnow()

        event_data = {
            "event_type": event_type,
            "timestamp": timestamp,
        }

        if event_type == "push":
            event_data["author"] = data["pusher"]["name"]
            event_data["to_branch"] = data["ref"].split("/")[-1]

        elif event_type == "pull_request":
            pr = data["pull_request"]
            event_data["author"] = data["sender"]["login"]
            event_data["from_branch"] = pr["head"]["ref"]
            event_data["to_branch"] = pr["base"]["ref"]
            if data.get("action") == "closed" and pr.get("merged"):
                event_data["event_type"] = "merge"

        collection.insert_one(event_data)
        print("✅ Event saved to MongoDB")

        return jsonify({"message": "Webhook received!"}), 200

    except Exception as e:
        print("❌ Failed to handle webhook:", e)
        return jsonify({"error": "Bad JSON"}), 400

# ✅ 3. Endpoint to get events for frontend polling
@app.route('/api/events')
def api_events():
    events = list(collection.find().sort("timestamp", -1).limit(10))
    for e in events:
        e["_id"] = str(e["_id"])
        e["timestamp"] = e["timestamp"].strftime("%d %B %Y - %I:%M %p UTC")
    return jsonify(events)

if __name__ == '__main__':
    print("🚀 Flask started")
    app.run(debug=True)
