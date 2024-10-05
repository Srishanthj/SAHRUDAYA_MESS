import React, { useState, useEffect, useRef } from "react";
import { auth, db } from "./firebase_config";
import { useNavigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from './navbar';
import Sidebar from './sidebar';
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

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
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

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return <p>Loading user data...</p>;
  }

  return (
    <div>
      {/* Use the new Navbar component */}
      <Navbar title="Profile Page" onToggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div ref={sidebarRef}>
          <Sidebar />
        </div>
      )}

      <div className="profile-content">
        <div className="logout-container">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className="profile-details-container">
          {userData ? (
            <div>
              <img
                src={userData.dpUrl || "default_image_url"}
                alt="👤"
                className="profile-photo"
              />
              <h2> {userData.name || "N/A"}</h2>
              <h2>Dept: {userData.department || "N/A"}</h2>
              <h2>Mess No: {userData.messNo || "N/A"}</h2>
              <h2> {userData.role || "N/A"}</h2>

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
