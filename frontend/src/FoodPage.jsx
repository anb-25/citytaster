import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function FoodPage() {
  const { city_id } = useParams(); // Get city id from URL
  const [foodSpots, setFoodSpots] = useState([]); // State for food spots
  const navigate = useNavigate();

  // Fetch food spots for the city on mount or city_id change
  useEffect(() => {
    fetch(`/api/food/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => setFoodSpots(data));
  }, [city_id]);

  return (
    <div>
      {/* Back button */}
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">Food Spots</h2>
      {/* Render a card for each food spot */}
      {foodSpots.map((spot) => (
        <div className="spot-card" key={spot._id}>
          <h3>{spot.food_name}</h3>
          <div className="star-rating">⭐ {spot.food_rating}</div>
          <p>
            <strong>Address:</strong> {spot.food_address}
          </p>
          <p>
            <strong>Phone:</strong> {spot.food_number || "No Phone Number"}
          </p>
          <div className="spot-links">
            {/* Website link */}
            {spot.food_website && (
              <a
                href={spot.food_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website
              </a>
            )}
            {/* Review link */}
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
          {/* Food spot description */}
          <p>{spot.description}</p>
        </div>
      ))}
    </div>
  );
}
