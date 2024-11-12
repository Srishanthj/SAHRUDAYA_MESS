import React, { useState, useEffect } from 'react';
import { db } from './firebase_config';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './GenerateBill.css';
import { useParams } from "react-router-dom";

const GenerateBill = () => {
  const navigate = useNavigate();
  const [activeDays, setActiveDays] = useState('');
  const [perDayAmount, setPerDayAmount] = useState('');
  const [estbFees, setEstbFees] = useState('');
  const [specialFees, setSpecialFees] = useState('');
  const [fine, setFine] = useState('');
  const [others, setOthers] = useState('');
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');

  useEffect(() => {
    const today = new Date();
    const month = today.toLocaleString('default', { month: '2-digit' });
    const year = today.getFullYear();
    setCurrentMonth(`${year}-${month}`);
  }, []);

  const calculateTotalBill = () => {
    const activeDaysValue = parseInt(activeDays) || 0;
    const perDayAmountValue = parseInt(perDayAmount) || 0;
    const estbFeesValue = parseInt(estbFees) || 0;
    const specialFeesValue = parseInt(specialFees) || 0;
    const fineValue = parseInt(fine) || 0;
    const othersValue = parseInt(others) || 0;

    return (activeDaysValue * perDayAmountValue) + estbFeesValue + specialFeesValue + fineValue + othersValue;
  };

  const handleGenerateBill = async () => {
    if (!activeDays || !perDayAmount || !estbFees || !specialFees || !others) {
      setError('Please fill all fields');
      return;
    }
    
    setError('');

    try {
      const totalBill = calculateTotalBill();
      console.log('Total Bill:', totalBill);

      const usersCollectionRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollectionRef);

      querySnapshot.forEach(async (userDoc) => {
        const userData = userDoc.data();
        let totalFine = 0;
        let totalDeductions = 0;

        if (userData.fine && typeof userData.fine === 'object' && userData.fine[currentMonth]) {
          const monthlyFines = userData.fine[currentMonth];
          if (Array.isArray(monthlyFines)) {
            monthlyFines.forEach((fineEntry) => {
              if (fineEntry.amount) {
                totalFine += fineEntry.amount;
              }
            });
          }
        }

        if (userData.deduction && typeof userData.deduction === 'object' && userData.deduction[currentMonth]) {
          const monthlyDeductions = userData.deduction[currentMonth];
          if (Array.isArray(monthlyDeductions)) {
            monthlyDeductions.forEach((deductionEntry) => {
              if (deductionEntry.amount) {
                totalDeductions += deductionEntry.amount;
              }
            });
          }
        }

        const perDayAmountValue = parseInt(perDayAmount) || 0;
        const finalAmount = totalBill - totalDeductions; // Adjusted calculation

        const billData = {
          activeDays: parseInt(activeDays) || 0,
          fine: totalFine + (parseInt(fine) || 0),
          specialFees: parseInt(specialFees) || 0,
          perDayAmount: perDayAmountValue,
          establishment: parseInt(estbFees) || 0,
          others: parseInt(others) || 0,
          amount: totalBill,
          deductions: totalDeductions,
          finalAmount: finalAmount,
          date: new Date().toISOString(),
        };

        await setDoc(
          userDoc.ref,
          { billAmount: { [currentMonth]: billData } },
          { merge: true }
        );

        console.log(`Bill generated successfully for user ${userDoc.id} for ${currentMonth}!`);
      });

      alert('Bills generated successfully for all users for the current month!');
    } catch (error) {
      console.error('Error generating bills:', error);
      alert('Error generating bills');
    }
  };

  return (
    <div className="container">
      <h1>Generate Bill</h1>
      {error && <div className="alert">{error}</div>}
      <button onClick={() => navigate('/profile')} className="back-button">Back</button>
      <div className="form-control">
        <label>
          Active Days:
          <input
            type="number"
            value={activeDays}
            onChange={(e) => setActiveDays(e.target.value)}
            placeholder="Enter the total no of active days"
          />
        </label>
      </div>
      <div className="form-control">
        <label>
          Per Day Amount:
          <input
            type="number"
            value={perDayAmount}
            onChange={(e) => setPerDayAmount(e.target.value)}
            placeholder="Enter the per day amount"
          />
        </label>
      </div>
      <div className="form-control">
        <label>
          Establishment Fees:
          <input
            type="number"
            value={estbFees}
            onChange={(e) => setEstbFees(e.target.value)}
            placeholder="Enter the establishment fees"
          />
        </label>
      </div>
      <div className="form-control">
        <label>
          Special Fees:
          <input
            type="number"
            value={specialFees}
            onChange={(e) => setSpecialFees(e.target.value)}
            placeholder="Enter any special fees"
          />
        </label>
      </div>
      <div className="form-control">
        <label>
          Any Others:
          <input
            type="number"
            value={others}
            onChange={(e) => setOthers(e.target.value)}
            placeholder="Enter other applicable charges"
          />
        </label>
      </div>
      <button onClick={handleGenerateBill}>Generate Bill</button>
    </div>
  );
};

export default GenerateBill;
