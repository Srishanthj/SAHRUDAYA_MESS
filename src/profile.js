import React, { useEffect, useState, useRef } from "react";
import { auth, db } from "./firebase_config"; 
import { useNavigate } from "react-router-dom"; 
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from './sidebar';
import { AiOutlineMenu } from "react-icons/ai";
import './profile.css';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const navigate = useNavigate();
  const sidebarRef = useRef(null); 

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
    setIsSidebarOpen((prev) => !prev); 
    console.log("Sidebar is toggled:", !isSidebarOpen);  // Add log to check state
  };

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
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        <AiOutlineMenu size={24} color="black"/>
      </div>

      {isSidebarOpen && (
        <div className="sidebar" ref={sidebarRef}> 
          <Sidebar uid={userData ? userData.uid : null} name={userData ? userData.name : "User"} />
        </div>
      )}

      <div className={`profile-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <h1 className="center-text">Profile</h1>
        <div className="profile-details-container">
          {userData ? (
            <div>
              <img
                src={userData.dpUrl || "default_image_url"}
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
