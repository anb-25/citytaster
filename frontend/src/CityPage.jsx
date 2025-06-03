import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function CityPage() {
  const { city_id } = useParams(); // Get city id from URL
  const [city, setCity] = useState(null); // State for current city data
  const navigate = useNavigate();

  // Fetch city details on load or when city_id changes
  useEffect(() => {
    fetch(`/api/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => setCity(data));
  }, [city_id]);

  // Show loading until city loads
  if (!city) return <div>Loading...</div>;

  return (
    <div>
      {/* Back button */}
      <button className="btn" onClick={() => navigate("/")}>
        ← Back to Map
      </button>

      {/* City name */}
      <h1 className="section-title">{city.city_name}</h1>

      {/* City description */}
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

      {/* Navigation buttons with spacing */}
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
