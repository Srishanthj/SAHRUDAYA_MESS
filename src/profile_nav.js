// Navbar.js
import React from "react";
import './navbar.css';
import { FaBars } from "react-icons/fa";
import './profile_nav.css';
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase_config";

const ProfileNavbar = ({ title, onToggleSidebar, onLogout }) => {

  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };
  
  return (
    <header className="navbar">
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <h1>{title}</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default ProfileNavbar;
