import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase_config";
import { doc, updateDoc, arrayUnion, onSnapshot, collection } from "firebase/firestore"; // Add 'collection'

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Use the 'collection' function to access Firestore collection
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  // Safeguard to check if userName is defined before trying to call toLowerCase
  const filteredUsers = users.filter((user) => 
    user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div>
      <h1>All Users</h1>
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
