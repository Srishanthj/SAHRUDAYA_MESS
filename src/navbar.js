// Navbar.js
import React from "react";
import './navbar.css';
import { FaBars } from "react-icons/fa";

const Navbar = ({ title, onToggleSidebar, onLogout }) => {
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
