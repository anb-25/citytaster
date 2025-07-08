// frontend/src/DatenightPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DatenightPage() {
  // Get city_id from route params
  const { city_id } = useParams();
  // State to hold datenight spots data
  const [datenightSpots, setDatenightSpots] = useState([]);
  // Navigation hook
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch datenight spots for the current city from backend API
    fetch(`/api/datenight/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => setDatenightSpots(Array.isArray(data) ? data : []));
  }, [city_id]); // Runs whenever city_id changes

  return (
    <div>
      {/* Back button */}
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">Datenight Spots</h2>
      {/* If no spots, show message */}
      {datenightSpots.length === 0 ? (
        <div>No datenight spots found.</div>
      ) : (
        // Render each datenight spot card
        datenightSpots.map((spot, idx) => (
          <div className="spot-card" key={spot._id || idx}>
            {/* Name of the spot */}
            <h3>{spot.spot_name}</h3>
            {/* Star rating if present */}
            <div className="star-rating">
              {spot.spot_rating && <>⭐ {spot.spot_rating}</>}
            </div>
            {/* Address */}
            <p>
              <strong>Address:</strong> {spot.spot_address}
            </p>
            {/* Phone/spot_number */}
            <p>
              <strong>Phone:</strong>{" "}
              {spot.spot_number || "No Phone Number"}
            </p>
            {/* Optional: Website & Content/Review Link */}
            <div className="spot-links">
              {/* Website */}
              {spot.spot_website && (
                <a
                  href={spot.spot_website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}
              {/* Review/Content Link */}
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
            {/* Description */}
            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}
