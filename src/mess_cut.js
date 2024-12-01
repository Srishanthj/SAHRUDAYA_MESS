// import React, { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import { auth, db } from "./firebase_config";
// import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
// import { format, addDays, getMonth, getYear } from "date-fns";
// import { useNavigate } from 'react-router-dom';
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import Navbar from "./navbar";
// import Sidebar from "./sidebar";
// import "./messcut.css"; // Import your CSS file for styling

// const Messcut = () => {
//   const { uid } = useParams();
//   const [userData, setUserData] = useState(null);
//   const [messCuts, setMessCuts] = useState([]);
//   const [messCutCount, setMessCutCount] = useState(0);
//   const [startDate, setStartDate] = useState(null);
//   const [endDate, setEndDate] = useState(null);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const sidebarRef = useRef(null);
//   const navigate = useNavigate();

//   const toggleSidebar = () => {
//     setIsSidebarOpen((prev) => !prev);
//   };

//   useEffect(() => {
//     if (uid) {
//       loadDateRanges(uid);
//     } else {
//       console.error("No UID provided.");
//     }
//   }, [uid]);

//   useEffect(() => {
//     const user = auth.currentUser;
//     if (user) {
//       const userDocRef = doc(db, "sahrudaya_mess", user.uid);
//       onSnapshot(userDocRef, (doc) => {
//         if (doc.exists()) {
//           setCurrentUser(doc.data());
//         }
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         setIsSidebarOpen(false);
//       }
//     };

//     if (isSidebarOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isSidebarOpen]);

//   const selectDateRange = async () => {
//     if (!startDate || !endDate) {
//       alert("Please select both start and end dates.");
//       return;
//     }
  
//     const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
  
//     if (daysDifference < 3) {
//       alert("Mess cut requires a minimum of 3 days.");
//       return;
//     }
  
//     const calculatedMessCut = calculateMessCut(daysDifference);
  
//     if (areDatesAlreadySelected(startDate, endDate)) {
//       alert("Some of the selected dates have already been marked.");
//       return;
//     }
  
//     if (messCutCount + calculatedMessCut > 4) {
//       alert("Total mess cut days should not exceed 4.");
//       return;
//     }
  
//     const newMessCuts = [];
//     for (let i = 0; i < daysDifference; i++) {
//       const currentDate = addDays(startDate, i);
//       const formattedDate = format(currentDate, "yyyy-MM-dd");
//       newMessCuts.push(formattedDate);
//     }
  
//     setMessCuts((prev) => [...prev, ...newMessCuts]);
//     setMessCutCount((prev) => prev + calculatedMessCut);
  
//     console.log("Saving date ranges to Firestore:", {
//       newMessCuts,
//       messCutCount: messCutCount + calculatedMessCut,
//     });
  
//     await saveDateRanges(newMessCuts);
  
//     setStartDate(null);
//     setEndDate(null);
//   };
  
//   const areDatesAlreadySelected = (pickedStartDate, pickedEndDate) => {
//     const daysCount = (pickedEndDate - pickedStartDate) / (1000 * 60 * 60 * 24);
//     for (let i = 0; i <= daysCount; i++) {
//       const currentDate = addDays(pickedStartDate, i);
//       const formattedDate = format(currentDate, "yyyy-MM-dd");
//       if (messCuts.includes(formattedDate)) {
//         return true;
//       }
//     }
//     return false;
//   };
  
//   const calculateMessCut = (days) => {
//     return days >= 3 ? days : 0;
//   };
  
//   const loadDateRanges = async (uid) => {
//     const docRef = doc(db, "sahrudaya_mess", uid);
//     const docSnap = await getDoc(docRef);

//     if (docSnap.exists()) {
//       const data = docSnap.data();
//       console.log("Fetched user data:", data);
//       const loadedDateRanges = data.messCuts || [];
//       const allDates = loadedDateRanges.flatMap((range) => range.dates || []);
//       setMessCuts(allDates);

//       const currentMonth = new Date().getMonth();
//       const currentYear = new Date().getFullYear();
//       const currentMonthDates = allDates.filter((date) => {
//         const dateObj = new Date(date);
//         return (
//           dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear
//         );
//       });

//       setMessCutCount(currentMonthDates.length);
//     } else {
//       await updateDoc(docRef, { messCuts: [], messCut: 0 });
//       setMessCuts([]);
//       setMessCutCount(0);
//     }
//   };

//   const saveDateRanges = async (newMessCuts) => {
//     const groupedMessCuts = {};
//     const updatedMessCuts = [...messCuts, ...newMessCuts];

