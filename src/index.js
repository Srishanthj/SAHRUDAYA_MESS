import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import for React 18
import { BrowserRouter as Router } from 'react-router-dom'; // Importing Router for routing
import { AuthProvider } from './authcontext'; // Context for authentication (ensure correct casing)
import App from './App'; // Main App component

// Create a root for rendering
const root = ReactDOM.createRoot(document.getElementById('root')); // Use createRoot for React 18

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);
