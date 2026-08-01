import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function DessertPage() {
  const { city_id } = useParams();
  const [dessertSpots, setDessertSpots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`/api/dessert/city/${city_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Normalize/clean fields
          const normalized = data.map((spot) => ({
            _id: spot._id,
            dessert_name: spot.dessert_name || "Unnamed Dessert",
            dessert_rating: spot.dessert_rating || null,
            dessert_address: spot.dessert_address || "No Address",
            dessert_number: spot.dessert_number || "N/A",
            dessert_website: spot.dessert_website || null,
            content_link: spot.content_link || null,
            description: spot.description || "",
          }));
          setDessertSpots(normalized);
        } else {
          setDessertSpots([]);
          console.error("Dessert API did not return an array:", data);
        }
      })
      .catch((err) => {
        setDessertSpots([]);
        console.error("Failed to fetch dessert spots:", err);
      });
  }, [city_id]);

  return (
    <div>
      <button className="btn btn-back" onClick={() => navigate(-1)}>
        ← Back to City
      </button>
      <h2 className="section-title">🍰 Dessert Spots</h2>

      {dessertSpots.length === 0 ? (
        <div className="empty-state">No dessert spots found for this city yet.</div>
      ) : (
        <div className="spot-grid">
          {dessertSpots.map((spot) => (
            <div className="spot-card" key={spot._id}>
              <h3>{spot.dessert_name}</h3>

              {spot.dessert_rating && (
                <div className="star-rating">⭐ {spot.dessert_rating}</div>
              )}

              <p className="spot-meta">
                <strong>Address:</strong> {spot.dessert_address}
              </p>

              <p className="spot-meta">
                <strong>Phone:</strong> {spot.dessert_number}
              </p>

              <div className="spot-links">
                {spot.dessert_website && (
                  <a
                    href={spot.dessert_website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </a>
                )}
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