//     updatedMessCuts.forEach((date) => {
//       const monthYear = format(new Date(date), "yyyy-MM");
//       if (!groupedMessCuts[monthYear]) {
//         groupedMessCuts[monthYear] = [];
//       }
//       groupedMessCuts[monthYear].push(date);
//     });

//     const formattedMessCuts = Object.entries(groupedMessCuts).map(
//       ([month, dates]) => ({
//         month,
//         dates,
//       })
//     );

//     console.log("Formatted mess cuts:", formattedMessCuts);

//     try {
//       const docRef = doc(db, "sahrudaya_mess", uid);
//       await updateDoc(docRef, {
//         messCuts: formattedMessCuts,
//       });
//       console.log("Date ranges and mess cut updated successfully!");
//     } catch (error) {
//       console.error("Error updating document:", error);
//     }

//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();
//     const currentMonthDates = updatedMessCuts.filter((date) => {
//       const dateObj = new Date(date);
//       return (
//         dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear
//       );
//     });

//     setMessCutCount(currentMonthDates.length);
//   };

//   const formatSelectedDates = () => {
//     const groupedDates = {};

//     messCuts.forEach((date) => {
//       const month = format(new Date(date), "MMMM");
//       if (!groupedDates[month]) {
//         groupedDates[month] = [];
//       }
//       groupedDates[month].push(date);
//     });

//     return Object.entries(groupedDates)
//       .map(([month, dates]) => {
//         const startDate = format(new Date(dates[0]), "d");
//         const endDate = format(new Date(dates[dates.length - 1]), "d");
//         return ` ${month} ${startDate} - ${endDate}`;
//       })
//       .join(", ");
//   };

//   return (
//     <div>
//       <div className="app-bar">
//         <button onClick={() => navigate('/profile')} className="back-button">
//           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon">
//             <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 01.07 1.06L9.31 12l6.54 6.72a.75.75 0 11-1.1 1.02l-7-7.2a.75.75 0 010-1.02l7-7.2a.75.75 0 011.06-.1z" clipRule="evenodd" />
//           </svg>
//         </button>
//         <div className="app-bar-title">Mess Cut</div>
//       </div>
      
//       <div className="messcut-container">
//         <div className="messcut-content">
//           <div className="messcut-date-picker">
//             <label className="messcut-label">Select Start Date:</label>
//             <DatePicker
//               selected={startDate}
//               onChange={(date) => setStartDate(date)}
//               minDate={addDays(new Date(), 1)}
//               dateFormat="yyyy-MM-dd"
//               className="messcut-datepicker"
//             />
//           </div>
//           <div className="messcut-date-picker">
//             <label className="messcut-label">Select End Date:</label>
//             <DatePicker
//               selected={endDate}
//               onChange={(date) => setEndDate(date)}
//               minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 2)}
//               dateFormat="yyyy-MM-dd"
//               className="messcut-datepicker"
//             />
//           </div>
//           <button onClick={selectDateRange} className="submit-button">Submit</button>
//           <div className="messcut-count">
//             <p>Total Mess Cut Days (Current Month): {messCutCount}</p>
//           </div>
//           <div className="messcut-summary">
//             <h3>Selected Dates:</h3>
//             <div className="selected-dates">{formatSelectedDates()}</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Messcut;
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "./firebase_config";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { format, addDays } from "date-fns";
import { useNavigate } from 'react-router-dom';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import "./messcut.css"; // Import your CSS file for styling

