import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, push, set, onValue, get, child } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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
const db = getDatabase(app);

const supportImageURL = 'static/css/img/support.svg';  // Update with actual URL or SVG for support icon

const supportModal = document.getElementById("SupportModal");
const supportBtn = document.getElementById("SupportBtn");
const closeSupportModal = document.getElementById("closesuportmodal");
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("messageContainer");
const sendMessageButton = document.getElementById("sendMessage");

// Open the message modal
supportBtn.addEventListener('click', () => {
    supportModal.style.display = "block";
});

// Close message modal
closeSupportModal.addEventListener('click', () => {
    supportModal.style.display = "none";
});

// Close the modal if the user clicks outside the modal content
window.addEventListener("click", (event) => {
    if (event.target === supportModal) {
        supportModal.style.display = "none";
    }
});

const userList = document.getElementById("userList");
let currentSelectedUserId = null;

async function populateUserList() {
    const messagesRef = ref(db, "Messages");
    onValue(messagesRef, async (snapshot) => {
        const users = snapshot.val() || {};
        userList.innerHTML = ""; // Clear user list

        for (const userId of Object.keys(users)) {
            // Fetch user name from the "users/{uid}/name" path
            const userNameRef = ref(db, `users/${userId}/name`);
            const userNameSnapshot = await get(userNameRef);
            const userName = userNameSnapshot.exists() ? userNameSnapshot.val() : "Unknown User";

            // Fetch user profile picture from the "users/{uid}/pfp" path
            const userPfpRef = ref(db, `users/${userId}/pfp`);
            const userPfpSnapshot = await get(userPfpRef);
            const userPfp = userPfpSnapshot.exists()
                ? userPfpSnapshot.val()
                : "static/css/img/default-pfp.svg"; // Default PFP if not found

            // Create user list item
            const userListItem = document.createElement("li");
            userListItem.dataset.userId = userId;

            // Create image element for the profile picture
            const userImg = document.createElement("img");
            userImg.src = userPfp;
            userImg.alt = `${userName}'s profile picture`;
            userImg.classList.add("user-profile-image"); // Add CSS class for styling

            // Create span element for the user name
            const userNameSpan = document.createElement("span");
            userNameSpan.textContent = userName;

            // Append elements to the list item
            userListItem.appendChild(userImg);
            userListItem.appendChild(userNameSpan);

            // Add click event to select user
            userListItem.addEventListener("click", () => {
                selectUser(userId);
                document
                    .querySelectorAll(".user-sidebar li")
                    .forEach((item) => item.classList.remove("active"));
                userListItem.classList.add("active");
            });

            userList.appendChild(userListItem);
        }
    });
}


// Handle selecting a user
async function selectUser(userId) {
    currentSelectedUserId = userId;

    // Fetch the user name from the database
    const userNameRef = ref(db, `users/${userId}/name`);
    const userNameSnapshot = await get(userNameRef);
    const userName = userNameSnapshot.exists() ? userNameSnapshot.val() : "Unknown User";

    document.getElementById("selectedUserName").textContent = `Chatting with: ${userName}`;
    loadMessagesForUser(userId); // Load their messages
}

// Load messages for the selected user
// Load messages for the selected user
function loadMessagesForUser(userId) {
    const userMessagesRef = ref(db, `Messages/${userId}`);
    onValue(userMessagesRef, (snapshot) => {
        const messages = snapshot.val() || {};
        messageContainer.innerHTML = "";

        // Sort keys based on the numerical part of the message ID
        const sortedKeys = Object.keys(messages).sort((a, b) => {
            const numA = parseInt(a.split("-")[1], 10);
            const numB = parseInt(b.split("-")[1], 10);
            return numA - numB;
        });

        sortedKeys.forEach((key) => {
            const messageData = messages[key];
            const messageDiv = document.createElement("div");

            if (messageData.sender === "support") {
                messageDiv.classList.add("message", "support-message");
            } else {
                messageDiv.classList.add("message", "user-message");
            }

            const img = document.createElement("img");
            img.classList.add("profile-image");
            img.src = messageData.sender === "support" ? supportImageURL : messageData.profileImage;

            const textDiv = document.createElement("div");
            textDiv.classList.add("message-text");
            textDiv.textContent = messageData.text;

            messageDiv.appendChild(img);
            messageDiv.appendChild(textDiv);
            messageContainer.appendChild(messageDiv);
        });

        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
}


// Send a message to the currently selected user
sendMessageButton.addEventListener("click", () => {
    const message = messageInput.value.trim();

    if (!currentSelectedUserId) {
        alert("Please select a user to reply to.");
        return;
    }

    if (message === "") {
        alert("Message cannot be empty.");
        return;
    }

    const userMessagesRef = ref(db, `Messages/${currentSelectedUserId}`);
    get(userMessagesRef).then((snapshot) => {
        const messages = snapshot.val() || {};
        const nextIndex = Object.keys(messages).length + 1;

        set(ref(db, `Messages/${currentSelectedUserId}/msg-${nextIndex}`), {
            text: message,
            timestamp: Date.now(),
            sender: "support",
            profileImage: supportImageURL,
        }).then(() => {
            messageInput.value = ""; // Clear the input field
            userList.innerHTML = ""; // Clear user list
        });
    });
});

// Populate user list when the modal is opened
supportBtn.addEventListener("click", () => {
    supportModal.style.display = "block";
    populateUserList();
});
