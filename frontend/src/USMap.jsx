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
        // Log for debugging
        console.log("Fetched cities:", data);
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
      {/* Page Title */}
      <h1 className="section-title">
        CityTaster 🍴: Your one stop shop to food & dessert spots across the U.S.
      </h1>
      {/* Render US map using react-simple-maps */}
      <ComposableMap projection="geoAlbersUsa" width={1100} height={600}>
        {/* Draw state geographies */}
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
              key={city.city_id}
              coordinates={[city.longitude, city.latitude]}
              onClick={() => navigate(`/city/${city.city_id}`)}
            >
              {/* Orange dot for city */}
              <circle r={11} fill="#FF5722" stroke="#fff" strokeWidth={3} />
              {/* City label */}
              <text
                y={22}
                textAnchor="middle"
                style={{
                  fontSize: "12px",
                  fontWeight: "bold",
                  fill: "#444",
                  pointerEvents: "none",
                  paintOrder: "stroke",
                  stroke: "#fff",
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
// This component renders a US map with clickable markers for each city.
// It fetches city data from the backend API and displays each city as a marker on the map.
// Clicking a marker navigates to the city details page using React Router.
// The map uses the react-simple-maps library for rendering the map and markers.
// The cities state is initialized as an empty array and updated once the data is fetched.
// The map is styled with a light gray background and orange markers for cities.
// The city labels are styled with a bold font and a white stroke for better visibility.
// The useEffect hook fetches the city data when the component mounts.
// The navigate function from React Router is used to programmatically change routes.
// The component handles cases where the API response is not an array by checking before setting the state.
// The console.log statements help debug the fetched city data.
// The component uses semantic HTML elements for better accessibility and SEO.
// The map is responsive and adjusts to the size of the container.
// The markers are positioned based on the longitude and latitude of each city.
// The component is designed to be reusable and can be easily integrated into other parts of the application.
// The CSS classes like "section-title" are assumed to be defined in an external stylesheet for consistent styling.
// The component is structured to follow React best practices, ensuring maintainability and readability.
// The use of arrow functions and destructuring enhances code clarity and conciseness.
// The component is self-contained and does not rely on any external state management libraries.  
