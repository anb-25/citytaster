import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DessertPage() {
  const { city_id } = useParams(); // Get city id from URL
  const [dessertSpots, setDessertSpots] = useState([]); // State for dessert spots
  const navigate = useNavigate();

  // Fetch dessert spots for the city on mount or city_id change
  useEffect(() => {
    fetch(`/api/dessert/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => setDessertSpots(data));
  }, [city_id]);

  return (
    <div>
      {/* Back button */}
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">Dessert Spots</h2>
      {/* Render a card for each dessert spot */}
      {dessertSpots.map((spot) => (
        <div className="spot-card" key={spot._id}>
          <h3>{spot.dessert_name}</h3>
          <div className="star-rating">⭐ {spot.dessert_rating}</div>
          <p>
            <strong>Address:</strong> {spot.dessert_address}
          </p>
          <p>
            <strong>Phone:</strong> {spot.dessert_number || "No Phone Number"}
          </p>
          <div className="spot-links">
            {/* Website link */}
            {spot.dessert_website && (
              <a
                href={spot.dessert_website}
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
          {/* Dessert spot description */}
          <p>{spot.description}</p>
        </div>
      ))}
    </div>
  );
}
