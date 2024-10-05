// AllUsers.js
import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { onSnapshot, collection, doc, updateDoc, arrayUnion } from "firebase/firestore"; // Combine imports from firestore
import Navbar from "./navbar"; // Import Navbar
import Sidebar from "./sidebar"; // Import Sidebar
import { db, auth } from "./firebase_config";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null); // Create a ref for the sidebar

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
    setIsSidebarOpen((prev) => !prev); // Toggle sidebar
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

  // Handle click outside the sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false); // Close sidebar on click outside
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div>
      <Navbar title="All Users" onToggleSidebar={toggleSidebar} />

      {isSidebarOpen && <Sidebar ref={sidebarRef} />} {/* Attach ref to Sidebar */}

      <input
        type="text"
        placeholder="Search Users"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="user-list">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-item">
            <h2>{user.name || "Unknown User"}</h2>
            {user.isAdmin && <span>Admin</span>}
            <button
              onClick={() => toggleAdminPrivileges(user.id, user.isAdmin)}
            >
              {user.isAdmin ? "Revoke Admin" : "Grant Admin"}
            </button>
            <button
              onClick={() => {
                const fineAmount = prompt("Enter Fine Amount:");
                if (fineAmount) handleAddFine(user.id, fineAmount);
              }}
            >
              Add Fine
            </button>
            <button
              onClick={() => {
                const deductionAmount = prompt("Enter Deduction Amount:");
                if (deductionAmount) handleAddDeduction(user.id, deductionAmount);
              }}
            >
              Add Deduction
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
