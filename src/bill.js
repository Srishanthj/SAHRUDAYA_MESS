import React, { useEffect, useState } from "react";
import { db } from "./firebase_config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate, useParams } from "react-router-dom";
import './bill.css';

const Bill = () => {
  const { uid } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messCuts, setMessCuts] = useState([]);
  const [messCutCount, setMessCutCount] = useState(0);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!uid) {
          throw new Error("User ID is not provided.");
        }

        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setUserData(docSnap.data());
          await loadDateRanges(uid);
        } else {
          throw new Error("User not found");
        }
      } catch (err) {
        setError(`Error fetching user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [uid]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen message={error} />;
  }

  if (!userData) {
    return <ErrorScreen message="No user data available." />;
  }

  const billData = userData.billAmount || {};
  const billKeys = Object.keys(billData);

  if (billKeys.length === 0) {
    return (
      <div className="loading-container">
        <ErrorScreen message="No bills available." />
      </div>
    );
  }

  // Fetching the first month's data
  const firstMonthKey = billKeys[0];
  const firstMonthData = billData[firstMonthKey] || {};

  const {
    activeDays = 0,
    fine = 0,
    specialFees = 0,
    perDayAmount = 0,
    establishment = 0,
    others = 0,
    amount = 0,
    deductions = 0,
    finalAmount = 0.0,
  } = firstMonthData;

  return (
    <div className="bill-container">
      <header className="bill-header">
        <h1 className="bill-title">Bill</h1>
        <button className="back-button" onClick={() => navigate("/profile")}>Back</button>
      </header>
      <div className="bill-details">
        <TotalCard finalAmount={finalAmount} />
        <div className="bill-summary">
          <h2 className="summary-title">Bill Summary</h2>
          <ul className="summary-list">
            <li className="summary-item">Active Days: {activeDays}</li>
            <li className="summary-item">Amount (Per Day): ₹{perDayAmount}</li>
            <li className="summary-item">Establishment Fees: ₹{establishment}</li>
            <li className="summary-item">Special Fees: ₹{specialFees}</li>
            <li className="summary-item">Fine: ₹{fine}</li>
            <li className="summary-item">Others: ₹{others}</li>
            <li className="summary-item">Amount: ₹{amount}</li>
            <li className="summary-item">Deductions: ₹{deductions}</li>
            <li className="summary-item total-amount">Total Amount to be Paid: ₹{finalAmount.toFixed(2)}</li>
          </ul>
        </div>
        <PayNowButton />
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="loading-screen">
    <h2 className="loading-text">Loading...</h2>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="error-screen">
    <h2 className="error-text">{message}</h2>
  </div>
);

const TotalCard = ({ finalAmount }) => (
  <div className="total-card">
    <h2 className="total-card-title">Total Amount to be Paid</h2>
    <span className="total-amount-value">₹{finalAmount.toFixed(2)}</span>
  </div>
);

const PayNowButton = () => {
  const navigate = useNavigate();

  const handlePayNow = () => {
    navigate("/payment-qr-details");
    alert("Redirected to payment QR page");
  };

  return (
    <div className="pay-now-container">
      <button className="pay-now-button" onClick={handlePayNow}>
        Pay Now
      </button>
    </div>
  );
};

export default Bill;
