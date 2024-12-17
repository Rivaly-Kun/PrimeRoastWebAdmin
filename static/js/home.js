import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js"; // Import set and remove

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

// Function to update total users
function updateTotalUsers() {
  const totalUsersElement = document.querySelector('.TotalUsers');

  if (!totalUsersElement) {
    console.error("Element with class 'TotalUsers' not found.");
    return;
  }

  get(ref(database, 'users/')).then((snapshot) => {
    const usersData = snapshot.val();
    const totalUsers = usersData ? Object.keys(usersData).length : 0;

    totalUsersElement.textContent = "Total Users: " + totalUsers;
  }).catch((error) => {
    console.error("Error fetching total users:", error);
  });
}

// Function to update total orders
function updateTotalOrders() {
  const totalOrdersElement = document.querySelector('.Total-Orders');

  if (!totalOrdersElement) {
    console.error("Element with class 'Total-Orders' not found.");
    return;
  }

  get(ref(database, 'orders/')).then((snapshot) => {
    const ordersData = snapshot.val();
    const totalOrders = ordersData ? Object.keys(ordersData).length : 0;

    totalOrdersElement.textContent = "Total Orders: " + totalOrders;
  }).catch((error) => {
    console.error("Error fetching total orders:", error);
  });
}

// Call the functions
updateTotalUsers();
updateTotalOrders();

// Function to send order to outgoing
window.sendToOutgoing = function (userId, orderIndex) {
  console.log(`Moving order: userId=${userId}, orderIndex=${orderIndex}`);

  const orderRef = ref(database, `orders/${userId}/${orderIndex}`);
  const outgoingRef = ref(database, `outgoing/${userId}/${orderIndex}`);

  get(orderRef)
    .then(snapshot => {
      if (!snapshot.exists()) {
        throw new Error(`Order does not exist at path: orders/${userId}/${orderIndex}`);
      }

      const orderData = snapshot.val();

      // Move order to outgoing and remove from orders
      return set(outgoingRef, orderData).then(() => remove(orderRef));
    })
    .then(() => {
      console.log(`Order successfully moved to outgoing/${userId}/${orderIndex}`);

      // Remove the table row for the order
      const button = document.querySelector(`button[data-user-id="${userId}"][data-order-index="${orderIndex}"]`);
      const row = button.closest('tr');
      if (row) {
        row.remove();
      }
    })
    .catch(error => {
      console.error('Error moving order:', error);
    });
};

// Event delegation to handle dynamically loaded buttons
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('outgoing-btn')) {
    const button = event.target;
    const userId = button.getAttribute('data-user-id');
    const orderIndex = button.getAttribute('data-order-index');

    if (userId && orderIndex) {
      sendToOutgoing(userId, orderIndex);
    } else {
      console.error("Button is missing 'data-user-id' or 'data-order-index'");
    }
  }
});
