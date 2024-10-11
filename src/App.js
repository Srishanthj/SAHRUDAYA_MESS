import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login';
import Profile from './profile';
import AllUsers from './all_users';
import GenerateBill from './generate_bill';
import MessCut from './mess_cut';
import Bill from './bill';
import RegisterPage from './register';
import MealAttendance from './MealAttendance'; // Import the MealAttendance component

const App = () => {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/allusers" element={<AllUsers />} />
      <Route path="/messcut/:uid" element={<MessCut />} />
      <Route path="/bill/:uid" element={<Bill />} />
      <Route path="/mealattendance" element={<MealAttendance />} /> {/* Add this route */}
    </Routes>
  );
};

export default App;