const Messcut = () => {
  const { uid } = useParams();
  const [userData, setUserData] = useState(null);
  const [messCuts, setMessCuts] = useState([]);
  const [messCutCount, setMessCutCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    if (uid) {
      loadDateRanges(uid);
    } else {
      console.error("No UID provided.");
    }
  }, [uid]);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setCurrentUser(doc.data());
        }
      });
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  const selectDateRange = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
  
    const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1;
  
    if (daysDifference < 3) {
      alert("Mess cut requires a minimum of 3 days.");
      return;
    }
  
    const calculatedMessCut = calculateMessCut(daysDifference);
  
    if (areDatesAlreadySelected(startDate, endDate)) {
      alert("Some of the selected dates have already been marked.");
      return;
    }
  
    if (messCutCount + calculatedMessCut > 4) {
      alert("Total mess cut days should not exceed 4.");
      return;
    }
  
    const newMessCuts = [];
    for (let i = 0; i < daysDifference; i++) {
      const currentDate = addDays(startDate, i);
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      newMessCuts.push(formattedDate);
    }
  
    setMessCuts((prev) => [...prev, ...newMessCuts]);
    setMessCutCount((prev) => prev + calculatedMessCut);
  
    console.log("Saving date ranges to Firestore:", {
      newMessCuts,
      messCutCount: messCutCount + calculatedMessCut,
    });
  
    await saveDateRanges(newMessCuts);
  
    setStartDate(null);
    setEndDate(null);
  };
  

  const areDatesAlreadySelected = (pickedStartDate, pickedEndDate) => {
    const daysCount = (pickedEndDate - pickedStartDate) / (1000 * 60 * 60 * 24);
    for (let i = 0; i <= daysCount; i++) {
      const currentDate = addDays(pickedStartDate, i);
      const formattedDate = format(currentDate, "yyyy-MM-dd");
      if (messCuts.includes(formattedDate)) {
        return true;
      }
    }
    return false;
  };

  const calculateMessCut = (days) => {

    if (days >= 3) return days;
    return 0;
  };

  const loadDateRanges = async (uid) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      console.log("Fetched user data:", data);
      const loadedDateRanges = data.messCuts || [];
      const allDates = loadedDateRanges.flatMap((range) => range.dates || []);
      setMessCuts(allDates);
      setMessCutCount(allDates.length);
    } else {
      await updateDoc(docRef, { messCuts: [], messCut: 0 });
      setMessCuts([]);
      setMessCutCount(0);
    }
  };

  const saveDateRanges = async (newMessCuts) => {
    const groupedMessCuts = {};
    const updatedMessCuts = [...messCuts, ...newMessCuts];

    updatedMessCuts.forEach((date) => {
      const monthYear = format(new Date(date), "yyyy-MM");
      if (!groupedMessCuts[monthYear]) {
        groupedMessCuts[monthYear] = [];
      }
      groupedMessCuts[monthYear].push(date);
    });

    const formattedMessCuts = Object.entries(groupedMessCuts).map(
      ([month, dates]) => ({
        month,
        dates,
      })
    );

    console.log("Formatted mess cuts:", formattedMessCuts);

    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, {
        messCuts: formattedMessCuts,
        // messCut: messCutCount,
      });
      console.log("Date ranges and mess cut updated successfully!");
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const formatSelectedDates = () => {
    const groupedDates = {};

    messCuts.forEach((date) => {
      const month = format(new Date(date), "MMMM");
      if (!groupedDates[month]) {
        groupedDates[month] = [];
      }
      groupedDates[month].push(date);
    });

    return Object.entries(groupedDates)
      .map(([month, dates]) => {
        const startDate = format(new Date(dates[0]), "d");
        const endDate = format(new Date(dates[dates.length - 1]), "d");
        return ` ${month} ${startDate} - ${endDate}`;
      })
      .join(", ");
  };

  return (

    <div>

      <div className="app-bar">
        <button onClick={() => navigate('/profile')} className="back-button">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon">
            <path fillRule="evenodd" d="M15.78 4.22a.75.75 0 01.07 1.06L9.31 12l6.54 6.72a.75.75 0 11-1.1 1.02l-7-7.2a.75.75 0 010-1.02l7-7.2a.75.75 0 011.06-.1z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="app-bar-title">Mess Cut</div>
      </div>
      
      <div className="messcut-container">
        <div className="messcut-content">
          {/* <h1 className="messcut-title">Mess Cut</h1> */}

          <div className="messcut-date-picker">
            <label className="messcut-label">Select Start Date:</label>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              minDate={addDays(new Date(), 1)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select start date"
            />
          </div>

          <div className="messcut-date-picker">
            <label className="messcut-label">Select End Date:</label>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              minDate={startDate ? addDays(startDate, 1) : addDays(new Date(), 1)}
              dateFormat="yyyy-MM-dd"
              placeholderText="Select end date"
            />
          </div>

          <button onClick={selectDateRange} className="messcut-button">
            Select Date Range
          </button>

          <p className="messcut-summary">Total Mess Cut: {messCutCount} days</p>

          {messCuts.length > 0 && (
            <div className="messcut-selected-dates">
              <h3>Selected Dates:</h3>
              <ul>
                {messCuts.map((date) => (
                  <li key={date}>{format(new Date(date), "MMMM d, yyyy")}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="messcut-rules">
            <h3> Messcut Rules:</h3>
            <ul>
              <li>A minimum of 3 days is required.</li>
              <li>A maximum of 10 days is possible</li>
              <li>The final messcut amount will be 66.66 % that is 2/3 rd the total amount for the messcut days</li>
              <li>Example:If 10 days are taken, then messcut amount is calculated as (10 * perday amount) * 2/3</li>
            </ul>
          </div>

          {/* <div className="messcut-formatted-dates">
            <h3>Formatted Dates:</h3>
            <p>{formatSelectedDates()}</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Messcut;