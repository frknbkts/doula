// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX9-jlSA6MB5IW-Z9sRXftTKTJa_m-Boo",
  authDomain: "doula-439c6.firebaseapp.com",
  projectId: "doula-439c6",
  storageBucket: "doula-439c6.appspot.com",
  messagingSenderId: "559050229369",
  appId: "1:559050229369:web:6f3b00bf000d5d4c1576a8"
};


let app = initializeApp(firebaseConfig);


const auth = getAuth()

export { auth };
