// // import React, { useEffect, useState } from 'react';
// // import { useParams } from 'react-router-dom'; // Import useParams
// // import { auth, db } from './firebase_config'; 
// // import { doc, getDoc, updateDoc } from 'firebase/firestore';
// // import { format, addDays } from 'date-fns';
// // import DatePicker from 'react-datepicker';
// // import 'react-datepicker/dist/react-datepicker.css';

// // const Messcut = () => {
// //     const { uid } = useParams();
// //     const [messCuts, setMessCuts] = useState([]);
// //     const [messCutCount, setMessCutCount] = useState(0);
// //     const [startDate, setStartDate] = useState(null);
// //     const [endDate, setEndDate] = useState(null);

// //     useEffect(() => {
// //         if (uid) {
// //             loadDateRanges(uid);
// //         } else {
// //             console.error('No UID provided.');
// //         }
// //     }, [uid]);

// //     const loadDateRanges = async (uid) => {
// //         const docRef = doc(db, 'users', uid);
// //         const docSnap = await getDoc(docRef);
        
// //         if (docSnap.exists()) {
// //             const data = docSnap.data();
// //             console.log('Fetched user data:', data);
// //             const loadedDateRanges = data.messCuts || [];
// //             const loadedMessCutCount = data.messCut || 0; // Load messCut directly from the document

// //             // Flattening the loaded date ranges
// //             setMessCuts(loadedDateRanges.flatMap(range => range.dates || []));
// //             setMessCutCount(Math.min(loadedMessCutCount, 10)); // Use loaded count, limit to 10
// //         } else {
// //             // Create a new document with default values if it doesn't exist
// //             await updateDoc(docRef, { messCuts: [], messCut: 0 });
// //             setMessCuts([]); // Initialize state as empty array
// //             setMessCutCount(0); // Initialize mess cut count
// //         }
// //     };

// //     const selectDateRange = async () => {
// //         if (!startDate || !endDate) {
// //             alert('Please select both start and end dates.');
// //             return;
// //         }

// //         const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Calculate the number of days in the selected range
// //         const calculatedMessCut = calculateMessCut(daysDifference); // Calculate the mess cut based on the number of days

// //         // Check if the selected dates are already marked
// //         if (areDatesAlreadySelected(startDate, endDate)) {
// //             alert('Some of the selected dates have already been marked.');
// //             return;
// //         }

// //         // Check if the total mess cut exceeds the limit of 10
// //         if (messCutCount + calculatedMessCut > 10) {
// //             alert('Total mess cut days should not exceed 10.');
// //         } else {
// //             const newMessCuts = [];
// //             for (let i = 0; i < daysDifference; i++) {
// //                 const currentDate = addDays(startDate, i);
// //                 const formattedDate = format(currentDate, 'yyyy-MM-dd');
// //                 newMessCuts.push(formattedDate);
// //             }
// //             setMessCuts(prev => [...prev, ...newMessCuts]); // Update state with new dates
// //             setMessCutCount(prev => prev + calculatedMessCut); // Update mess cut count
            
// //             console.log('Saving date ranges to Firestore:', {
// //                 newMessCuts,
// //                 messCutCount: messCutCount + calculatedMessCut,
// //             });
            
// //             await saveDateRanges(newMessCuts); // Save the updated date ranges to Firestore
            
// //             setStartDate(null); // Reset start date
// //             setEndDate(null); // Reset end date
// //         }
// //     };

// //     const areDatesAlreadySelected = (pickedStartDate, pickedEndDate) => {
// //         const daysCount = (pickedEndDate - pickedStartDate) / (1000 * 60 * 60 * 24); // Get the number of days in the selected range
// //         for (let i = 0; i <= daysCount; i++) {
// //             const currentDate = addDays(pickedStartDate, i);
// //             const formattedDate = format(currentDate, 'yyyy-MM-dd');
// //             if (messCuts.includes(formattedDate)) {
// //                 return true; // Return true if any of the selected dates are already in the list
// //             }
// //         }
// //         return false; // Return false if none of the selected dates are already marked
// //     };

