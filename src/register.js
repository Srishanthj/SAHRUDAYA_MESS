import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import './RegisterPage.css';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, getDoc } from 'firebase/firestore';
import { db, auth } from './firebase_config';
import { uploadDP } from './authFunctions';
import { QRCodeCanvas } from 'qrcode.react'; 
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';

const RegisterPage = () => {
  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();
  const [selectedDp, setSelectedDp] = useState(null);
  const [selectedRole, setSelectedRole] = useState('Inmate');
  const [newEmail, setNewEmail] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isReEnterPasswordVisible, setIsReEnterPasswordVisible] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const qrCodeRef = useRef();
  const storage = getStorage();

  useEffect(() => {
    // Set the QR code value to a compact string representation
    if (newEmail) {
      const userInfo = {
        email: newEmail,
        messNo: getValues("messNo"),
        role: selectedRole,
        name: getValues("name")
      };
      setQrCodeValue(JSON.stringify(userInfo)); // JSON format for easier parsing
    }
  }, [newEmail, selectedRole]);

  const onSubmit = async (data) => {
    if (selectedDp) {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        const user = userCredential.user;

        const dpUrl = await uploadDP(data.name, selectedDp);

        const qrCodeCanvas = qrCodeRef.current;
        if (!qrCodeCanvas) {
          throw new Error("QR code canvas not found");
        }
        
        const qrCodeDataUrl = qrCodeCanvas.toDataURL();
        const qrCodeStorageRef = ref(storage, `qrCodes/${user.uid}.png`);
        await uploadString(qrCodeStorageRef, qrCodeDataUrl, 'data_url');
        const downloadURL = await getDownloadURL(qrCodeStorageRef);

        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: data.name,
          email: data.email,
          phone: data.mobNo,
          department: data.department,
          messNo: data.messNo,
          role: selectedRole,
          dpUrl: dpUrl,
          qrCode: downloadURL,
        });

        // Fetch the user details to set QR code value
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userDetails = userDoc.data();
          setQrCodeValue(JSON.stringify(userDetails)); // Update QR code value with user details
        }

        // Display the relevant information in the success toast
        toast.success(`Registration Successful! 
          Name: ${data.name}, 
          Mess No: ${data.messNo}, 
          Department: ${data.department}, 
          Role: ${selectedRole}`);

        reset(); // Reset form fields
      } catch (error) {
        console.error('Error during registration:', error);
        toast.error('Registration Failed: ' + (error.message || 'An unknown error occurred'));
      }
    } else {
      toast.error('Please upload a profile picture');
    }
  };

  const selectProfilePicture = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedDp(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="register-page">
      <h2>Register</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="avatar-container">
          <img
            src={selectedDp || 'default-avatar.png'}
            alt="Profile"
            className="avatar"
          />
          <input type="file" accept="image/*" onChange={selectProfilePicture} className="file-input" />
        </div>

        <input
          {...register("name", { required: "Please enter your name", pattern: /^[a-zA-Z\s]+$/ })}
          placeholder="Name"
          className="input-field"
        />
        {errors.name && <span className="error">{errors.name.message}</span>}

        <input
          {...register("email", {
            required: "Please enter your email",
            pattern: {
              value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
              message: "Invalid email address"
            }
          })}
          type="email"
          placeholder="Email"
          className="input-field"
          onChange={(e) => setNewEmail(e.target.value)}
        />
        {errors.email && <span className="error">{errors.email.message}</span>}

        <div className="password-container">
          <input
            {...register("password", { required: "Please enter your password", minLength: { value: 8, message: "Password must be at least 8 characters" } })}
            type={isPasswordVisible ? 'text' : 'password'}
            placeholder="Password"
            className="input-field"
          />
          <button type="button" className="toggle-password" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
            {isPasswordVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password.message}</span>}

        <div className="password-container">
          <input
            {...register("rePassword", { validate: value => value === getValues("password") || "Passwords do not match" })}
            type={isReEnterPasswordVisible ? 'text' : 'password'}
            placeholder="Re-enter Password"
            className="input-field"
          />
          <button type="button" className="toggle-password" onClick={() => setIsReEnterPasswordVisible(!isReEnterPasswordVisible)}>
            {isReEnterPasswordVisible ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.rePassword && <span className="error">{errors.rePassword.message}</span>}

        <input
          {...register("department", { required: "Please enter your department" })}
          placeholder="Department"
          className="input-field"
        />
        {errors.department && <span className="error">{errors.department.message}</span>}

        <input
          {...register("mobNo", {
            required: "Please enter your mobile number",
            minLength: { value: 10, message: "Mobile number must be 10 digits" },
            maxLength: { value: 10, message: "Mobile number must be 10 digits" },
            pattern: { value: /^[0-9]+$/, message: "Mobile number must be numeric" }
          })}
          placeholder="Mob No"
          className="input-field"
        />
        {errors.mobNo && <span className="error">{errors.mobNo.message}</span>}

        <input
          {...register("messNo", { required: "Please enter your mess number", pattern: /^[0-9]+$/ })}
          placeholder="Mess No"
          className="input-field"
        />
        {errors.messNo && <span className="error">{errors.messNo.message}</span>}

        <select {...register("role")} value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="input-field">
          <option value="Inmate">Inmate</option>
          <option value="Outmess">Outmess</option>
          <option value="Guest">Guest</option>
        </select>

        <QRCodeCanvas ref={qrCodeRef} value={qrCodeValue} style={{ display: 'none' }} />

        <button type="submit" className="submit-button">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
