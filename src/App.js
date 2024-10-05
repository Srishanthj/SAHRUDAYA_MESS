// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Register from './register';
import Login from './login';
import Profile from './profile';
import QrScanner from './qr_scanner'; 
import ScannerComponent from './qr_scanner';
import AllUsers  from './all_users';

const App = () => {
  return (
    <Routes>
      {/* <Route path="/" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
       */}
       {/* <Route path="/scan" element={<ScannerComponent />} /> */}
       <Route path="/allusers" element={<AllUsers />} />
    </Routes>
  );
};

export default App; // Make sure you're exporting the App component
