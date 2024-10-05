import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './register'; // Ensure this is a web-compatible component
import Login from './login'; // Ensure this is a web-compatible component
import Profile from './profile'; // Ensure this is a web-compatible component
import ScannerComponent from './qr_scanner'; // Ensure this component is web-compatible
import AllUsers from './all_users'; // Ensure this is a web-compatible component

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/scan" element={<ScannerComponent />} />
        <Route path="/allusers" element={<AllUsers />} />
      </Routes>
    </div>
  );
};

export default App;
