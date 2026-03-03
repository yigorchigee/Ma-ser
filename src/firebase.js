// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ8XowRXzXs4496CMJM0ZXeuRV6fhjyQg",
  authDomain: "tzedaka-tracker-28e2c.firebaseapp.com",
  projectId: "tzedaka-tracker-28e2c",
  storageBucket: "tzedaka-tracker-28e2c.firebasestorage.app",
  messagingSenderId: "308135580993",
  appId: "1:308135580993:web:b97d09533a37777a883dc0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
