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


// Firebase logic for sending orders to outgoing (remains unchanged)
window.sendToOutgoing = function (userId, orderIndex) {
  // Use SweetAlert to confirm the action
  Swal.fire({
      title: "Are you sure?",
      text: "This order will be moved to orders to be delivering.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, move it!",
      cancelButtonText: "Cancel"
  }).then((result) => {
      if (result.isConfirmed) {
          const orderRef = ref(database, `orders/${userId}/${orderIndex}`);
          const outgoingRef = ref(database, `outgoing/${userId}/${orderIndex}`);

          get(orderRef)
              .then(snapshot => {
                  if (!snapshot.exists()) throw new Error("Order does not exist.");
                  const orderData = snapshot.val();
                  return set(outgoingRef, orderData).then(() => remove(orderRef));
              })
              .then(() => {
                  console.log(`Order moved to outgoing: ${userId}/${orderIndex}`);
                  const button = document.querySelector(`[data-user-id="${userId}"][data-order-index="${orderIndex}"]`);
                  button.closest('tr').remove();

                  // Show success alert
                  Swal.fire({
                      title: "Moved!",
                      text: "The order has been successfully moved to outgoing.",
                      icon: "success",
                      timer: 2000,
                      showConfirmButton: false
                  });
              })
              .catch(error => {
                  console.error('Error moving order:', error);

                  // Show error alert
                  Swal.fire({
                      title: "Error!",
                      text: "Failed to move the order. Please try again.",
                      icon: "error"
                  });
              });
      }
  });
};











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

// Automatically opens a center modal when toggleOrders is called
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded and parsed.");

  // Attach toggleOrders functionality
  window.toggleOrders = function (modalId) {
    const orderModal = document.getElementById(modalId);
    if (orderModal) {
      console.log(`Toggling and opening center modal for: ${modalId}`);
      openCenterModal(orderModal); // Automatically opens the center modal
    } else {
      console.error(`Modal with ID ${modalId} not found.`);
    }
  };

  // Delegate double-click events to a parent container
  document.body.addEventListener("dblclick", (event) => {
    const orderModal = event.target.closest(".orders-modal");
    if (orderModal) {
      console.log(`Opening modal for: ${orderModal.id}`);
      openCenterModal(orderModal);
    }
  });
});

// Function to create and display the center modal
function openCenterModal(orderModal) {
  console.log("Opening centered modal for:", orderModal.id);

  // Check if a modal already exists for this order
  let centerModal = document.getElementById(`center-modal-${orderModal.id}`);

  if (!centerModal) {
    // Create the center modal container
    centerModal = document.createElement("div");
    centerModal.id = `center-modal-${orderModal.id}`;
    centerModal.classList.add("order-modal-center-div");
    centerModal.innerHTML = `
      <div class="order-modal-content">
        <h3>Order Details</h3>
        ${orderModal.innerHTML}
      </div>
    `;

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
  } else {
    console.log("Reusing existing modal for:", orderModal.id);
  }

  // Make the modal visible
  centerModal.style.display = "flex";
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
