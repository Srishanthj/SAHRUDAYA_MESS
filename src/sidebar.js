import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { auth } from "./firebase_config";
import { useNavigate } from "react-router-dom";
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
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          {/* <Link to={`/messcut/${uid}`}>Mess Cut</Link> */}
          <Link>Mess Cut</Link>
        </li>
        {isAdmin == true && (
          <li>
            <Link to="/allusers">All Users</Link>
          </li>
        )}
        <li>
          {/* <Link to={`/bill/${uid}`}>Bill</Link> */}
          <Link>Bill</Link>
        </li>
        <li>
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
});

export default Sidebar;
