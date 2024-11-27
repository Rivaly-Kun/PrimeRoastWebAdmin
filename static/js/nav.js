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

// Handle user authentication state
onAuthStateChanged(auth, (user) => {
    const profileImage = document.getElementById('profileImage');
    const authButton = document.getElementById('authButton');

    if (user) {
        // User is signed in
        profileImage.style.display = 'block';
        authButton.style.display = 'none';

        // Display user's profile picture or default profile image
        profileImage.src ="PrimeRoastWebAdmin/static/css/img/default_profile.jpg";
    } else {
        // No user is signed in, show sign-in button
        profileImage.style.display = 'none';
        authButton.style.display = 'block';
    }
});

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

// Listen for authentication state changes
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, get the profile picture URL
        get(child(dbref, 'users/' + user.uid + '/pfp')).then((snapshot) => {
            if (snapshot.exists()) {
                document.getElementById('profileImage').src = snapshot.val(); // Update profile image
            } else {
                // If no profile picture is set, you can use a default image or handle accordingly
                document.getElementById('profileImage').src = "https://firebasestorage.googleapis.com/v0/b/tradingo-824d6.appspot.com/o/Pfp%2Fdefault.jpg?alt=media&token=f9ff1cb9-6c5a-4987-adff-05eb9f4d5d46"; // Default PFP
            }
        }).catch((error) => {
            console.error("Error getting profile picture: ", error);
        });
    } else {
        // User is signed out, set to default picture
        document.getElementById('profileImage').src = "https://firebasestorage.googleapis.com/v0/b/tradingo-824d6.appspot.com/o/Pfp%2Fdefault.jpg?alt=media&token=f9ff1cb9-6c5a-4987-adff-05eb9f4d5d46"; // Default PFP
    }
});


  
LogoutBtn.addEventListener('click', (e) => {
    const auth = getAuth();
    signOut(auth).then(() => {
        Swal.fire({
          title: "Logged out!",
          text: "logout successful!",
          icon: "success"
        }).then((result) => {


        });
    }).catch((error) => {
        // Handle errors here, such as by displaying a notification to the user
        console.error("Error during sign out:", error);
    });
});

