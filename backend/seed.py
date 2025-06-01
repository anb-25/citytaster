# backend/seed.py
from db import get_collection

cities_col  = get_collection("cities")
food_col    = get_collection("food")
dessert_col = get_collection("dessert")

# Clear out existing data
cities_col.delete_many({})
food_col.delete_many({})
dessert_col.delete_many({})

# Insert your 10 cities
city_list = [
  (1, "Washington, DC"),
  (2, "New York City, NY"),
  (3, "Atlanta, GA"),
  (4, "Boston, MA"),
  (5, "Philadelphia, PA"),
  (6, "Miami, FL"),
  (7, "Charlotte, NC"),
  (8, "Nashville, TN"),
  (9, "Chicago, IL"),
  (10,"Las Vegas, NV"),
]
for cid, name in city_list:
    cities_col.insert_one({
      "city_id": cid,
      "city_name": name,
      "description": f"{name} description …",
      "content_link": ""
    })

# Insert one example food & dessert per city
for cid, name in city_list:
    food_col.insert_one({
      "food_name":   f"{name} Famous Eats",
      "city_id":     cid,
      "food_number": cid*100 + 1,
      "food_address": f"123 {name} St",
      "food_rating": 4.5,
      "food_website": "https://example.com",
      "description": f"Delicious food in {name}",
      "content_link": ""
    })
    dessert_col.insert_one({
      "dessert_name":  f"{name} Sweet Spot",
      "city_id":       cid,
      "dessert_number":cid*100 + 1,
      "dessert_address":f"456 {name} Blvd",
      "dessert_rating": 4.7,
      "dessert_website":"https://example.com",
      "description":   f"Yummy desserts in {name}",
      "content_link":  ""
    })

print("Seeding complete.")
