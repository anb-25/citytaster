# Purpose: Defines all the API endpoints—both public (for your React UI) and admin (to upload new data). Define all HTTP endpoints—public for fetching data, protected for uploading new records.

# backend/app.py

from flask import Flask, jsonify
from flask_cors import CORS
from db import get_collection
from bson.objectid import ObjectId

app = Flask(__name__)
CORS(app)  # Allow cross-origin from your Vite dev server

def serialize_doc(doc):
    """
    Turn MongoDB’s ObjectId into a string so jsonify() won’t choke.
    """
    doc["_id"] = str(doc["_id"])
    return doc

@app.route("/api/cities")
def list_cities():
    """
    GET /api/cities
    • Fetch all documents in the 'city' collection.
    • Used by your map component to plot all cities.
    """
    coll = get_collection("city")         # singular collection name
    docs = coll.find({})                  # no filter → all docs
    return jsonify([serialize_doc(d) for d in docs])

@app.route("/api/city/<int:city_id>")
def get_city(city_id):
    """
    GET /api/city/<city_id>
    • Fetch exactly one document by its numeric city_id field.
    • Returns 404 if none found.
    • Used by CityPage.jsx to pull in the single city.
    """
    coll = get_collection("city")
    doc = coll.find_one({"city_id": city_id})
    if not doc:
        return jsonify({"error": "City not found"}), 404
    return jsonify(serialize_doc(doc))

@app.route("/api/food/city/<int:city_id>")
def food_by_city(city_id):
    """
    GET /api/food/city/<city_id>
    • Fetch all food-spot docs whose city_id matches.
    """
    coll = get_collection("food")
    docs = coll.find({"city_id": city_id})
    return jsonify([serialize_doc(d) for d in docs])

@app.route("/api/dessert/city/<int:city_id>")
def dessert_by_city(city_id):
    """
    GET /api/dessert/city/<city_id>
    • Fetch all dessert-spot docs whose city_id matches.
    """
    coll = get_collection("dessert")
    docs = coll.find({"city_id": city_id})
    return jsonify([serialize_doc(d) for d in docs])

if __name__ == "__main__":
    # Bind to 0.0.0.0 so Docker can route in
    app.run(host="0.0.0.0", port=5000, debug=True)
