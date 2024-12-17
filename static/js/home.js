import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, ref, get, set, remove, onValue } 
    from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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
const database = getDatabase(app);

// Function to update table counts
function updateCounts() {
    updateCount('transactions', '.TotalUsers', 'Completed Deliveries');
    updateCount('outgoing', '.TotalOutgoing', 'Pending Deliveries');
    updateCount('orders', '.Total-Orders', 'Total Orders');
}

function updateCount(path, elementClass, label) {
    const element = document.querySelector(elementClass);

    if (!element) {
        console.error(`Element with class '${elementClass}' not found.`);
        return;
    }

    get(ref(database, path)).then(snapshot => {
        const data = snapshot.val();
        const totalCount = data ? Object.keys(data).length : 0;
        element.textContent = `${label}: ${totalCount}`;
    }).catch(error => console.error(`Error fetching ${label}:`, error));
}

// Move orders to outgoing
window.toggleOrders = function (modalId, buttonId) {
  const modal = document.getElementById(modalId);
  const button = document.getElementById(buttonId);

  if (modal.style.display === "none" || modal.style.display === "") {
      modal.style.display = "block";
      button.textContent = "Hide Orders";
  } else {
      modal.style.display = "none";
      button.textContent = "Show Orders";
  }
};

// Firebase logic for sending orders to outgoing (remains unchanged)
window.sendToOutgoing = function (userId, orderIndex) {
  const orderRef = ref(database, `orders/${userId}/${orderIndex}`);
  const outgoingRef = ref(database, `outgoing/${userId}/${orderIndex}`);

  get(orderRef).then(snapshot => {
      if (!snapshot.exists()) throw new Error("Order does not exist.");

      const orderData = snapshot.val();
      return set(outgoingRef, orderData).then(() => remove(orderRef));
  }).then(() => {
      console.log(`Order moved to outgoing: ${userId}/${orderIndex}`);
      const button = document.querySelector(`[data-user-id="${userId}"][data-order-index="${orderIndex}"]`);
      button.closest('tr').remove();
  }).catch(error => console.error('Error moving order:', error));
};














document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  const orderModals = document.querySelectorAll(".orders-modal");

  // Log to confirm modals are detected
  if (!orderModals.length) {
    console.error("No '.orders-modal' elements found.");
    return;
  }
  console.log(`Found ${orderModals.length} '.orders-modal' elements.`);

  // Loop through each modal and add a click listener
  orderModals.forEach((orderModal) => {
    console.log(`Initializing click event for modal: ${orderModal.id}`);

    // Add click event listener
    orderModal.addEventListener("click", () => {
      console.log(`Modal clicked: ${orderModal.id}`);
      openCenterModal(orderModal);
    });
  });
});

// Function to create and display the center modal
function openCenterModal(orderModal) {
  console.log("Opening centered modal for:", orderModal.id);

  // Create the center modal container
  const centerModal = document.createElement("div");
  centerModal.classList.add("order-modal-center-div");
  centerModal.innerHTML = `
        <div class="order-modal-content">
            <h3>Order Details</h3>
            ${orderModal.innerHTML}
        </div>
    `;

  // Add basic styles for centering the modal
  centerModal.style.position = "fixed";
  centerModal.style.top = "0";
  centerModal.style.left = "0";
  centerModal.style.width = "100%";
  centerModal.style.height = "100%";
  centerModal.style.background = "rgba(0, 0, 0, 0.7)";
  centerModal.style.display = "flex";
  centerModal.style.alignItems = "center";
  centerModal.style.justifyContent = "center";
  centerModal.style.zIndex = "1000";

  document.body.appendChild(centerModal);
  console.log("Centered modal created and displayed.");

  // Close modal when clicking outside content
  centerModal.addEventListener("click", (event) => {
    if (event.target === centerModal) {
      console.log("Outside modal content clicked. Closing modal.");
      centerModal.style.display = "none";
      centerModal.remove();
    }
  });
}











// Refresh table when Firebase changes
function refreshOrders() {
    fetch('/').then(response => response.text()).then(html => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const newTableBody = tempDiv.querySelector('.order-table tbody');
        if (newTableBody) {
            document.querySelector('.order-table tbody').innerHTML = newTableBody.innerHTML;
            console.log("Orders table updated.");
        }
    }).catch(error => console.error('Error refreshing orders:', error));
}

onValue(ref(database, "orders"), () => {
    console.log("Orders updated, refreshing...");
    refreshOrders();
});



// Initialize counts
updateCounts();