// //     const calculateMessCut = (days) => {
// //         // Calculate the mess cut based on the number of selected days
// //         if (days === 3) return 2;
// //         if (days === 4) return 3;
// //         if (days >= 5) return days;
// //         return 0;
// //     };

// //     const saveDateRanges = async (newMessCuts) => {
// //         const groupedMessCuts = {};
// //         const updatedMessCuts = [...messCuts, ...newMessCuts]; // Combine existing and new mess cuts
        
// //         updatedMessCuts.forEach(date => {
// //             const monthYear = format(new Date(date), 'yyyy-MM');
// //             if (!groupedMessCuts[monthYear]) {
// //                 groupedMessCuts[monthYear] = [];
// //             }
// //             groupedMessCuts[monthYear].push(date); // Group dates by month and year
// //         });

// //         const formattedMessCuts = Object.entries(groupedMessCuts).map(([month, dates]) => ({
// //             month,
// //             dates,
// //         }));

// //         console.log('Formatted mess cuts:', formattedMessCuts);

// //         try {
// //             const docRef = doc(db, 'users', uid); // Use the UID passed from the sidebar
// //             await updateDoc(docRef, {
// //                 messCuts: formattedMessCuts,
// //                 messCut: messCutCount,
// //             });
// //             console.log('Date ranges and mess cut updated successfully!');
// //         } catch (error) {
// //             console.error('Error updating document:', error);
// //         }
// //     };

// //     const formatSelectedDates = () => {
// //         const groupedDates = {};

// //         messCuts.forEach(date => {
// //             const month = format(new Date(date), 'MMMM');
// //             if (!groupedDates[month]) {
// //                 groupedDates[month] = [];
// //             }
// //             groupedDates[month].push(date);
// //         });

// //         return Object.entries(groupedDates).map(([month, dates]) => {
// //             const startDate = format(new Date(dates[0]), 'd');
// //             const endDate = format(new Date(dates[dates.length - 1]), 'd');
// //             return `${month} ${startDate} - ${endDate}`; // Format the dates for display
// //         }).join(', ');
// //     };

// //     return (
// //         <div>
// //             <h1>Mess Cut</h1>
// //             <div>
// //                 <label>Select Start Date:</label>
// //                 <DatePicker
// //                     selected={startDate}
// //                     onChange={(date) => setStartDate(date)}
// //                     minDate={new Date()} // Set minimum date to today
// //                     dateFormat="yyyy-MM-dd"
// //                     placeholderText="Select start date"
// //                 />
// //             </div>
// //             <div>
// //                 <label>Select End Date:</label>
// //                 <DatePicker
// //                     selected={endDate}
// //                     onChange={(date) => setEndDate(date)}
// //                     minDate={startDate ? addDays(startDate, 1) : new Date()} // Minimum end date is the day after the selected start date
// //                     dateFormat="yyyy-MM-dd"
// //                     placeholderText="Select end date"
// //                 />
// //             </div>
// //             <button onClick={selectDateRange}>Select Date Range</button>
// //             <p>Total Mess Cut: {messCutCount} days</p>
// //             {messCuts.length > 0 && (
// //                 <div>
// //                     <h3>Selected Dates:</h3>
// //                     <ul>
// //                         {messCuts.map(date => (
// //                             <li key={date}>{format(new Date(date), 'MMMM d, yyyy')}</li>
// //                         ))}
// //                     </ul>
// //                 </div>
// //             )}
// //             <div>
// //                 <h3>Rules:</h3>
// //                 <ul>
// //                     <li>A minimum of 3 days is required.</li>
// //                     <li>If 3 days are taken, the amount of 2 days is deducted.</li>
// //                     <li>If 4 days are taken, the amount of 3 days is deducted.</li>
// //                     <li>If 5 days are taken, the number of taken days will be deducted.</li>
// //                 </ul>
// //             </div>
// //             <div>
// //                 <h3>Formatted Dates:</h3>
// //                 <p>{formatSelectedDates()}</p>
// //             </div>
// //         </div>
// //     );
// // };

