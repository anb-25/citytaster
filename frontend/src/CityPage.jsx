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
        setCity(data);
      });
  }, [city_id]);

  // Show loading state if city data is not yet loaded
  if (!city) return <div className="loading-state">Loading city details…</div>;

  return (
    <div>
      {/* Back to map */}
      <button className="btn btn-back" onClick={() => navigate("/")}>
        ← Back to Map
      </button>

      <section className="city-hero">
        <span className="hero-eyebrow">City Guide</span>
        <h1 className="section-title">{city.city_name}</h1>
        <p className="city-description">{city.description}</p>

        {/* Optional city video link */}
        {city.content_link && (
          <a
            className="city-video-link"
            href={city.content_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            ▶ Watch the city tour
          </a>
        )}

        {/* Food & Dessert & Datenight navigation */}
        <div className="category-nav">
          <div
            className="category-card"
            onClick={() => navigate(`/city/${city_id}/food`)}
          >
            <span className="category-icon">🍔</span>
            <span className="category-label">Food Spots</span>
            <span className="category-hint">Local favorites &amp; must-try meals</span>
          </div>
          <div
            className="category-card"
            onClick={() => navigate(`/city/${city_id}/dessert`)}
          >
            <span className="category-icon">🍰</span>
            <span className="category-label">Dessert Spots</span>
            <span className="category-hint">Sweet treats worth the trip</span>
          </div>
          <div
            className="category-card"
            onClick={() => navigate(`/city/${city_id}/datenight`)}
          >
            <span className="category-icon">💕</span>
            <span className="category-label">Datenight Spots</span>
            <span className="category-hint">Romantic spots for a night out</span>
          </div>
        </div>
      </section>
    </div>
  );
}
