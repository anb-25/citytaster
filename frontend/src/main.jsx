import React from "react";
// Import ReactDOM for rendering the root component
import ReactDOM from "react-dom/client";
// Import the root App component
import App from "./App";
// Import global styles
import "./index.css";

// Bootstrap the React application by rendering <App /> into the root DOM node
ReactDOM.createRoot(document.getElementById("root")).render(<App />);

// This file serves as the entry point for the React application, initializing the app and applying global styles.
// The App component contains the main routing logic and page structure for the application.   