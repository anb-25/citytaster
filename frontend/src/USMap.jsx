// frontend/src/USMap.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Map component imports
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// URL for US state shapes (TopoJSON)
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// A handful of cities (the DC/Philly/NYC/Boston corridor, plus Nashville/Charlotte)
// sit close enough together that a plain "label centered below the pin" rule makes
// their names collide. Override placement per city_id; anything not listed keeps
// the default (centered, below the pin).
const LABEL_OVERRIDES = {
  1: { dx: 0, dy: 22, anchor: "middle" }, // Washington, DC — below the pin, clear of Chicago's row
  2: { dx: 14, dy: -14, anchor: "start" }, // New York City, NY — above-right
  5: { dx: 18, dy: -2, anchor: "start" }, // Philadelphia, PA — to the right, slightly above
  4: { dx: 0, dy: -16, anchor: "middle" }, // Boston, MA — above
  7: { dx: 16, dy: 5, anchor: "start" }, // Charlotte, NC — to the right
  8: { dx: -16, dy: 5, anchor: "end" }, // Nashville, TN — to the left
  9: { dx: 0, dy: -16, anchor: "middle" }, // Chicago, IL — above, clear of Washington DC's row
  10: { dx: 18, dy: 5, anchor: "start" }, // Las Vegas, NV — to the right, clear of Los Angeles's pin
  11: { dx: -8, dy: 30, anchor: "middle" }, // Los Angeles, CA — below, nudged clear of Las Vegas
  13: { dx: 16, dy: 5, anchor: "start" }, // New Orleans, LA — to the right, clear of Houston's pin
  16: { dx: -16, dy: 5, anchor: "end" }, // Houston, TX — to the left, clear of New Orleans's pin
};
const DEFAULT_LABEL = { dx: 0, dy: 30, anchor: "middle" };

export default function USMap() {
  // State for list of cities fetched from the backend
  const [cities, setCities] = useState([]); // always start with []

  // For navigation to city details pages
  const navigate = useNavigate();

  // Fetch city list from API on mount
  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCities(data);
        } else {
          setCities([]);
          console.error("API /api/cities did not return an array:", data);
        }
      })
      .catch((err) => {
        setCities([]);
        console.error("Failed to fetch /api/cities:", err);
      });
  }, []);

  return (
    <div>
      <section className="hero">
        <span className="hero-eyebrow">A city-by-city food guide</span>
        <h1>Find your next favorite bite, dessert, or datenight spot</h1>
        <p className="hero-subtitle">
          Pick a city on the map to explore hand-picked restaurants, dessert
          shops, and romantic spots — curated like a local's guide, not a
          search result.
        </p>
      </section>

      <div className="map-card">
        <ComposableMap projection="geoAlbersUsa" width={1100} height={700}>
          {/* Draw state geographies */}
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#f3ead9"
                  stroke="#d8c9a8"
                  strokeWidth={0.75}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {/* Place a marker and label for each city */}
          {Array.isArray(cities) &&
            cities.map((city) => {
              const label = LABEL_OVERRIDES[city.city_id] || DEFAULT_LABEL;
              return (
                <Marker
                  key={city.city_id}
                  coordinates={[city.longitude, city.latitude]}
                  onClick={() => navigate(`/city/${city.city_id}`)}
                  style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" } }}
                >
                  {/* Invisible, generous hit area covering both the pin and its label */}
                  <rect x={-46} y={-22} width={92} height={64} fill="transparent" />
                  {/* Rust-colored pin for city, matching the food-blog palette */}
                  <circle r={9} fill="#c1440e" stroke="#fff" strokeWidth={2.5} />
                  <circle r={16} fill="#c1440e" opacity={0.16} />
                  {/* City label — pointer events enabled so the name itself is clickable */}
                  <text
                    x={label.dx}
                    y={label.dy}
                    textAnchor={label.anchor}
                    style={{
                      fontFamily: "'Fraunces', serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      fill: "#2b2420",
                      paintOrder: "stroke",
                      stroke: "#fbf6ee",
                      strokeWidth: 5,
                      strokeLinejoin: "round",
                    }}
                  >
                    {city.city_name}
                  </text>
                </Marker>
              );
            })}
        </ComposableMap>
      </div>
      <p className="map-hint">Click a city pin to start exploring 📍</p>
    </div>
  );
}
