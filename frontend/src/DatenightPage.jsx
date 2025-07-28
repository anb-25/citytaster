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
      });
  }, [city_id]);

  return (
    <div>
      <button className="btn" onClick={() => navigate(-1)}>
        &larr; Back to City
      </button>

      <h2 className="section-title">Datenight Spots</h2>

      {datenightSpots.length === 0 ? (
        <div>No datenight spots found.</div>
      ) : (
        datenightSpots.map((spot, idx) => (
          <div className="spot-card" key={spot._id || idx}>
            <h3>{spot.spot_name}</h3>

            {spot.spot_rating && (
              <div className="star-rating">&#11088; {spot.spot_rating}</div>
            )}

            <p>
              <strong>Address:</strong> {spot.spot_address}
            </p>

            <p>
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

            {spot.description && <p>{spot.description}</p>}
          </div>
        ))
      )}
    </div>
  );
}

// Note: Ensure that the backend API endpoint `/api/datenight/city/:city_id` is set up to return datenight spots for the given city_id.
// The response should be an array of objects with the expected fields (spot_name, spot_rating, spot_address, spot_number, spot_website, content_link, description).  
