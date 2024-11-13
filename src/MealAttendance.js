import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from './firebase_config';
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import * as XLSX from 'xlsx';
import './MealAttendance.css';

const MealAttendance = () => {
  const [messNo, setMessNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [attendance, setAttendance] = useState({ breakfast: false, lunch: false, dinner: false });
  const [isMarked, setIsMarked] = useState({ breakfast: false, lunch: false, dinner: false });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [messCutMessage, setMessCutMessage] = useState('');
  const [isMessCutToday, setIsMessCutToday] = useState(false);
  const navigate = useNavigate();

  const getCurrentDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };

  const currentDate = getCurrentDate();
  const currentMonth = currentDate.slice(0, 7); // Format: YYYY-MM

  useEffect(() => {
    if (userData) {
      fetchAttendance(userData.id);
    }
  }, [userData]);

  const handleInputChange = (e) => {
    setMessNo(e.target.value);
  };

  const fetchUserData = async () => {
    if (messNo.trim() === '') {
        setError('Please enter a mess number.');
        return;
    }

    setLoading(true);

  
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('messNo', '==', messNo.toUpperCase())); // Convert to uppercase
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
              const user = { ...doc.data(), id: doc.id };
              setUserData(user);
          });
            setError(null);
            setIsMarked({ breakfast: false, lunch: false, dinner: false });
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
            const mealAttendance = data.mealAttendance ? data.mealAttendance[currentMonth]?.[currentDate] : null;

            const messCuts = data.messCuts || [];
            const isMessCut = messCuts.some((cut) => cut.dates.includes(currentDate));

            setIsMessCutToday(isMessCut);
            setMessCutMessage(isMessCut ? '' : '');

            setAttendance({
                breakfast: mealAttendance?.breakfast || false,
                lunch: mealAttendance?.lunch || false,
                dinner: mealAttendance?.dinner || false,
            });
            setIsMarked({
                breakfast: mealAttendance?.breakfast || false,
                lunch: mealAttendance?.lunch || false,
                dinner: mealAttendance?.dinner || false,
            });
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

  const saveAttendance = async (meal) => {
    if (!userData) {
      alert('Please fetch user data first.');
      return;
    }

    const userRef = doc(db, 'users', userData.id);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    const messCuts = data.messCuts || [];

    if (messCuts.some((cut) => cut.dates.includes(currentDate))) {
      alert('You are on mess cut today. You cannot mark attendance.');
      return;
    }

    try {
      await updateDoc(userRef, {
        [`mealAttendance.${currentMonth}.${currentDate}`]: {
          ...attendance,
          [meal]: true,
        },
      });
      alert(`${meal.charAt(0).toUpperCase() + meal.slice(1)} Attendance marked successfully!`);
      setIsMarked((prev) => ({ ...prev, [meal]: true }));
      setError(null);
      reloadPage();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError('An error occurred while marking attendance. Please try again.');
    }
  };

  const reloadPage = () => {
    setMessNo('');
    setUserData(null);
    setAttendance({ breakfast: false, lunch: false, dinner: false });
    setIsMarked({ breakfast: false, lunch: false, dinner: false });
    setError(null);
    setMessCutMessage('');
    setIsMessCutToday(false);
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
        const currentDayAttendance = mealAttendance[currentMonth]?.[currentDate];
        
        if (currentDayAttendance) {
          usersData.push({
            Name: data.name,
            'Mess No': data.messNo,
            Date: currentDate,
            Breakfast: currentDayAttendance.breakfast ? '✔️' : '❌',
            Lunch: currentDayAttendance.lunch ? '✔️' : '❌',
            Dinner: currentDayAttendance.dinner ? '✔️' : '❌',
          });
        }
      });
  
      const worksheet = XLSX.utils.json_to_sheet(usersData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
      XLSX.writeFile(workbook, `Attendance_${currentDate}.xlsx`);
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
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 01.07 1.06L9.31 12l6.54 6.72a.75.75 0 11-1.1 1.02l-7-7.2a.75.75 0 010-1.02l7-7.2a.75.75 0 011.06-.1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="app-bar-title">Attendance Marker</div>
      </div>
      <div className="meal-attendance-container">
        <div className="user-info">
          <div className="profile">
            <h1>Meal Attendance</h1>
            <input type="text" placeholder="Enter Mess Number" value={messNo} onChange={handleInputChange} />
            <button onClick={fetchUserData} disabled={loading}>{loading ? 'Loading...' : 'Fetch User Data'}</button>
            {error && <p className="error-message">{error}</p>}
          </div>
          {userData && (
            <div className="user-details">
              {userData.dpUrl && <img src={userData.dpUrl} alt={`${userData.name}'s Profile`} className="profile-image" />}
              <p>Name: {userData.name}</p>
              <p>Mess Number: {userData.messNo}</p>
            </div>
          )}
          {messCutMessage && <p className="mess-cut-message">{messCutMessage}</p>}
        </div>
        {userData && (
          <>
            {isMessCutToday && <p className="mess-cut-warning">You are in mess cut today.</p>}
            <div className="attendance-buttons">
              <button onClick={() => saveAttendance('breakfast')} disabled={isMarked.breakfast}>Mark Breakfast</button>
              <button onClick={() => saveAttendance('lunch')} disabled={isMarked.lunch}>Mark Lunch</button>
              <button onClick={() => saveAttendance('dinner')} disabled={isMarked.dinner}>Mark Dinner</button>
            </div>
          </>
        )}
      </div>
      <button onClick={generateExcelSheet} className="export-button">Export Attendance</button>
    </div>
  );
};

export default MealAttendance;