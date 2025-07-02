import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import map components from react-simple-maps
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

// URL for US state shapes (TopoJSON)
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function USMap() {
  // Store the list of cities fetched from the backend
  const [cities, setCities] = useState([]);
  // Used to programmatically navigate to a city page
  const navigate = useNavigate();

  // Fetch the city list from the API when component mounts
  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => {
        // Only set cities if response is a valid array
        if (Array.isArray(data)) {
          setCities(data);
        } else {
          setCities([]); // fallback: set empty
          console.error("API /api/cities returned non-array:", data);
        }
      })
      .catch((err) => {
        setCities([]); // fallback: set empty on error
        console.error("Failed to fetch /api/cities:", err);
      });
  }, []);

  return (
    <div>
      {/* Page title section */}
      <h1 className="section-title">
        CityTaster 🍴: Your one stop shop to food & dessert spots across the U.S.
      </h1>
      {/* Render the map using react-simple-maps */}
      <ComposableMap projection="geoAlbersUsa" width={1100} height={600}>
        {/* Draw US states on the map */}
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#EAEAEC"
                stroke="#D6D6DA"
              />
            ))
          }
        </Geographies>
        {/* Place a marker and label for each city */}
        {Array.isArray(cities) &&
          cities.map((city) => (
            <Marker
              // Unique key for React list rendering
              key={city.city_id}
              // Location of the marker (longitude, latitude)
              coordinates={[city.longitude, city.latitude]}
              // When marker is clicked, navigate to city details page
              onClick={() => navigate(`/city/${city.city_id}`)}
            >
              {/* Orange map bubble/dot for the city */}
              <circle r={11} fill="#FF5722" stroke="#fff" strokeWidth={3} />
              {/* Small city name label below the marker */}
              <text
                y={22} // Position the text below the dot
                textAnchor="middle"
                style={{
                  fontSize: "12px", // Small, readable font
                  fontWeight: "bold",
                  fill: "#444", // Dark text color for contrast
                  pointerEvents: "none", // Allows clicking the marker even when label is on top
                  paintOrder: "stroke", // Ensures the stroke is drawn under the text fill
                  stroke: "#fff", // White border for better readability
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                }}
              >
                {city.city_name}
              </text>
            </Marker>
          ))}
      </ComposableMap>
    </div>
  );
}

