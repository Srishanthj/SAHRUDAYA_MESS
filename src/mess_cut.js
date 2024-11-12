import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { auth, db } from "./firebase_config";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { format, addDays } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Navbar from "./navbar";
import Sidebar from "./sidebar";
import "./messcut.css"; // Import your CSS file for styling

const Messcut = () => {
  const { uid } = useParams();
  const [messCuts, setMessCuts] = useState([]);
  const [messCutCount, setMessCutCount] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

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
    const calculatedMessCut = calculateMessCut(daysDifference);

    if (areDatesAlreadySelected(startDate, endDate)) {
      alert("Some of the selected dates have already been marked.");
      return;
    }

    if (messCutCount + calculatedMessCut > 10) {
      alert("Total mess cut days should not exceed 10.");
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
    if (days === 3) return 2;
    if (days === 4) return 3;
    if (days >= 5) return days;
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
        messCut: messCutCount,
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
    <div className="messcut-container">
      <Navbar title="Mess Cut" onToggleSidebar={toggleSidebar} />

      {isSidebarOpen && (
        <div ref={sidebarRef} className="messcut-sidebar">
          <Sidebar
            uid={currentUser?.id}
            name={currentUser?.name}
            isAdmin={currentUser?.isAdmin}
          />
        </div>
      )}

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
          <h3>Rules:</h3>
          <ul>
            <li>A minimum of 3 days is required.</li>
            <li>If 3 days are taken, the amount of 2 days is deducted.</li>
            <li>If 4 days are taken, the amount of 3 days is deducted.</li>
            <li>If 5 days are taken, the number of taken days will be deducted.</li>
          </ul>
        </div>

        <div className="messcut-formatted-dates">
          <h3>Formatted Dates:</h3>
          <p>{formatSelectedDates()}</p>
        </div>
      </div>
    </div>
  );
};

export default Messcut;
