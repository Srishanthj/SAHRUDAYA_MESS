import React, { useEffect, useState } from 'react';
import { db } from './firebase_config';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { useNavigate, useParams } from 'react-router-dom';

const Bill = () => {
    const { uid } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [messCuts, setMessCuts] = useState([]);
    const [messCutCount, setMessCutCount] = useState(0);
    const navigate = useNavigate();

    // Load date ranges and mess cuts
    const loadDateRanges = async (uid) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Fetched user data:', data);
            const loadedDateRanges = data.messCuts || [];
            
            // Flattening the loaded date ranges and setting the state
            const allDates = loadedDateRanges.flatMap(range => range.dates || []);
            setMessCuts(allDates);
            setMessCutCount(allDates.length); // Set messCutCount to the length of allDates directly
            
        } else {
            // Create a new document with default values if it doesn't exist
            await updateDoc(docRef, { messCuts: [], messCut: 0 });
            setMessCuts([]); // Initialize state as empty array
            setMessCutCount(0); // Initialize mess cut count
        }
    };

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (!uid) {
                    throw new Error("User ID is not provided.");
                }
                
                const docRef = doc(db, 'users', uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                    // Load mess cuts after user data is fetched
                    await loadDateRanges(uid);
                } else {
                    throw new Error('User not found');
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

    // Ensure userData is not null before accessing it
    if (!userData) {
        return <ErrorScreen message="No user data available." />;
    }

    const billData = userData.billAmount || {};
    const billKeys = Object.keys(billData);

    if (billKeys.length === 0) {
        return <ErrorScreen message="No billing data available." />;
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

    const messCutAmount = messCutCount * perDayAmount; // Calculate based on the loaded mess cut count
    let finalAmount = (firstMonthData.finalAmount || 0.0) - messCutAmount;

    return (
        <div className="bill-container">
            <header className="bill-header">
                <h1>Bill</h1>
                <button onClick={() => navigate('/profile')}>Back</button>
            </header>
            <div className="bill-details">
                <DetailCard title="Active Days" value={activeDays} />
                <DetailCard title="Per Day Amount" value={`₹${perDayAmount.toFixed(2)}`} />
                <DetailCard title="Mess Cut Count" value={messCutCount} />
                <DetailCard title="Mess Cut Amount" value={`₹${messCutAmount.toFixed(2)}`} />
                <DetailCard title="Establishment" value={`₹${establishment.toFixed(2)}`} />
                <DetailCard title="Special Fees" value={`₹${specialFees.toFixed(2)}`} />
                <DetailCard title="Fine" value={`₹${fine.toFixed(2)}`} />
                <DetailCard title="Others" value={`₹${others.toFixed(2)}`} />
                <TotalCard finalAmount={finalAmount} />
                <PayNowButton />
            </div>
        </div>
    );
};

// Loading Screen Component
const LoadingScreen = () => (
  <div className="loading-screen">
    <h2>Loading...</h2>
  </div>
);

// Error Screen Component
const ErrorScreen = ({ message }) => (
  <div className="error-screen">
    <h2>Error fetching data: {message}</h2>
  </div>
);

// Detail Card Component
const DetailCard = ({ title, value }) => (
  <div className="detail-card">
    <span>{title}</span>
    <span>{value}</span>
  </div>
);

// Total Card Component
const TotalCard = ({ finalAmount }) => (
  <div className="total-card">
    <h2>Total Amount to be Paid</h2>
    <span>₹{finalAmount.toFixed(2)}</span>
  </div>
);

// Pay Now Button Component
const PayNowButton = () => {
  const navigate = useNavigate();
  
  const handlePayNow = () => {
    navigate('/payment-qr-details');
    alert("Redirected to payment QR page");
  };

  return (
    <button className="pay-now-button" onClick={handlePayNow}>
      Pay Now
    </button>
  );
};

export default Bill;