// // export default Messcut;


// import React, { useEffect, useState } from 'react';
// import { useParams } from 'react-router-dom'; // Import useParams
// import { auth, db } from './firebase_config'; 
// import { doc, getDoc, updateDoc } from 'firebase/firestore';
// import { format, addDays } from 'date-fns';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';

// const Messcut = () => {
//     const { uid } = useParams();
//     const [messCuts, setMessCuts] = useState([]);
//     const [messCutCount, setMessCutCount] = useState(0);
//     const [startDate, setStartDate] = useState(null);
//     const [endDate, setEndDate] = useState(null);

//     useEffect(() => {
//         if (uid) {
//             loadDateRanges(uid);
//         } else {
//             console.error('No UID provided.');
//         }
//     }, [uid]);

//     const loadDateRanges = async (uid) => {
//         const docRef = doc(db, 'users', uid);
//         const docSnap = await getDoc(docRef);
        
//         if (docSnap.exists()) {
//             const data = docSnap.data();
//             console.log('Fetched user data:', data);
//             const loadedDateRanges = data.messCuts || [];
            
//             // Flattening the loaded date ranges and setting the state
//             const allDates = loadedDateRanges.flatMap(range => range.dates || []);
//             setMessCuts(allDates);
//             setMessCutCount(allDates.length); // Set messCutCount to the length of allDates directly
            
//         } else {
//             // Create a new document with default values if it doesn't exist
//             await updateDoc(docRef, { messCuts: [], messCut: 0 });
//             setMessCuts([]); // Initialize state as empty array
//             setMessCutCount(0); // Initialize mess cut count
//         }
//     };

//     const selectDateRange = async () => {
//         if (!startDate || !endDate) {
//             alert('Please select both start and end dates.');
//             return;
//         }

//         const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Calculate the number of days in the selected range
//         const calculatedMessCut = calculateMessCut(daysDifference); // Calculate the mess cut based on the number of days

//         // Check if the selected dates are already marked
//         if (areDatesAlreadySelected(startDate, endDate)) {
//             alert('Some of the selected dates have already been marked.');
//             return;
//         }

//         // Check if the total mess cut exceeds the limit of 10
//         if (messCutCount + calculatedMessCut >= 10) {
//             alert('Total mess cut days should not exceed 10.');
//         } else {
//             const newMessCuts = [];
//             for (let i = 0; i < daysDifference; i++) {
//                 const currentDate = addDays(startDate, i);
//                 const formattedDate = format(currentDate, 'yyyy-MM-dd');
//                 newMessCuts.push(formattedDate);
//             }
//             setMessCuts(prev => [...prev, ...newMessCuts]); // Update state with new dates
//             setMessCutCount(prev => prev + calculatedMessCut); // Update mess cut count
            
//             console.log('Saving date ranges to Firestore:', {
//                 newMessCuts,
//                 messCutCount: messCutCount + calculatedMessCut,
//             });
            
//             await saveDateRanges(newMessCuts); // Save the updated date ranges to Firestore
            
//             setStartDate(null); // Reset start date
//             setEndDate(null); // Reset end date
//         }
//     };

//     const areDatesAlreadySelected = (pickedStartDate, pickedEndDate) => {
//         const daysCount = (pickedEndDate - pickedStartDate) / (1000 * 60 * 60 * 24); // Get the number of days in the selected range
//         for (let i = 0; i <= daysCount; i++) {
//             const currentDate = addDays(pickedStartDate, i);
//             const formattedDate = format(currentDate, 'yyyy-MM-dd');
//             if (messCuts.includes(formattedDate)) {
//                 return true; // Return true if any of the selected dates are already in the list
//             }
//         }
//         return false; // Return false if none of the selected dates are already marked
//     };

//     const calculateMessCut = (days) => {
//         // Calculate the mess cut based on the number of selected days
//         if (days === 3) return 2;
//         if (days === 4) return 3;
//         if (days >= 5) return days;
//         return 0;
//     };

