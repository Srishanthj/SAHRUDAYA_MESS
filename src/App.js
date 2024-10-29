import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './login';
import Profile from './profile';
import AllUsers from './all_users';
import GenerateBill from './generate_bill'; // Ensure this file exists and is correctly named
import MessCut from './mess_cut';
import Bill from './bill';
import RegisterPage from './register';
import ResetPassword from './resetpassword';
import EditProfilePage from './edit_profile';
import MealAttendance from './MealAttendance'; // Adjusted case to match file name

const App = () => {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/allusers/:uid" element={<AllUsers />} />
      <Route path="/messcut/:uid" element={<MessCut />} />
      
      <Route path="/generatebill/:uid" element={<GenerateBill />} /> {/* Added GenerateBill route */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mealattendance" element={<MealAttendance />} />
      <Route path="/editprofile" element={<EditProfilePage />} />
      <Route path="/bill/:uid" element={<Bill />} />
    </Routes>
  );
};

export default App;
