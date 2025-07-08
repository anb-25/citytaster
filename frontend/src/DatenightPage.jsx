// frontend/src/DatenightPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DatenightPage() {
  // Get city_id from route parameters (URL)
  const { city_id } = useParams();

  // datenightSpots holds the array of datenight spot objects
  const [datenightSpots, setDatenightSpots] = useState([]);

  // Used to navigate back to city page
  const navigate = useNavigate();

  // Fetch datenight spots when component mounts or city_id changes
  useEffect(() => {
    fetch(`/api/datenight/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        // Only update if data is an array
        setDatenightSpots(Array.isArray(data) ? data : []);
      });
  }, [city_id]);

  return (
    <div>
      {/* Back button to return to City */}
      <button className="btn" onClick={() => navigate(-1)}>
        &larr; Back to City
      </button>

      <h2 className="section-title">Datenight Spots</h2>

      {/* If no datenight spots found, show message */}
      {datenightSpots.length === 0 ? (
        <div>No datenight spots found.</div>
      ) : (
        datenightSpots.map((spot, idx) => (
          // Render each datenight spot as a card
          <div className="spot-card" key={spot._id || idx}>
            {/* Spot Name */}
            <h3>{spot.spot_name}</h3>

            {/* Rating (if present) */}
            <div className="star-rating">
              {spot.spot_rating && (
                <>
                  &#11088; {spot.spot_rating}
                </>
              )}
            </div>

            {/* Address (if present) */}
            <p>
              <strong>Address:</strong> {spot.spot_address}
            </p>

            {/* Phone Number (if present) */}
            <p>
              <strong>Phone:</strong> {spot.spot_number || "No Phone Number"}
            </p>

            <div className="spot-links">
              {/* Website link (if present) */}
              {spot.spot_website && (
                <a
                  href={spot.spot_website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}

              {/* Content/Review link (if present) */}
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

            {/* Description (if present) */}
            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}

// Note: Ensure that the backend API endpoint `/api/datenight/city/:city_id` is set up to return datenight spots for the given city_id.
// The response should be an array of objects with the expected fields (spot_name, spot_rating, spot_address, spot_number, spot_website, content_link, description).  
