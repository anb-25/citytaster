import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Import map and marker components from react-simple-maps
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

// TopoJSON source for US state outlines
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function USMap() {
  // Holds the list of cities fetched from backend
  const [cities, setCities] = useState([]);
  // Used to programmatically navigate when a marker is clicked
  const navigate = useNavigate();

  // Fetch city list when component mounts
  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data));
  }, []);

  return (
    <div>
      {/* Map Page Title */}
      <h1 className="section-title">CityTaster🍴🌎: Your one stop shop to food & dessert spots across the U.S.</h1>
      {/* Render US map using react-simple-maps */}
      <ComposableMap projection="geoAlbersUsa" width={1100} height={600}>
        {/* Draw the states on the map */}
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
        {cities.map((city) => (
          <Marker
            key={city.city_id}
            coordinates={[city.longitude, city.latitude]}
            onClick={() => navigate(`/city/${city.city_id}`)} // Go to city page on click
          >
            {/* Orange map bubble/dot for the city */}
            <circle r={11} fill="#FF5722" stroke="#fff" strokeWidth={3} />
            {/* Small city name label below the marker */}
            <text
              y={22} // Vertical offset to position text below the dot; use negative value for above
              textAnchor="middle"
              style={{
                fontSize: "12px",       // Small, readable font
                fontWeight: "bold",
                fill: "#444",           // Dark text color for contrast
                pointerEvents: "none",  // Allows clicking the marker even when label is on top
                paintOrder: "stroke",   // Ensures the stroke is drawn under the text fill
                stroke: "#fff",         // White border for better readability
                strokeWidth: 3,
                strokeLinejoin: "round"
              }}
            >
              {city.city_name}
              {/* Use {city.city_name.split(',')[0]} to display only the city (not state) if labels overlap */}
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
}
