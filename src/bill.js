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
    return <ErrorScreen message="No bills available." />;
  }

  const firstMonthKey = billKeys[0];
  const firstMonthData = billData[firstMonthKey] || {};

  const activeDays = firstMonthData.activeDays || 0;
  const perDayAmount = firstMonthData.perDayAmount || 0.0;
  const deductions = firstMonthData.deductions || 0;
  const establishment = firstMonthData.establishment || 0.0;
  const specialFees = firstMonthData.specialFees || 0.0;
  const fine = firstMonthData.fine || 0.0;
  const others = firstMonthData.others || 0.0;

  const messCutAmount = messCutCount * perDayAmount;
  let finalAmount = (firstMonthData.finalAmount || 0.0) - messCutAmount;

  return (
    <div className="bill-container">
      <header className="bill-header">
        <h1>Bill</h1>
        <button onClick={() => navigate("/profile")}>Back</button>
      </header>
      <div className="bill-details">
        <DetailCard title="Active Days" value={activeDays} />
        <DetailCard
          title="Per Day Amount"
          value={`₹${perDayAmount.toFixed(2)}`}
        />
        <DetailCard title="Mess Cut Count" value={messCutCount} />
        <DetailCard
          title="Mess Cut Amount"
          value={`₹${messCutAmount.toFixed(2)}`}
        />
        <DetailCard
          title="Establishment"
          value={`₹${establishment.toFixed(2)}`}
        />
        <DetailCard title="Special Fees" value={`₹${specialFees.toFixed(2)}`} />
        <DetailCard title="Fine" value={`₹${fine.toFixed(2)}`} />
        <DetailCard title="Others" value={`₹${others.toFixed(2)}`} />
        <TotalCard finalAmount={finalAmount} />
        <PayNowButton />
      </div>
    </div>
  );
};

const LoadingScreen = () => (
  <div className="loading-screen">
    <h2>Loading...</h2>
  </div>
);

const ErrorScreen = ({ message }) => (
  <div className="error-screen">
    <h2>{message}</h2>
  </div>
);

const DetailCard = ({ title, value }) => (
  <div className="detail-card">
    <span>{title}</span>
    <span>{value}</span>
  </div>
);

const TotalCard = ({ finalAmount }) => (
  <div className="total-card">
    <h2>Total Amount to be Paid</h2>
    <span>₹{finalAmount.toFixed(2)}</span>
  </div>
);

const PayNowButton = () => {
  const navigate = useNavigate();

  const handlePayNow = () => {
    navigate("/payment-qr-details");
    alert("Redirected to payment QR page");
  };

  return (
    <div>
      <header className="bill-header">
        <h1>Bill</h1>
        <button onClick={() => navigate("/profile")}>Back</button>
      </header>
      <button className="pay-now-button" onClick={handlePayNow}>
        Pay Now
      </button>
    </div>
  );
};

export default Bill;
