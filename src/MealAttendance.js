import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase_config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
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
  const [messCutMessage, setMessCutMessage] = useState('');
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const currentDate = getCurrentDate();
  const currentMonth = currentDate ? currentDate.slice(0, 7) : null; // Get YYYY-MM

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
    setAttendance((prev) => ({
      ...prev,
      [name]: checked,
    }));
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

  // Inside the fetchAttendance function
const fetchAttendance = async (userId) => {
  const userRef = doc(db, 'users', userId);

  setLoading(true);

  try {
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      const mealAttendance = data.mealAttendance ? data.mealAttendance[currentMonth]?.[currentDate] : null;

      // Check if the user has mess cuts for the current date
      const messCuts = data.messCuts || []; // Assuming messCuts is an array of date strings
      const hasMessCut = messCuts.includes(currentDate);
      if (hasMessCut) {
        setMessCutMessage('You are having mess cut today.');
        window.alert('You are on mess cut today. You cannot mark attendance.');
        setAttendance({
          breakfast: false,
          lunch: false,
          dinner: false,
        });
        setIsMarked(true);
      } else {
        setMessCutMessage('');
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


  const saveAttendance = async () => {
    if (!userData) {
      alert('Please fetch user data first.');
      return;
    }

    const userRef = doc(db, 'users', userData.id);

    try {
      await updateDoc(userRef, {
        [`mealAttendance.${currentMonth}.${currentDate}`]: {
          ...attendance,
        },
      });
      alert('Attendance marked successfully!');
      setIsMarked(true);
      setError(null);

      // Reload the page to allow the next user
      reloadPage();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('An error occurred while marking attendance. Please try again.');
    }
  };

  const reloadPage = () => {
    setMessNo('');
    setUserData(null);
    setAttendance({
      breakfast: false,
      lunch: false,
      dinner: false,
    });
    setIsMarked(false);
    setError(null);
    setMessCutMessage('');
  };

  const isMealDisabled = (meal) => {
    return isMarked && attendance[meal];
  };

  const generateExcelSheet = async () => {
    setLoading(true);

    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);

      const usersData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const mealAttendance = data.mealAttendance || {};

        Object.keys(mealAttendance).forEach((month) => {
          const dates = mealAttendance[month];
          Object.keys(dates).forEach((date) => {
            usersData.push({
              Name: data.name,
              'Mess No': data.messNo,
              Date: date,
              Breakfast: dates[date].breakfast ? '✔️' : '❌',
              Lunch: dates[date].lunch ? '✔️' : '❌',
              Dinner: dates[date].dinner ? '✔️' : '❌',
            });
          });
        });
      });

      const worksheet = XLSX.utils.json_to_sheet(usersData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      XLSX.writeFile(workbook, `Attendance_${currentDate}.xlsx`);

      setError(null);
      alert('Excel sheet generated successfully!');
    } catch (error) {
      console.error('Error generating Excel sheet:', error);
      setError('An error occurred while generating the Excel sheet. Please try again.');
    } finally {
      setLoading(false);
    }
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
            {messCutMessage && <div className="error-message">{messCutMessage}</div>}
            {userData && (
              <div>
                <img src={userData.dpUrl} alt="User Profile" className="profile-image" />
                <p><strong>Name:</strong> {userData.name}</p>
                <p><strong>Mess No:</strong> {userData.messNo}</p>
                <div className="attendance-form">
                  <label>
                    <input
                      type="checkbox"
                      name="breakfast"
                      checked={attendance.breakfast}
                      onChange={handleAttendanceChange}
                      disabled={isMealDisabled('breakfast') || messCutMessage}
                    />
                    Breakfast
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="lunch"
                      checked={attendance.lunch}
                      onChange={handleAttendanceChange}
                      disabled={isMealDisabled('lunch') || messCutMessage}
                    />
                    Lunch
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="dinner"
                      checked={attendance.dinner}
                      onChange={handleAttendanceChange}
                      disabled={isMealDisabled('dinner') || messCutMessage}
                    />
                    Dinner
                  </label>
                  <button onClick={saveAttendance} disabled={isMarked || messCutMessage}>
                    Mark Attendance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="download-container">
        <button onClick={generateExcelSheet} disabled={loading}>
          {loading ? 'Generating...' : 'Download Excel Sheet'}
        </button>
      </div>
    </div>
  );
};

export default MealAttendance;
