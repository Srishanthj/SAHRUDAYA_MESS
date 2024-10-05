// Sidebar.js
import React, { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css'; // Import the CSS for the sidebar styles

const Sidebar = forwardRef(({ uid, name }, ref) => {
    return (
        <div className="sidebar" ref={ref}>
            <h2>Welcome, {name}!</h2>
            <ul>
                <li>
                    <Link to={`/messcut/${uid}`}>Mess Cut</Link>
                </li>
                <li>
                    <Link to="/allusers">All Users</Link>
                </li>
                <li>
                    <Link to="/profile">Profile</Link>
                </li>
                <li>
                    <Link to={`/bill/${uid}`}>Bill</Link>
                </li>
            </ul>
        </div>
    );
});

export default Sidebar;
