
import React, { forwardRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./firebase_config";
import { FaUser, FaCut, FaFileInvoice, FaEdit, FaClipboardCheck, FaTrash, FaSignOutAlt } from "react-icons/fa";
import { getFirestore, collection, getDocs, updateDoc, doc, deleteField } from "firebase/firestore";
import "./sidebar.css";

const Sidebar = forwardRef(({ uid, name, isAdmin }, ref) => {
  const navigate = useNavigate();
  const firestore = getFirestore();

  // Logout handler
  const handleLogout = async () => {
    await auth.signOut();
    navigate("/");
  };

  // Function to delete `billAmount` map for all users
  const deleteBillAmountForAllUsers = async () => {
    try {
      const usersCollection = collection(firestore, "users");
      const querySnapshot = await getDocs(usersCollection);

      // Iterate through each user and delete the `billAmount` field
      const deletePromises = querySnapshot.docs.map((userDoc) =>
        updateDoc(doc(firestore, "users", userDoc.id), {
          billAmount: deleteField(),
        })
      );

      await Promise.all(deletePromises);

      alert("Successfully deleted the `billAmount` field for all users.");
    } catch (error) {
      console.error("Error deleting `billAmount` field: ", error);
      alert("Failed to delete `billAmount` field. Please try again.");
    }
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
        {(isAdmin || uid === "5GyeJfaXn5MHvCu11RMNXCWDBnB3") && (
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
        {uid === "5GyeJfaXn5MHvCu11RMNXCWDBnB3" && (
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
              {/* Admin-only button to delete `billAmount` */}
              <li>
              <button
                onClick={deleteBillAmountForAllUsers}
                className="admin-action-button "
              >
           Delete Bill
              </button>
            </li>

          </>
        )}
        <li>
          <Link to={`/bill/${uid}`}>
            <FaFileInvoice /> Bill
          </Link>
        </li>
        
      </ul>
      <button onClick={handleLogout} className="logout-button">
      <FaSignOutAlt /> Logout
      </button>
    </div>
  );
});

export default Sidebar;
