import React from "react";
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// Import all page components for routes
import USMap from "./USMap";
import CityPage from "./CityPage";
import FoodPage from "./FoodPage";
import DessertPage from "./DessertPage";
import DatenightPage from "./DatenightPage";

// App component sets up client-side routing for different city and category pages
export default function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<USMap />} />
          <Route path="/city/:city_id" element={<CityPage />} />
          <Route path="/city/:city_id/food" element={<FoodPage />} />
          <Route path="/city/:city_id/dessert" element={<DessertPage />} />
          <Route path="/city/:city_id/datenight" element={<DatenightPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Sets up client-side routing and wraps all content in a container for consistent padding/layout.
// This allows users to navigate between different city and category pages without full page reloads.
// The use of dynamic parameters in the routes allows for flexible navigation based on city IDs.
// The main entry point for the application is in main.jsx where this App component is rendered.  
