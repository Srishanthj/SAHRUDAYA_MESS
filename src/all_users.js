import React, { useEffect, useState } from 'react';
import { db } from './firebase_config'; // Make sure this points to your Firebase config
import './AllUsers.css'; // Adjust according to your styles
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore'; // Import necessary functions

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => { // Use `onSnapshot` from Firestore
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, []);

  const handleAdminUpdate = async (userId, isAdmin) => {
    try {
      const userRef = doc(db, 'users', userId); // Get reference to the user document
      await updateDoc(userRef, { isAdmin }); // Use `updateDoc` to update admin status
      alert(isAdmin ? 'Admin privileges granted' : 'Admin privileges revoked');
    } catch (error) {
      alert('Could not update admin privileges');
    }
  };

  const handleFine = (userId) => {
    // Implement add fine functionality
    alert('Add fine functionality not implemented yet');
  };

  const handlePaid = async (userId) => {
    const userRef = doc(db, 'users', userId); // Get reference to the user document
    const userDoc = await getDoc(userRef); // Use `getDoc` to fetch user data
    const userData = userDoc.data();

    const messCuts = userData.messCuts;
    if (messCuts && Object.keys(messCuts).length > 0) {
      const firstMonth = Object.keys(messCuts)[0];
      if (messCuts[firstMonth].length > 0) {
        messCuts[firstMonth].shift(); // Remove the first item
        if (messCuts[firstMonth].length === 0) {
          delete messCuts[firstMonth];
        }
        await updateDoc(userRef, { messCuts }); // Use `updateDoc` to update mess cuts
        alert('Paid status updated');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="all-users">
      <h1>All Users</h1>
      <div className="user-list">
        {users.map((user) => (
          <div key={user.id} className="user-container">
            <img src={user.dp} alt={`${user.name}'s avatar`} className="avatar" />
            <div className="user-info">
              <h2>{user.name}</h2>
              {user.isAdmin && <span className="admin-icon">👑</span>}
              <div className="buttons">
                <button onClick={() => handleAdminUpdate(user.id, true)}>Grant Admin</button>
                <button onClick={() => handleAdminUpdate(user.id, false)}>Revoke Admin</button>
                <button onClick={() => handleFine(user.id)}>Add Fine</button>
                <button onClick={() => handlePaid(user.id)}>Mark as Paid</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllUsers;
