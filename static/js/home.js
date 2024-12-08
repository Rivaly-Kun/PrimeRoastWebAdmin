import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword,  signInWithEmailAndPassword, signOut, sendSignInLinkToEmail,onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getDatabase, set, ref,get,child, update,remove} from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";



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


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase();

document.querySelectorAll('.outgoing-btn').forEach(button => {
    button.addEventListener('click', () => {
        const userId = button.getAttribute('data-user-id');
        const orderIndex = button.getAttribute('data-order-index');
        sendToOutgoing(userId, orderIndex);
    });
});

window.sendToOutgoing = function (userId, orderIndex) {
    const orderRef = ref(database, `orders/${userId}/${orderIndex}`);
    const outgoingRef = ref(database, `outgoing/${userId}/${orderIndex}`);

    get(orderRef)
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error(`Order does not exist at path: orders/${userId}/${orderIndex}`);
            }
            const orderData = snapshot.val();
          
            return set(outgoingRef, orderData)
                .then(() => remove(orderRef));
        })
        .then(() => {
            console.log(`Order moved to outgoing/${userId}/${orderIndex} and deleted.`);
         
            const row = document.querySelector(`button[data-user-id="${userId}"][data-order-index="${orderIndex}"]`).closest('tr');
            if (row) {
                row.remove();
            }
        })
        .catch(error => {
            console.error('Error during data transfer:', error);
        });
};

