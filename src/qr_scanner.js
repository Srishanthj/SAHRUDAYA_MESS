// src/QrScanner.js
import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner'; // Use the package you prefer

const ScannerComponent = () => {
  const [data, setData] = useState('No data');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);

  const handleScan = (result) => {
    if (result) {
      setData(result); // Set the scanned data
      stopScanning(); // Stop scanning immediately after a successful scan
    }
  };

  const handleError = (err) => {
    console.error(err);
    setError("An error occurred while scanning. Please try again."); // Set an error message
  };

  const startScanning = () => {
    setScanning(true); // Start scanning
    setData('No data'); // Reset previous scanned data
    setError(null); // Clear any previous errors
  };

  const stopScanning = () => {
    setScanning(false); // Stop scanning
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>QR Code and Barcode Scanner</h1>
      <button onClick={startScanning} style={{ marginBottom: '20px' }}>
        Start Scanning
      </button>
      {scanning && (
        <div style={{ position: 'relative' }}>
          <QrScanner
            delay={300}
            onError={handleError}
            onScan={handleScan} // Call handleScan directly
            style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }} // Set max width for the scanner
          />
          <button onClick={stopScanning} style={{ position: 'absolute', top: '10px', right: '10px' }}>
            Stop Scanning
          </button>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
      <h2>Scanned Data:</h2>
      <p>{data}</p> {/* Display scanned data */}
    </div>
  );
};

export default ScannerComponent;
