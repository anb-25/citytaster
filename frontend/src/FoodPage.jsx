import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FoodPage() {
  const { city_id } = useParams();
  const [foodSpots, setFoodSpots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/food/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Normalize food data
          const normalized = data.map((spot) => ({
            _id: spot._id,
            food_name: spot.food_name || "Unnamed Food",
            food_rating: spot.food_rating || null,
            food_address: spot.food_address || "No Address",
            food_number: spot.food_number || "N/A",
            food_website: spot.food_website || null,
            content_link: spot.content_link || null,
            description: spot.description || "",
          }));
          setFoodSpots(normalized);
        } else {
          setFoodSpots([]);
          console.error("Food API did not return an array:", data);
        }
      })
      .catch((err) => {
        setFoodSpots([]);
        console.error("Failed to fetch food spots:", err);
      });
  }, [city_id]);

  return (
    <div>
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">Food Spots</h2>

      {foodSpots.length === 0 ? (
        <div>No food spots found.</div>
      ) : (
        foodSpots.map((spot) => (
          <div className="spot-card" key={spot._id}>
            <h3>{spot.food_name}</h3>

            {spot.food_rating && (
              <div className="star-rating">⭐ {spot.food_rating}</div>
            )}

            <p>
              <strong>Address:</strong> {spot.food_address}
            </p>

            <p>
              <strong>Phone:</strong> {spot.food_number}
            </p>

            <div className="spot-links">
              {spot.food_website && (
                <a
                  href={spot.food_website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}
              {spot.content_link && (
                <a
                  href={spot.content_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Reviews
                </a>
              )}
            </div>

            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}

// This component fetches and displays food spots for a specific city.
// It uses the city_id from the URL to fetch data from the backend API.
// Each food spot is displayed in a card format with details like name, rating, address,
// phone number, website, and description.
// The component also includes a back button to return to the previous page.
