import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Function to fetch and display all outgoing orders
async function fetchOutgoingOrders() {
    try {
        const dbRef = ref(database, "outgoing"); // Path to 'outgoing' node in Firebase
        const snapshot = await get(dbRef);

        // Log fetched data for debugging
        console.log("Firebase snapshot data:", snapshot.val());

        // Check if data exists
        if (!snapshot.exists()) {
            console.warn("No orders found!");
            updateTableWithMessage("No outgoing orders found.");
            return;
        }

        const orders = snapshot.val();
        const tableBody = document.getElementById("outgoingDiv");

        // Ensure the table body exists before modifying
        if (!tableBody) {
            console.error("Table element with id 'outgoingDiv' not found.");
            return;
        }

        // Clear existing rows in the table
        tableBody.innerHTML = "";

        // Helper function to fetch username by UID
        async function fetchUsername(uid) {
            try {
                const userRef = ref(database, `users/${uid}/name`);
                const userSnapshot = await get(userRef);
                return userSnapshot.exists() ? userSnapshot.val() : "Unknown User";
            } catch (error) {
                console.error(`Failed to fetch username for UID: ${uid}`, error);
                return "Unknown User";
            }
        }

        // Iterate over all orders and populate the table
        for (const uid of Object.keys(orders)) {
            const username = await fetchUsername(uid); // Fetch the username for the current UID
            const indexedOrderData = orders[uid];
            const orderKey = Object.keys(indexedOrderData)[0]; // Get the index key (e.g., '3')
            const orderData = indexedOrderData[orderKey]; // Access the nested order data

            // Log the extracted order data
            console.log(orderData);

            const status = orderData.Status || "N/A";
            const contactNumber = orderData.contactNumber || "N/A";
            const orderTime = orderData.orderTime || "N/A";
            const orderItems = orderData.orderItems || {};

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${username}</td>
                <td>${status}</td>
                <td>${contactNumber}</td>
                <td>${orderTime}</td>
                <td>
                    <ul style="list-style: none; padding: 0;">
                        ${Object.values(orderItems)
                            .map(
                                (item) => `
                                    <li style="margin-bottom: 10px; display: flex; align-items: center;">
                                        <img src="${item.productImage}" alt="${item.productName}" style="width: 50px; height: 50px; margin-right: 10px;">
                                        <span>${item.productName} (${item.variant})</span>
                                        - Qty: ${item.quantity} @ ${item.price}
                                    </li>
                                `
                            )
                            .join("")}
                    </ul>
                </td>
                
            `;
            tableBody.appendChild(row);
        }
    } catch (error) {
        console.error("Failed to fetch outgoing orders:", error);
        updateTableWithMessage("Failed to fetch outgoing orders. Please try again later.");
    }
}


// Function to update the table with a message
function updateTableWithMessage(message) {
    const tableBody = document.getElementById("outgoingDiv");
    if (!tableBody) {
        console.error("Table element with id 'AnnouncementsDiv' not found.");
        return;
    }
    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="no-orders-message">${message}</td>
        </tr>
    `;
}

// Function to handle marking an order as shipped
function processOutgoingOrder(orderId) {
    console.log(`Order ${orderId} marked as shipped!`);
    alert(`Order ${orderId} marked as shipped!`);
}

// Fetch all outgoing orders on page load
fetchOutgoingOrders();
