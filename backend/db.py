# A MongoDB client is a software library or tool that allows applications to interact with a MongoDB database.
# It provides the necessary functionality to connect to a MongoDB server, execute queries, insert, update, and delete data, and perform other database operations.
# File Purpose: Create and export a single MongoDB client, plus a helper to grab any collection (table-equivalent) by name.

# backend/db.py
# Creates a single Mongo client and exposes get_collection().
# Prefers a full MONGO_URL (mongodb://host:port/db). Falls back to host/port/db vars.

import os
from urllib.parse import urlparse
from pymongo import MongoClient

def _client_and_db_from_env():
    url = os.getenv("MONGO_URL")
    if url:
        # Example: mongodb://mongo-dev:27017/citytaster
        client = MongoClient(url, serverSelectionTimeoutMS=5000)
        parsed = urlparse(url)
        dbname = (parsed.path or "/").lstrip("/") or os.getenv("MONGO_DB", "CityTasterDB")
        return client, client[dbname]

    # Fallback (for environments that don’t set MONGO_URL)
    host = os.getenv("MONGO_HOST", "mongo")
    port = int(os.getenv("MONGO_PORT", 27017))
    dbname = os.getenv("MONGO_DB", "CityTasterDB")
    client = MongoClient(host=host, port=port, serverSelectionTimeoutMS=5000)
    return client, client[dbname]

_client, _db = _client_and_db_from_env()

def get_collection(name: str):
    return _db[name]
# Example usage:
# users_col = get_collection("users")   # gets the "users" collection (table) from the DB
# users_col.find_one({"username": "alice"})  # find a user by username