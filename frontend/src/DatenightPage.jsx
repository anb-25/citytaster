import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DatenightPage() {
  const { city_id } = useParams();
  const [datenightSpots, setDatenightSpots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/datenight/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Normalize missing/null fields
          const cleaned = data.map((spot) => ({
            spot_name: spot.spot_name || "Unnamed Spot",
            spot_rating: spot.spot_rating || null,
            spot_number: spot.spot_number || "N/A",
            spot_address: spot.spot_address || "No Address",
            spot_website: spot.spot_website || null,
            content_link: spot.content_link || null,
            description: spot.description || "",
            _id: spot._id,
          }));
          setDatenightSpots(cleaned);
        } else {
          setDatenightSpots([]);
          console.error("Expected array but got:", data);
        }
      })
      .catch((err) => {
        setDatenightSpots([]);
        console.error("Failed to fetch datenight spots:", err);
      });
  }, [city_id]);

  return (
    <div>
      <button className="btn btn-back" onClick={() => navigate(-1)}>
        ← Back to City
      </button>

      <h2 className="section-title">💕 Datenight Spots</h2>

      {datenightSpots.length === 0 ? (
        <div className="empty-state">No datenight spots found for this city yet.</div>
      ) : (
        <div className="spot-grid">
          {datenightSpots.map((spot, idx) => (
            <div className="spot-card" key={spot._id || idx}>
              <h3>{spot.spot_name}</h3>

              {spot.spot_rating && (
                <div className="star-rating">⭐ {spot.spot_rating}</div>
              )}

              <p className="spot-meta">
                <strong>Address:</strong> {spot.spot_address}
              </p>

              <p className="spot-meta">
                <strong>Phone:</strong> {spot.spot_number}
              </p>

              <div className="spot-links">
                {spot.spot_website && (
                  <a href={spot.spot_website} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </a>
                )}
                {spot.content_link && (
                  <a href={spot.content_link} target="_blank" rel="noopener noreferrer">
                    View Reviews
                  </a>
                )}
              </div>

              {spot.description && (
                <p className="spot-description">{spot.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
