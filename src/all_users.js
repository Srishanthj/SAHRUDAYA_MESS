import React, { useState, useEffect, useRef } from "react";
import { onSnapshot, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { db } from "./firebase_config";
import './AllUsers.css';

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [adminActionUser, setAdminActionUser] = useState(null);
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
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (user.department && user.department.toLowerCase().includes(departmentQuery.toLowerCase()))
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
    alert(`Admin privileges ${isAdmin ? "revoked" : "granted"} successfully.`);
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

<input
        type="text"
        placeholder="Search Users by Department"
        value={departmentQuery}
        onChange={(e) => setDepartmentQuery(e.target.value)}
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
      {selectedUser && (
        <div className="popup-overlay">
          <div className="popup">
            <img src={selectedUser.dpUrl || "default-profile.png"} alt="Profile" className="popup-dp" />
            <h2>{selectedUser.name}</h2>
            <p>{selectedUser.department || "Department: Not Specified"}</p>
            <p>Role: {selectedUser.role || "Role: Not Specified"}</p>
            {selectedUser.isAdmin && <span>Admin</span>}
            <div className="popup-actions">
              <button
                onClick={() => {
                  setShowAdminConfirmation(true);
                  setAdminActionUser(selectedUser);
                }}
              >
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

      {/* Popup for confirming admin privileges */}
      {showAdminConfirmation && adminActionUser && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirm Admin Privileges</h2>
            <p>
              Are you sure you want to {adminActionUser.isAdmin ? "revoke" : "grant"} admin privileges to {adminActionUser.name}?
            </p>
            <div className="popup-actions">
              <button
                onClick={() => {
                  toggleAdminPrivileges(adminActionUser.id, adminActionUser.isAdmin);
                  setShowAdminConfirmation(false);
                  setSelectedUser(null);
                }}
              >
                Yes
              </button>
              <button onClick={() => setShowAdminConfirmation(false)}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
