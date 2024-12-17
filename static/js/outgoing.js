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
    const dbRef = ref(database, "outgoing");
    const snapshot = await get(dbRef);
    const tableBody = document.getElementById("outgoingDiv");

    if (!snapshot.exists()) {
        tableBody.innerHTML = `<tr><td colspan="5">No outgoing orders found.</td></tr>`;
        return;
    }

    const orders = snapshot.val();

    for (const uid of Object.keys(orders)) {
        const username = await fetchUsername(uid);
        const indexedOrderData = orders[uid];
        const orderKey = Object.keys(indexedOrderData)[0];
        const orderData = indexedOrderData[orderKey];

        const { Status, contactNumber, orderTime, orderItems } = orderData;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${username}</td>
            <td>${Status || "N/A"}</td>
            <td>${contactNumber || "N/A"}</td>
            <td>${orderTime || "N/A"}</td>
            <td>
                <button class="toggle-btn">Show Orders</button>
                <div class="order-modal" style="display: none;">
                    <ul>
                        ${Object.values(orderItems).map(item => `
                            <li>
                                <img src="${item.productImage}" alt="${item.productName}" />
                              ${item.variant} - Qty: ${item.quantity} ₱ ${item.price}
                            </li>
                        `).join("")}
                    </ul>
                </div>
            </td>
        `;

        // Append row to table
        tableBody.appendChild(row);

        // Toggle functionality
        const toggleBtn = row.querySelector(".toggle-btn");
        const modal = row.querySelector(".order-modal");

        toggleBtn.addEventListener("click", () => {
            const isVisible = modal.style.display === "block";
            modal.style.display = isVisible ? "none" : "block";
            toggleBtn.textContent = isVisible ? "Show Orders" : "Hide Orders";

            // Double-tap setup (only initialize if modal is visible)
            if (!isVisible) {
                setupDoubleTapToOpenCenterModal(modal);
            }
        });
    }
}

// Function to handle double-tap on the modal
function setupDoubleTapToOpenCenterModal(orderModal) {
    let lastTap = 0;

    // Centered modal creation
    const centerModal = document.createElement("div");
    centerModal.classList.add("order-modal-center-div");
    centerModal.innerHTML = `
        <div class="order-modal-content">
            <h3>Order Details</h3>
            ${orderModal.innerHTML}
        </div>
    `;
    centerModal.style.display = "none";
    document.body.appendChild(centerModal);

    // Double-tap event listener
    orderModal.addEventListener("click", () => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;

        if (tapLength < 300 && tapLength > 0) { // Double-tap within 300ms
            centerModal.style.display = "flex";
        }
        lastTap = currentTime;
    });

    // Close centered modal on outside click
    centerModal.addEventListener("click", (event) => {
        if (event.target === centerModal) {
            centerModal.style.display = "none";
        }
    });
}



async function fetchUsername(uid) {
    const userRef = ref(database, `users/${uid}/name`);
    const userSnapshot = await get(userRef);
    return userSnapshot.exists() ? userSnapshot.val() : "Unknown User";
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
