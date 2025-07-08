// frontend/src/DatenightPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DatenightPage() {
  // Get city_id from route parameters
  const { city_id } = useParams();

  // Store datenight spots (array of spots)
  const [datenightSpots, setDatenightSpots] = useState([]);

  // Used for navigation (Back to City)
  const navigate = useNavigate();

  // Fetch datenight spots for the city on component mount or city_id change
  useEffect(() => {
    fetch(`/api/datenight/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        // Only update if result is array
        setDatenightSpots(Array.isArray(data) ? data : []);
      });
  }, [city_id]);

  return (
    <div>
      {/* Back to City button */}
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>

      <h2 className="section-title">Datenight Spots</h2>

      {/* If no datenight spots found, show message */}
      {datenightSpots.length === 0 ? (
        <div>No datenight spots found.</div>
      ) : (
        datenightSpots.map((spot, idx) => (
          // Card for each datenight spot
          <div className="spot-card" key={spot._id || idx}>
            {/* Spot name */}
            <h3>{spot.spot_name}</h3>
            
            {/* Rating (if exists) */}
            <div className="star-rating">
              {spot.spot_rating && <>⭐ {spot.spot_rating}</>}
            </div>

            {/* Address (if exists) */}
            <p>
              <strong>Address:</strong> {spot.spot_address}
            </p>

            {/* Phone number (if exists) */}
            <p>
              <strong>Phone:</strong> {spot.spot_number || "No Phone Number"}
            </p>

            <div className="spot-links">
              {/* Website link (optional) */}
              {spot.spot_webiste && (
                <a
                  href={spot.spot_website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}

              {/* Content/Review link (optional) */}
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

            {/* Description (if exists) */}
            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}
// Note: Ensure that the backend API endpoint `/api/datenight/city/:city_id` is set up to return datenight spots for the given city_id.
// The response should be an array of objects with the expected fields (spot_name, spot_rating, spot_address, spot_number, spot_website, content_link, description).  
