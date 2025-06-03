import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import USMap from "./USMap";
import CityPage from "./CityPage";
import FoodPage from "./FoodPage";
import DessertPage from "./DessertPage";

export default function App() {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<USMap />} />
          <Route path="/city/:city_id" element={<CityPage />} />
          <Route path="/city/:city_id/food" element={<FoodPage />} />
          <Route path="/city/:city_id/dessert" element={<DessertPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// Sets up client-side routing and wraps all content in a container for consistent padding/layout.