//     const saveDateRanges = async (newMessCuts) => {
//         const groupedMessCuts = {};
//         const updatedMessCuts = [...messCuts, ...newMessCuts]; // Combine existing and new mess cuts
        
//         updatedMessCuts.forEach(date => {
//             const monthYear = format(new Date(date), 'yyyy-MM');
//             if (!groupedMessCuts[monthYear]) {
//                 groupedMessCuts[monthYear] = [];
//             }
//             groupedMessCuts[monthYear].push(date); // Group dates by month and year
//         });

//         const formattedMessCuts = Object.entries(groupedMessCuts).map(([month, dates]) => ({
//             month,
//             dates,
//         }));

//         console.log('Formatted mess cuts:', formattedMessCuts);

//         try {
//             const docRef = doc(db, 'users', uid); // Use the UID passed from the sidebar
//             await updateDoc(docRef, {
//                 messCuts: formattedMessCuts,
//                 messCut: updatedMessCuts.length, // Update messCut to the total number of unique dates
//             });
//             console.log('Date ranges and mess cut updated successfully!');
//         } catch (error) {
//             console.error('Error updating document:', error);
//         }
//     };

//     const formatSelectedDates = () => {
//         const groupedDates = {};

//         messCuts.forEach(date => {
//             const month = format(new Date(date), 'MMMM');
//             if (!groupedDates[month]) {
//                 groupedDates[month] = [];
//             }
//             groupedDates[month].push(date);
//         });

//         return Object.entries(groupedDates).map(([month, dates]) => {
//             const startDate = format(new Date(dates[0]), 'd');
//             const endDate = format(new Date(dates[dates.length - 1]), 'd');
//             return `${month} ${startDate} - ${endDate}`; // Format the dates for display
//         }).join(', ');
//     };

//     return (
//         <div>
//             <h1>Mess Cut</h1>
//             <div>
//                 <label>Select Start Date:</label>
//                 <DatePicker
//                     selected={startDate}
//                     onChange={(date) => setStartDate(date)}
//                     minDate={new Date()} // Set minimum date to today
//                     dateFormat="yyyy-MM-dd"
//                     placeholderText="Select start date"
//                 />
//             </div>
//             <div>
//                 <label>Select End Date:</label>
//                 <DatePicker
//                     selected={endDate}
//                     onChange={(date) => setEndDate(date)}
//                     minDate={startDate ? addDays(startDate, 1) : new Date()} // Minimum end date is the day after the selected start date
//                     dateFormat="yyyy-MM-dd"
//                     placeholderText="Select end date"
//                 />
//             </div>
//             <button onClick={selectDateRange}>Select Date Range</button>
//             <p>Total Mess Cut: {messCutCount} days</p>
//             {messCuts.length > 0 && (
//                 <div>
//                     <h3>Selected Dates:</h3>
//                     <ul>
//                         {messCuts.map(date => (
//                             <li key={date}>{format(new Date(date), 'MMMM d, yyyy')}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//             <div>
//                 <h3>Rules:</h3>
//                 <ul>
//                     <li>A minimum of 3 days is required.</li>
//                     <li>If 3 days are taken, the amount of 2 days is deducted.</li>
//                     <li>If 4 days are taken, the amount of 3 days is deducted.</li>
//                     <li>If 5 days are taken, the number of taken days will be deducted.</li>
//                 </ul>
//             </div>
//             <div>
//                 <h3>Formatted Dates:</h3>
//                 <p>{formatSelectedDates()}</p>
//             </div>
//         </div>
//     );
// };

