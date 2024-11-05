import React, { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase_config";
import { FaUser, FaCut, FaFileInvoice, FaEdit, FaClipboardCheck } from "react-icons/fa";
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
        {(isAdmin || uid === 'ya4M7YvmfZUi3yQPA3W4kO7wYdu2') && (
          <li>
            <Link to="/mealattendance">
              <FaClipboardCheck /> Mark Attendance
            </Link>
          </li>
        )}
        <li>
          <Link to={`/messcut/${uid}`}>
            <FaCut /> Mess Cut
          </Link>
        </li>
        {uid === 'ya4M7YvmfZUi3yQPA3W4kO7wYdu2' && (
          <>
            <li>
              <Link to={`/allusers/${uid}`}>
                <FaUser /> All Users
              </Link>
            </li>
            <li>
              <Link to={`/generatebill/${uid}`}>
                <FaEdit /> Generate Bill
              </Link>
            </li>
          </>
        )}
        <li>
          <Link to={`/bill/${uid}`}>
            <FaFileInvoice /> Bill
          </Link>
        </li>
        <li>
          <Link to="/editprofile">
            <FaEdit /> Edit Profile
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
