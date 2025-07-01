from pymongo import MongoClient

client = MongoClient("mongodb+srv://ismailabbasi118:8kLP5R6C7LOrQrob@github-webhooks.v5e2xl7.mongodb.net/?retryWrites=true&w=majority&appName=github-webhooks")
db = client.github_webhooks
collection = db.events
