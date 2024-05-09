// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCz5YNwFKg3mIQas3GXKllpf0Bv7JMvp6o",
    authDomain: "bitirmebkts.firebaseapp.com",
    projectId: "bitirmebkts",
    storageBucket: "bitirmebkts.appspot.com",
    messagingSenderId: "1068614634765",
    appId: "1:1068614634765:web:4f2dc467a863dec441f444"
};


let app = initializeApp(firebaseConfig);


const auth = getAuth()

export { auth };
