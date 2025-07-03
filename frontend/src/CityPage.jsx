// frontend/src/CityPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CityPage() {
  // Get city id from route
  const { city_id } = useParams();
  // Hold city data, default to null
  const [city, setCity] = useState(null);
  const navigate = useNavigate();

  // Fetch city details when city_id changes
  useEffect(() => {
    fetch(`/api/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched city:", data);
        setCity(data);
      });
  }, [city_id]);

  // Show loading spinner/text if city data is not yet loaded
  if (!city) return <div>Loading...</div>;

  return (
    <div>
      {/* Back to map */}
      <button className="btn" onClick={() => navigate("/")}>
        ← Back to Map
      </button>

      {/* City Name */}
      <h1 className="section-title">{city.city_name}</h1>
      {/* City Description */}
      <p className="city-description">{city.description}</p>

      {/* Optional city video link */}
      {city.content_link && (
        <a
          className="city-video-link"
          href={city.content_link}
          target="_blank"
          rel="noopener noreferrer"
        >
          View Video
        </a>
      )}

      {/* Food & Dessert navigation buttons */}
      <div style={{ marginTop: 32 }}>
        <button
          className="btn"
          style={{ marginRight: "22px" }}
          onClick={() => navigate(`/city/${city_id}/food`)}
        >
          View Food Spots
        </button>
        <button
          className="btn"
          onClick={() => navigate(`/city/${city_id}/dessert`)}
        >
          View Dessert Spots
        </button>
      </div>
    </div>
  );
}
// This component fetches and displays details for a specific city.
// It uses the city_id from the URL to fetch data from the backend API.
// The city details include the name, description, and an optional video link.            