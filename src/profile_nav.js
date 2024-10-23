import React from "react";
import './navbar.css';
import { FaBars } from "react-icons/fa";
import './profile_nav.css';
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase_config";

const ProfileNavbar = ({ title, onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };
  
  return (
    <header className="navbar">
      {!isSidebarOpen && (
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <FaBars />
        </button>
      )}
      <h1 className="header-title">{title}</h1>
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};

export default ProfileNavbar;
