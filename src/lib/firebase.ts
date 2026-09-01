import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCUxhbtN0L5_Eymcxx894P7Ux0fDjrv26w",
  authDomain: "nesa-3a5c8.firebaseapp.com",
  databaseURL: "https://nesa-3a5c8-default-rtdb.firebaseio.com",
  projectId: "nesa-3a5c8",
  storageBucket: "nesa-3a5c8.firebasestorage.app",
  messagingSenderId: "498544219795",
  appId: "1:498544219795:web:cdb4d10a0be2f1bc929f66",
  measurementId: "G-BVCJP11PJH"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
