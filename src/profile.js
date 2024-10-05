// src/Profile.js
import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase_config"; 
import { useNavigate } from "react-router-dom"; 
import { getDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 

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

  if (loading) {
    return <p>Loading user data...</p>; 
  }

  return (
    <div>
      <h1>Profile</h1>
      <button onClick={handleLogout}>Logout</button>
      {userData ? (
        <div>
          <h2>Photo</h2>
          <img
            src={userData.dp || "default_image_url"}
            alt="Profile"
            style={{ borderRadius: "50%", width: "150px", height: "150px" }}
          />
          <h2>Name: {userData.name || "N/A"}</h2>
          <h2>Department: {userData.dep || "N/A"}</h2>
          <h2>Mess No: {userData.messNo || "N/A"}</h2>
          <h2>Role: {userData.category || "N/A"}</h2>
          <h2>QR Code:</h2>
          {userData.qrCode ? (
            <img
              src={userData.qrCode}
              alt="QR Code"
              style={{ width: "200px", height: "200px" }}
            />
          ) : (
            <p>N/A</p>
          )}
        </div>
      ) : (
        <p>No user data available.</p> 
      )}
    </div>
  );
};

export default Profile;
