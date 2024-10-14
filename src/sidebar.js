import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase_config";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCut, FaFileInvoice, FaClipboardCheck } from "react-icons/fa";
import "./sidebar.css";

const Sidebar = forwardRef(({ uid, name, isAdmin }, ref) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="sidebar" ref={ref}>
      <h2>Welcome, {name}!</h2>
      <ul>
        <li>
          <Link to="/profile">
            <FaUser /> Profile
          </Link>
        </li>
        <li>
          <Link to="/mealattendance">
            <FaClipboardCheck /> Mark the attendance
          </Link>
        </li>
        <li>
          <Link to={`/messcut/${uid}`}>
            <FaCut /> Mess Cut
          </Link>
        </li>
        {isAdmin && (
          <li>
            <Link to="/allusers">
              <FaUser /> All Users
            </Link>
          </li>
        )}
        <li>
          <Link to={`/bill/${uid}`}>
            <FaFileInvoice /> Bill
          </Link>
        </li>
      </ul>
      <button onClick={handleLogout} className="logout-button">
        Logout
      </button>
    </div>
  );
});

export default Sidebar;
