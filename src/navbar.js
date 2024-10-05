// Navbar.js
import React from "react";
import './navbar.css';
import { FaBars } from "react-icons/fa"; // Import an icon (e.g., Font Awesome Bars icon)

const Navbar = ({ title, onToggleSidebar }) => {
  return (
    <header className="navbar">
      <button className="sidebar-toggle" onClick={onToggleSidebar}>
        <FaBars />
      </button>
      <h1>{title}</h1>
    </header>
  );
};

export default Navbar;
