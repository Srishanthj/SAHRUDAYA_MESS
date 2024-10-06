// Navbar.js
import React from "react";
import './navbar.css';
import { FaBars } from "react-icons/fa";
import './profile_nav.css';

const ProfileNavbar = ({ title, onToggleSidebar, onLogout }) => {
  return (
    <header className="navbar">
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <h1>{title}</h1>
      <button className="logout-button" onClick={onLogout}>
        Logout
      </button>
    </header>
  );
};

export default ProfileNavbar;
