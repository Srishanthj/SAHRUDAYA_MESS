// src/authFunctions.js
import { auth } from './firebase_config'; // Ensure this path is correct
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Initialize Firebase storage and Firestore
const storage = getStorage();
const db = getFirestore();

// Function to log in a user
export const login = async (email, password) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.message); // Propagate error
  }
};

// Function to sign up a new user
export const signup = async (email, password) => {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(error.message); // Propagate error
  }
};

// Function to log out the user
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message); // Propagate error
  }
};

// Function to upload profile picture
export const uploadDP = async (name, uri) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `profile_pictures/${name}`);
  await uploadBytes(storageRef, blob);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL; // Return the URL of the uploaded image
};

// Function to save QR code data to Firestore
export const saveQRCode = async (name, qrData) => {
  const docRef = doc(db, 'qr_codes', name); // Ensure 'qr_codes' is your collection name
  await setDoc(docRef, { data: qrData });
  return `QR Code saved for ${name}`; // Return a success message
};
