# A MongoDB client is a software library or tool that allows applications to interact with a MongoDB database. It provides the necessary functionality to connect to a MongoDB server, execute queries, insert, update, and delete data, and perform other database operations.
# File Purpose: Create and export a single MongoDB client, plus a helper to grab any collection (table-equivalent) by name.

# backend/db.py
import os
from pymongo import MongoClient

# Read host/port/db from environment (set in your docker-compose)
MONGO_HOST = os.getenv("MONGO_HOST", "mongo")
MONGO_PORT = int(os.getenv("MONGO_PORT", 27017))
MONGO_DB = os.getenv("MONGO_DB", "CityTasterDB")

# Connect and grab the DB
client = MongoClient(host=MONGO_HOST, port=MONGO_PORT)
db = client[MONGO_DB]


def get_collection(name: str):
    """Return the named collection from CityTasterDB."""
    return db[name]
