import React, { useState } from 'react';
import { db } from './firebase_config';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const GenerateBill = () => {
  const [activeDays, setActiveDays] = useState('');
  const [perDayAmount, setPerDayAmount] = useState('');
  const [estbFees, setEstbFees] = useState('');
  const [specialFees, setSpecialFees] = useState('');
  const [fine, setFine] = useState('');
  const [others, setOthers] = useState('');

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
    if (!activeDays || !perDayAmount || !estbFees || !specialFees || !fine || !others) {
      alert('Please fill all fields');
      return;
    }

    try {
      const totalBill = calculateTotalBill();
      console.log('Total Bill:', totalBill);
      const userId = 'R5RxDKLskJSC4LeWBiSHCXQFz7g2'; // Directly using the document ID
      
      const userDocRef = doc(db, 'users', userId);
      const currentMonth = '2024-11'; // Hardcoded for November 2024

      // Fetching user data
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        alert("User document doesn't exist");
        return;
      }

      const userData = userDoc.data();
      let messCut = parseInt(userData.messCut) || 0;

      // Calculate total fine
      let totalFine = 0;
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

      // Calculate total deductions
      let totalDeductions = 0;
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
      const finalAmount = totalBill - (messCut * perDayAmountValue) - totalDeductions;

      // Preparing bill data
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

      // Update the billAmount for the hardcoded month of November
      await setDoc(
        userDocRef,
        { billAmount: { [currentMonth]: billData } },
        { merge: true }
      );

      alert('Bill generated successfully for November!');
    } catch (error) {
      console.error('Error generating bill:', error);
      alert('Error generating bill');
    }
  };

  return (
    <div>
      <h1>Generate Bill</h1>
      <div>
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
      <div>
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
      <div>
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
      <div>
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
      <div>
        <label>
          Fine:
          <input
            type="number"
            value={fine}
            onChange={(e) => setFine(e.target.value)}
            placeholder="Enter any fines"
          />
        </label>
      </div>
      <div>
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
