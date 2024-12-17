import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,  signInWithEmailAndPassword, signOut, sendSignInLinkToEmail,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getDatabase, set, ref,get,child, update} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD29zvJ5gOvHRgk1qUWFzZJL8foY1sf8bk",
    authDomain: "primeroastweb.firebaseapp.com",
    databaseURL: "https://primeroastweb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "primeroastweb",
    storageBucket: "primeroastweb.appspot.com",
    messagingSenderId: "157736544071",
    appId: "1:157736544071:web:2713ba60d8edddc5344e62",
    measurementId: "G-MGMCTZCX2G"
};

// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();
const realdb = getDatabase();
const dbref = ref(realdb);



// Event listener for sign-in/sign-up button
document.getElementById('authButton').addEventListener('click', function() {
    const popup = document.getElementById('popup');
    popup.style.display = 'block'; // Show the login/sign-up pop-up
});

// Event listener for closing the pop-up
document.getElementById('closePopup').addEventListener('click', function() {
    const popup = document.getElementById('popup');
    popup.style.display = 'none'; // Hide the login/sign-up pop-up
});

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Sign-in successful
            const user = userCredential.user;
            console.log("User logged in: ", user);
            document.getElementById('popup').style.display = 'none'; // Close the pop-up
        })
        .catch((error) => {
            console.error("Login error: ", error.message);
        });
});

// Handle sign-up form submission
document.getElementById('signupForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Check if email is in valid format using a regular expression
    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Check if password is not empty
    if (password.length === 0) {
        alert('Please enter a password.');
        return;
    }

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Sign-up successful
            const user = userCredential.user;

            // Set default profile picture in the database
            const defaultPfp = "https://firebasestorage.googleapis.com/v0/b/tradingo-824d6.appspot.com/o/Pfp%2Fdefault.jpg?alt=media&token=f9ff1cb9-6c5a-4987-adff-05eb9f4d5d46";
            set(ref(realdb, 'users/' + user.uid + '/pfp'), defaultPfp)
                .then(() => {
                    console.log("Default profile picture set for user:", user.uid);
                    document.getElementById('popup').style.display = 'none'; // Close the pop-up
                })
                .catch((error) => {
                    console.error("Error setting default profile picture: ", error);
                });
        })
        .catch((error) => {
            console.error("Sign-up error: ", error.message);
            alert(error.message);  // Alert user about the specific error
        });
});

// Email validation function
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}



LogoutBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('/logout', { method: 'POST' });
        if (response.ok) {
            Swal.fire({
                title: "Logged out!",
                text: "Logout successful!",
                icon: "success"
            }).then(() => {
                window.location.href = "/   "; // Redirect to the Flask admin login route
            });
        } else {
            throw new Error("Failed to log out");
        }
    } catch (error) {
        console.error("Error during logout:", error);
        alert("An error occurred while logging out.");
    }
});

