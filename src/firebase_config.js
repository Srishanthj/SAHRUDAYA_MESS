// firebase_config.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import { getAuth } from "firebase/auth"; // Authentication import
import { getFirestore } from "firebase/firestore"; // Firestore import
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage"; // Storage import

const firebaseConfig = {
  apiKey: "AIzaSyCfIGkToeDbelzQKZ0-c2FYDd41OMu1rK0",
  authDomain: "sanathana-mess.firebaseapp.com",
  projectId: "sanathana-mess",
  storageBucket: "sanathana-mess.appspot.com",
  messagingSenderId: "434605842795",
  appId: "1:434605842795:web:cf4f274af2bf1f83ddec2e",
  measurementId: "G-N3073MSDJK"
};
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Initialize Auth
const storage = getStorage(app); // Initialize Storage

// Function to upload a profile picture
export const uploadProfilePicture = async (name, file) => {
    const storageRef = ref(storage, `profilePictures/${name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url; // Returns the download URL of the uploaded file
};

// Export the required components
export { auth, db, storage };

