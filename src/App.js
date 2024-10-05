import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login';
import Profile from './profile';
import QrScanner from './qr_scanner';
import ScannerComponent from './qr_scanner';
import AllUsers from './all_users';
import GenerateBill from './generate_bill';
import MessCut from './mess_cut';
import Bill from './bill';
import Register from './register';
import RegisterPage from './register';


const App = () => {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/scan" element={<ScannerComponent />} />
      <Route path="/allusers" element={<AllUsers />} />
      <Route path="/messcut/:uid" element={<MessCut />} />
      <Route path="/bill/:uid" element={<Bill />} />
    </Routes>
  );
};

export default App;
