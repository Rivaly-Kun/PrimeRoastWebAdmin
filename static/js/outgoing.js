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
// Automatically opens a center modal when toggleOrders is called
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
          <td>${contactNumber || "N/A"}</td>
          <td>${orderTime || "N/A"}</td>
          <td>
              <button class="toggle-btn">Show Orders</button>
          </td>
      `;
  
      // Append row to table
      tableBody.appendChild(row);
  
      // Toggle functionality
      const toggleBtn = row.querySelector(".toggle-btn");
  
      toggleBtn.addEventListener("click", () => {
        openCenterModal(orderItems);
      });
    }
  }
  
  // Function to create and display the center modal
  function openCenterModal(orderItems) {
    // Create the content for the modal
    const contentHtml = `
      <div class="order-modal-content">
        <h3>Order Details</h3>
        <ul>
          ${Object.values(orderItems).map(item => `
            <li>
              <img src="${item.productImage}" alt="${item.productName}" />
              ${item.variant} - Qty: ${item.quantity} ₱ ${item.price}
            </li>
          `).join("")}
        </ul>
      </div>
    `;
  
    // Check if the center modal already exists
    let centerModal = document.getElementById("center-modal");
  
    if (!centerModal) {
      // Create the center modal container
      centerModal = document.createElement("div");
      centerModal.id = "center-modal";
      centerModal.classList.add("order-modal-center-div");
  
      // Add basic styles for centering the modal
      Object.assign(centerModal.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "1000",
      });
  
      document.body.appendChild(centerModal);
  
      // Add click event listener for closing
      centerModal.addEventListener("click", (event) => {
        if (event.target === centerModal) {
          console.log("Outside modal content clicked. Closing modal.");
          centerModal.style.display = "none";
        }
      });
    }
  
    // Update the content and display the modal
    centerModal.innerHTML = contentHtml;
    centerModal.style.display = "flex";
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
