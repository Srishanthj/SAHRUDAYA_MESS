import React, { useState, useEffect, useRef } from "react";
import { onSnapshot, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { db } from "./firebase_config";
import './AllUsers.css'; // Make sure to create this CSS file

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleAddFine = async (userId, fineAmount) => {
    const month = new Date().toISOString().slice(0, 7);
    const fineEntry = {
      amount: parseFloat(fineAmount),
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "users", userId), {
      [`fine.${month}`]: arrayUnion(fineEntry),
    });
  };

  const handleAddDeduction = async (userId, deductionAmount) => {
    const month = new Date().toISOString().slice(0, 7);
    const deductionEntry = {
      amount: parseFloat(deductionAmount),
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "users", userId), {
      [`deduction.${month}`]: arrayUnion(deductionEntry),
    });
  };

  const toggleAdminPrivileges = async (userId, isAdmin) => {
    await updateDoc(doc(db, "users", userId), {
      isAdmin: !isAdmin,
    });
  };

  const handleProfileView = (user) => {
    setSelectedUser(user);
  };

  const closePopup = () => {
    setSelectedUser(null);
  };

  return (
    <div>
      <Navbar title="All Users" onToggleSidebar={toggleSidebar} />
      {isSidebarOpen && <Sidebar ref={sidebarRef} />}

      <input
        type="text"
        placeholder="Search Users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

<div className="user-list-container">
  <div className="user-list">
    {filteredUsers.map((user) => (
      <div key={user.id} className="user-item">
        <div className="user-info">
          <img src={user.dpUrl || "default-profile.png"} alt="Profile" className="user-dp" />
          <h2>{user.name || "Unknown User"}</h2>
        </div>
        <button onClick={() => handleProfileView(user)}>View Profile</button>
      </div>
    ))}
  </div>
</div>


      {/* Popup for user profile */}
      {/* Popup for user profile */}
{selectedUser && (
  <div className="popup-overlay">
    <div className="popup">
      <h2>{selectedUser.name}</h2>
      {selectedUser.isAdmin && <span>Admin</span>}
      <div className="popup-actions">
        <button onClick={() => toggleAdminPrivileges(selectedUser.id, selectedUser.isAdmin)}>
          {selectedUser.isAdmin ? "Revoke Admin" : "Grant Admin"}
        </button>
        <button
          onClick={() => {
            const fineAmount = prompt("Enter Fine Amount:");
            if (fineAmount) handleAddFine(selectedUser.id, fineAmount);
          }}
        >
          Add Fine
        </button>
        <button
          onClick={() => {
            const deductionAmount = prompt("Enter Deduction Amount:");
            if (deductionAmount) handleAddDeduction(selectedUser.id, deductionAmount);
          }}
        >
          Add Deduction
        </button>
      </div>
      <button onClick={closePopup}>Close</button>
    </div>
  </div>
)}

    </div>
  );
};

export default AllUsers;
