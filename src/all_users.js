import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { onSnapshot, collection, doc, updateDoc, arrayUnion } from "firebase/firestore";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import { auth, db } from "./firebase_config";
import "./AllUsers.css";
import ProfileNavbar from "./profile_nav";
import { FaUserShield } from "react-icons/fa"; 

const AllUsers = () => {
  const { uid } = useParams();
  const [userData, setUserData] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentQuery, setDepartmentQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAdminConfirmation, setShowAdminConfirmation] = useState(false);
  const [adminActionUser, setAdminActionUser] = useState(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sahrudaya_mess"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (uid) {
      const userDocRef = doc(db, "sahrudaya_mess", uid);
      onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data());
        }
      });
    }
  }, [uid]);

  const filteredUsers = users.filter(
    (user) =>
      user.name &&
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      user.department &&
      user.department.toLowerCase().includes(departmentQuery.toLowerCase())
  );

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false); // Close sidebar
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddFine = async (userId, fineAmount) => {
    const month = new Date().toISOString().slice(0, 7);
    const fineEntry = {
      amount: parseFloat(fineAmount),
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "sahrudaya_mess", userId), {
      [`fine.${month}`]: arrayUnion(fineEntry),
    });
  };

  const handleAddDeduction = async (userId, deductionAmount) => {
    const month = new Date().toISOString().slice(0, 7);
    const deductionEntry = {
      amount: parseFloat(deductionAmount),
      date: new Date().toISOString(),
    };
    await updateDoc(doc(db, "sahrudaya_mess", userId), {
      [`deduction.${month}`]: arrayUnion(deductionEntry),
    });
  };

  const toggleAdminPrivileges = async (userId, isAdmin) => {
    await updateDoc(doc(db, "sahrudaya_mess", userId), {
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
      <Navbar title="All Users" onToggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

      <div className="header-container">
        {isSidebarOpen && (
          <button className="sidebar-toggle" onClick={toggleSidebar}>
          </button>
        )}
      </div>

      {isSidebarOpen && (
        <div ref={sidebarRef} className="sidebar-container">
          <Sidebar uid={userData?.uid} name={userData?.name} isAdmin={userData?.isAdmin} />
        </div>
      )}

      <div className="input-container">
        <input
          type="text"
          placeholder="Search By Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search By Department"
          value={departmentQuery}
          onChange={(e) => setDepartmentQuery(e.target.value)}
        />
      </div>

      <div className="user-list-container">
        <div className="user-list">
          {filteredUsers.map((user) => (
            <div key={user.id} className="user-item">
              <div className="user-info">
                <img
                  src={user.dpUrl || "default-profile.png"}
                  alt="Profile"
                  className="user-dp"
                />
                <h2>
                  {user.name || "Unknown User"}{" "}
                  {user.isAdmin && <FaUserShield className="admin-icon" />} {/* Show icon if admin */}
                </h2>
              </div>
              <button
                className="view-profile-button"
                onClick={() => handleProfileView(user)}
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedUser && (
        <div className="popup-overlay">
          <div className="popup">
            <img
              src={selectedUser.dpUrl || "default-profile.png"}
              alt="Profile"
              className="popup-dp"
            />
            <h2>{selectedUser.name} {selectedUser.isAdmin && <FaUserShield className="admin-icon" />}</h2> {/* Show icon in popup if admin */}
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
              <button className="wonderful-close-button" onClick={closePopup}>✕ Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdminConfirmation && adminActionUser && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Confirm Admin Privileges</h2>
            <p>
              Are you sure you want to{" "}
              {adminActionUser.isAdmin ? "revoke" : "grant"} admin privileges to{" "}
              {adminActionUser.name}?
            </p>
            <div className="popup-actions">
              <button
                onClick={() => {
                  toggleAdminPrivileges(
                    adminActionUser.id,
                    adminActionUser.isAdmin
                  );
                  setShowAdminConfirmation(false);
                  setSelectedUser(null);
                }}
              >
                Yes
              </button>
              <button onClick={() => setShowAdminConfirmation(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
