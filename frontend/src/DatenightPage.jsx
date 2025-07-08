// frontend/src/DatenightPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DatenightPage() {
  const { city_id } = useParams();
  const [datenightSpots, setDatenightSpots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch datenight spots for this city; fallback to [] if data is not array
    fetch(`/api/datenight/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => setDatenightSpots(Array.isArray(data) ? data : []));
  }, [city_id]);

  return (
    <div>
      {/* Go back to previous page */}
      <button className="btn" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">Datenight Spots</h2>
      {datenightSpots.length === 0 ? (
        <div>No datenight spots found.</div>
      ) : (
        datenightSpots.map((spot) => (
          // Main datenight spot card
          <div className="spot-card" key={spot._id || spot.id}>
            <h3>{spot.name}</h3>
            {/* Only show rating if present */}
            <div className="star-rating">
              {spot.rating && <>⭐ {spot.rating}</>}
            </div>
            <p>
              <strong>Address:</strong> {spot.address}
            </p>
            <p>
              <strong>Phone:</strong> {spot.phone || "No Phone Number"}
            </p>
            <div className="spot-links">
              {/* Optional: Only render website link if available */}
              {spot.website && (
                <a
                  href={spot.website}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Website
                </a>
              )}
              {/* Optional: Only render review/content link if available */}
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
            {/* Optional: Only show description if present */}
            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}
