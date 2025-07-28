# backend/seed.py

from db import get_collection

cities_col = get_collection("city")
food_col = get_collection("food")
dessert_col = get_collection("dessert")
datenight_col = get_collection("datenight")

# Clear all existing data
cities_col.delete_many({})
food_col.delete_many({})
dessert_col.delete_many({})
datenight_col.delete_many({})

# city_id, name, latitude, longitude
city_list = [
    (1, "Washington, DC", 38.9072, -77.0369),
    (2, "New York City, NY", 40.7128, -74.0060),
    (3, "Atlanta, GA", 33.7490, -84.3880),
    (4, "Boston, MA", 42.3601, -71.0589),
    (5, "Philadelphia, PA", 39.9526, -75.1652),
    (6, "Miami, FL", 25.7617, -80.1918),
    (7, "Charlotte, NC", 35.2271, -80.8431),
    (8, "Nashville, TN", 36.1627, -86.7816),
    (9, "Chicago, IL", 41.8781, -87.6298),
    (10, "Las Vegas, NV", 36.1699, -115.1398),
]

# Insert data
for cid, name, lat, lon in city_list:
    cities_col.insert_one({
        "city_id": cid,
        "city_name": name,
        "description": f"{name} description with some interesting facts…",
        "content_link": "https://youtube.com/watch?v=dQw4w9WgXcQ",  # placeholder link
        "latitude": lat,
        "longitude": lon
    })

    food_col.insert_one({
        "food_name": f"{name} Famous Eats",
        "city_id": cid,
        "food_number": cid * 100 + 1,
        "food_address": f"123 {name} St",
        "food_rating": 4.5,
        "food_website": "https://example.com",
        "description": f"Delicious food in {name}",
        "content_link": "https://example.com/review/food"
    })

    dessert_col.insert_one({
        "dessert_name": f"{name} Sweet Spot",
        "city_id": cid,
        "dessert_number": cid * 100 + 1,
        "dessert_address": f"456 {name} Blvd",
        "dessert_rating": 4.7,
        "dessert_website": "https://example.com",
        "description": f"Yummy desserts in {name}",
        "content_link": "https://example.com/review/dessert"
    })

    datenight_col.insert_one({
        "spot_name": f"{name} Romantic Place",
        "city_id": cid,
        "spot_number": cid * 100 + 2,
        "spot_address": f"789 {name} Ave",
        "spot_rating": 4.8,
        "spot_website": "https://example.com",
        "description": f"Perfect datenight spot in {name}",
        "content_link": "https://example.com/review/date"
    })

print("✅ Seeding complete.")