// export default Messcut;

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from './firebase_config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Messcut = () => {
    const { uid } = useParams();
    const [messCuts, setMessCuts] = useState([]);
    const [messCutCount, setMessCutCount] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        if (uid) {
            loadDateRanges(uid);
        } else {
            console.error('No UID provided.');
        }
    }, [uid]);

    const loadDateRanges = async (uid) => {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log('Fetched user data:', data);
            const loadedDateRanges = data.messCuts || [];
            const loadedMessCutCount = data.messCut || 0; // Load messCut directly from the document

            setMessCuts(loadedDateRanges.flatMap(range => range.dates || []));
            setMessCutCount(Math.min(loadedMessCutCount, 10)); // Use loaded count, limit to 10
        } else {
            // Create a new document with default values if it doesn't exist
            await updateDoc(docRef, { messCuts: [], messCut: 0 });
            setMessCuts([]);
            setMessCutCount(0);
        }
    };

    const selectDateRange = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        const daysDifference = (endDate - startDate) / (1000 * 60 * 60 * 24) + 1; // Calculate number of days
        const calculatedMessCut = calculateMessCut(daysDifference);

        if (areDatesAlreadySelected(startDate, endDate)) {
            alert('Some of the selected dates have already been marked.');
            return;
        }

        if (messCutCount + calculatedMessCut > 10) {
            alert('Total mess cut days should not exceed 10.');
        } else {
            const newMessCuts = [];
            for (let i = 0; i < daysDifference; i++) {
                const currentDate = addDays(startDate, i);
                const formattedDate = format(currentDate, 'yyyy-MM-dd');
                newMessCuts.push(formattedDate);
            }

            setMessCuts(prev => [...prev, ...newMessCuts]);
            setMessCutCount(prev => prev + calculatedMessCut);

            console.log('Saving date ranges to Firestore:', {
                newMessCuts,
                messCutCount: messCutCount + calculatedMessCut,
            });

            await saveDateRanges(newMessCuts);

            setStartDate(null);
            setEndDate(null);
        }
    };

    const areDatesAlreadySelected = (pickedStartDate, pickedEndDate) => {
        const daysCount = (pickedEndDate - pickedStartDate) / (1000 * 60 * 60 * 24);
        for (let i = 0; i <= daysCount; i++) {
            const currentDate = addDays(pickedStartDate, i);
            const formattedDate = format(currentDate, 'yyyy-MM-dd');
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

    const saveDateRanges = async (newMessCuts) => {
        const groupedMessCuts = {};
        const updatedMessCuts = [...messCuts, ...newMessCuts];

        updatedMessCuts.forEach(date => {
            const monthYear = format(new Date(date), 'yyyy-MM');
            if (!groupedMessCuts[monthYear]) {
                groupedMessCuts[monthYear] = [];
            }
            groupedMessCuts[monthYear].push(date);
        });

        const formattedMessCuts = Object.entries(groupedMessCuts).map(([month, dates]) => ({
            month,
            dates,
        }));

        console.log('Formatted mess cuts:', formattedMessCuts);

        try {
            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                messCuts: formattedMessCuts,
                messCut: messCutCount,
            });
            console.log('Date ranges and mess cut updated successfully!');
        } catch (error) {
            console.error('Error updating document:', error);
        }
    };

    const formatSelectedDates = () => {
        const groupedDates = {};

        messCuts.forEach(date => {
            const month = format(new Date(date), 'MMMM');
            if (!groupedDates[month]) {
                groupedDates[month] = [];
            }
            groupedDates[month].push(date);
        });

        return Object.entries(groupedDates).map(([month, dates]) => {
            const startDate = format(new Date(dates[0]), 'd');
            const endDate = format(new Date(dates[dates.length - 1]), 'd');
            return `${month} ${startDate} - ${endDate}`;
        }).join(', ');
    };

    return (
        <div>
            <h1>Mess Cut</h1>
            <div>
                <label>Start Date:</label>
                <DatePicker
                    selected={startDate instanceof Date ? startDate : null}
                    onChange={date => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <div>
                <label>End Date:</label>
                <DatePicker
                    selected={endDate instanceof Date ? endDate : null}
                    onChange={date => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                />
            </div>
            <button onClick={selectDateRange}>Select Date Range</button>
            <h2>Selected Dates:</h2>
            <p>{formatSelectedDates()}</p>
            <h2>Total Mess Cut Count: {messCutCount}</h2>
        </div>
    );
};

export default Messcut;
