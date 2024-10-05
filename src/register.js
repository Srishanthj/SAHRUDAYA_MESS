import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase_config';
import { QRCodeCanvas } from 'qrcode.react'; // Use QRCodeCanvas
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const Register = () => {
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [qrCodeValue, setQrCodeValue] = useState('');
  const navigate = useNavigate();
  const qrCodeRef = useRef(); // Ref for the QR code canvas
  const storage = getStorage(); // Get storage instance

  useEffect(() => {
    // Set the QR code value to the user's email
    setQrCodeValue(newEmail);
  }, [newEmail]);

  const registerUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      const user = userCredential.user;

      // Convert QR code to a data URL and upload to Firebase Storage
      const qrCodeCanvas = qrCodeRef.current; // Access the QR code canvas
      const qrCodeDataUrl = qrCodeCanvas.toDataURL(); // Get data URL from canvas

      // Create a storage reference
      const qrCodeStorageRef = ref(storage, `qrCodes/${user.uid}.png`);

      // Upload the QR code image as a string
      await uploadString(qrCodeStorageRef, qrCodeDataUrl, 'data_url');

      // Get the download URL
      const downloadURL = await getDownloadURL(qrCodeStorageRef);

      // Create a document with the user's UID and QR code download URL
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: newName,
        email: newEmail,
        qrCode: downloadURL, // Store the download URL of the QR code
      });

      // Clear form fields after successful registration
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      alert('User registered successfully!');
      navigate('/login'); // Redirect to login page after successful registration
    } catch (error) {
      setErrorMessage(error.message); // Display error message
    }
  };

  return (
    <div>
      <h1>Register User</h1>
      <input
        placeholder="Name..."
        value={newName}
        onChange={(event) => setNewName(event.target.value)}
      />
      <input
        placeholder="Email..."
        value={newEmail}
        onChange={(event) => setNewEmail(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password..."
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
      />
      <button onClick={registerUser}>Register</button>
      {errorMessage && <p>{errorMessage}</p>}
      <QRCodeCanvas ref={qrCodeRef} value={qrCodeValue} style={{ display: 'none' }} /> {/* QR code canvas hidden */}
    </div>
  );
};

export default Register;
