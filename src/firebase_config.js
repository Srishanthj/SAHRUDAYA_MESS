import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "@firebase/firestore";
import { getAuth } from "firebase/auth"; 

const firebaseConfig = {
    apiKey: "AIzaSyCfIGkToeDbelzQKZ0-c2FYDd41OMu1rK0",
    authDomain: "sanathana-mess.firebaseapp.com",
    projectId: "sanathana-mess",
    storageBucket: "sanathana-mess.appspot.com",
    messagingSenderId: "434605842795",
    appId: "1:434605842795:web:cf4f274af2bf1f83ddec2e",
    measurementId: "G-N3073MSDJK"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app); // Initialize Auth
  
  export { db, auth };