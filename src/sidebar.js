import React from 'react';
import { Link } from 'react-router-dom';
import './sidebar.css'; // Import the CSS for the sidebar styles

const Sidebar = ({ uid, name }) => {
    return (
        <div className="sidebar">
            <h2>Welcome, {name}!</h2> {/* Display the user's name */}
            <ul>
                <li>
                    <Link to={`/messcut/${uid}`}>Mess Cut</Link>
                </li>
                <li>
                    <Link to="/allusers">All Users</Link>
                </li>
                <li>
                    <Link to={`/bill/${uid}`}>Bill</Link>
                </li>
            </ul>
        </div>
    );
};

export default Sidebar;
