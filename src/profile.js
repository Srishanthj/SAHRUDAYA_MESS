import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase_config"; 
import { useNavigate } from "react-router-dom"; 
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from './sidebar';
import { AiOutlineMenu } from "react-icons/ai"; // Import an icon for the menu toggle
import './profile.css'; // Import your CSS for styling

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate(); 
  const sidebarRef = useRef(null); // Reference for the sidebar

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login"); 
        setLoading(false); 
      }
    });

    return () => unsubscribe(); 
  }, [navigate]); 

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login"); 
  };

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev); // Toggle sidebar
  };

  // Close the sidebar if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loading) {
    return <p>Loading user data...</p>; 
  }

  return (
    <div className="profile-container">
      {/* Sidebar toggle button */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <AiOutlineMenu size={24} /> {/* Icon to toggle the sidebar */}
      </div>

      {/* Sidebar for the user */}
      {isSidebarOpen && (
        <div className="sidebar" ref={sidebarRef}> {/* Use ref here */}
          <Sidebar uid={userData ? userData.uid : null} name={userData ? userData.name : "User"} /> {/* Pass user name */}
        </div>
      )}

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <h1 className="center-text">Profile</h1>
        <div className="profile-details-container"> {/* New container for profile details */}
          {userData ? (
            <div>
              <img
                src={userData.dp || "default_image_url"}
                alt="Profile"
                className="profile-photo"
              />
              <h2>Name: {userData.name || "N/A"}</h2>
              <h2>Department: {userData.department || "N/A"}</h2>
              <h2>Mess No: {userData.messNo || "N/A"}</h2>
              <h2>Role: {userData.role || "N/A"}</h2>
              <h2>QR Code:</h2>
              {userData.qrCode ? (
                <img
                  src={userData.qrCode}
                  alt="QR Code"
                  className="qr-code"
                />
              ) : (
                <p>N/A</p>
              )}
            </div>
          ) : (
            <p>No user data available.</p> 
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
