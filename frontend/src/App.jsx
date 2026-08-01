import React from "react";
// Import routing components from react-router-dom
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from "react-router-dom";
// Animate route changes for a smoother, more polished feel
import { AnimatePresence, motion } from "framer-motion";
// Import all page components for routes
import USMap from "./USMap";
import CityPage from "./CityPage";
import FoodPage from "./FoodPage";
import DessertPage from "./DessertPage";
import DatenightPage from "./DatenightPage";

const pageVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

// Wraps each routed page in a fade/slide transition keyed on the current path
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageMotion>
              <USMap />
            </PageMotion>
          }
        />
        <Route
          path="/city/:city_id"
          element={
            <PageMotion>
              <CityPage />
            </PageMotion>
          }
        />
        <Route
          path="/city/:city_id/food"
          element={
            <PageMotion>
              <FoodPage />
            </PageMotion>
          }
        />
        <Route
          path="/city/:city_id/dessert"
          element={
            <PageMotion>
              <DessertPage />
            </PageMotion>
          }
        />
        <Route
          path="/city/:city_id/datenight"
          element={
            <PageMotion>
              <DatenightPage />
            </PageMotion>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function PageMotion({ children }) {
  return (
    <motion.div
      className="page-transition"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// App component sets up the site chrome (header/footer) and client-side routing
export default function App() {
  return (
    <Router>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo">
            <span className="site-logo-mark">🍴</span> CityTaster
          </Link>
          <span className="site-tagline">Food, dessert &amp; datenight spots, city by city</span>
        </div>
      </header>

      <div className="container">
        <AnimatedRoutes />
      </div>

      <footer className="site-footer">
        <strong>CityTaster</strong> — a food-lover's guide to the best bites across the U.S.
      </footer>
    </Router>
  );
}
