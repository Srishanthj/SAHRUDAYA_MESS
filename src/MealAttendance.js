import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase_config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import './MealAttendance.css';

const MealAttendance = () => {
  const [messNo, setMessNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [attendance, setAttendance] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });
  const [isMarked, setIsMarked] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  const currentDate = getCurrentDate();

  useEffect(() => {
    if (userData) {
      fetchAttendance(userData.id);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    setMessNo(e.target.value);
  };

  const handleAttendanceChange = (e) => {
    const { name, checked } = e.target;

    // Allow only unchecked meals to be modified before submission
    if (!isMarked) {
      if (checked) {
        // If the meal is checked, uncheck all others
        setAttendance({
          breakfast: name === 'breakfast' ? checked : false,
          lunch: name === 'lunch' ? checked : false,
          dinner: name === 'dinner' ? checked : false,
        });
      } else {
        // Allow unchecking the selected meal
        setAttendance((prev) => ({
          ...prev,
          [name]: checked,
        }));
      }
    }
  };

  const fetchUserData = async () => {
    if (messNo.trim() === '') {
      alert('Please enter a mess number.');
      return;
    }

    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('messNo', '==', messNo));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((doc) => {
          const user = { ...doc.data(), id: doc.id };
          setUserData(user);
        });
        setError(null);
      } else {
        setError('No user found with this mess number.');
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('An error occurred while fetching user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (userId) => {
    const userRef = doc(db, 'users', userId);

    setLoading(true);

    try {
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const mealAttendance = data.mealAttendance ? data.mealAttendance[currentDate] : null;

        if (mealAttendance) {
          setAttendance({
            breakfast: mealAttendance.breakfast || false,
            lunch: mealAttendance.lunch || false,
            dinner: mealAttendance.dinner || false,
          });
          setIsMarked(true);
        } else {
          setAttendance({
            breakfast: false,
            lunch: false,
            dinner: false,
          });
          setIsMarked(false);
        }
        setError(null);
      } else {
        setError('User document does not exist.');
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('An error occurred while fetching attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async () => {
    if (!userData) {
      alert('Please fetch user data first.');
      return;
    }

    const userRef = doc(db, 'users', userData.id);

    try {
      await updateDoc(userRef, {
        [`mealAttendance.${currentDate}`]: {
          ...attendance,
        },
      });
      alert('Attendance marked successfully!');
      setIsMarked(true);
      setError(null);
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('An error occurred while marking attendance. Please try again.');
    }
  };

  const reloadForm = () => {
    setMessNo('');
    setUserData(null);
    setAttendance({
      breakfast: false,
      lunch: false,
      dinner: false,
    });
    setIsMarked(false);
    setError(null);
  };

  // Disable meals that are already marked as true in the database
  const isMealDisabled = (meal) => {
    return isMarked && attendance[meal];
  };

  return (
    <div>
      <div className="app-bar">
        <button onClick={() => navigate('/profile')} className="back-button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="back-icon"
          >
            <path
              fillRule="evenodd"
              d="M15.78 4.22a.75.75 0 01.07 1.06L9.31 12l6.54 6.72a.75.75 0 11-1.1 1.02l-7-7.2a.75.75 0 010-1.02l7-7.2a.75.75 0 011.06-.1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <div className="app-bar-title">Attendance Marker</div>
      </div>
      <div className="meal-attendance-container">
        <div className="user-info">
          <div className="profile">
            <h1>Meal Attendance</h1>
            <input
              type="text"
              placeholder="Enter Mess Number"
              value={messNo}
              onChange={handleInputChange}
            />
            <button onClick={fetchUserData} disabled={loading}>
              {loading ? 'Fetching...' : 'Fetch User Data'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {userData && (
              <div>
                <img src={userData.dpUrl} alt="User Profile" className="profile-image" />
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Mess No:</strong> {userData.messNo}</p>
              </div>
            )}
          </div>
          <div className="attendance">
            {userData && (
              <>
                <label>
                  <input
                    type="checkbox"
                    name="breakfast"
                    checked={attendance.breakfast}
                    onChange={handleAttendanceChange}
                    disabled={isMealDisabled('breakfast')} // Disable if already marked
                  />
                  Breakfast {isMarked && (attendance.breakfast ? '✔️' : '❌')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="lunch"
                    checked={attendance.lunch}
                    onChange={handleAttendanceChange}
                    disabled={isMealDisabled('lunch')} // Disable if already marked
                  />
                  Lunch {isMarked && (attendance.lunch ? '✔️' : '❌')}
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="dinner"
                    checked={attendance.dinner}
                    onChange={handleAttendanceChange}
                    disabled={isMealDisabled('dinner')} // Disable if already marked
                  />
                  Dinner {isMarked && (attendance.dinner ? '✔️' : '❌')}
                </label>
                <button onClick={markAttendance} disabled={isMarked || loading}>
                  {loading ? 'Marking...' : (isMarked ? 'Attendance Marked' : 'Mark Attendance')}
                </button>
              </>
            )}
          </div>
          <button onClick={reloadForm} className="reload-button">
            Reload for New User
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealAttendance;
