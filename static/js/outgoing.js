import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

function fetchOutgoingOrders() {
    const outgoingRef = ref(database, 'outgoing');
    const tableBody = document.getElementById('AnnouncementsDiv');

    get(outgoingRef)
        .then(snapshot => {
            if (snapshot.exists()) {
                const outgoingData = snapshot.val();
                tableBody.innerHTML = ''; 

                for (const userId in outgoingData) {
                    for (const indexNumber in outgoingData[userId]) {
                        const order = outgoingData[userId][indexNumber];

                        let orderItemsHtml = '<ul>';
                        if (order.orderItems) {
                            for (const itemKey in order.orderItems) {
                                const item = order.orderItems[itemKey];
                                orderItemsHtml += `
                                    <li>
                                        <strong>${item.productName}</strong> (${item.variant}) 
                                        - Qty: ${item.quantity} - Price: ${item.price}
                                        <br>
                                        <img src="${item.productImage}" alt="${item.productName}" style="width:50px;height:50px;">
                                    </li>
                                `;
                            }
                        }
                        orderItemsHtml += '</ul>';

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${userId}</td>
                            <td>${order.Status || 'N/A'}</td>
                            <td>${order.contactNumber || 'N/A'}</td>
                            <td>${orderItemsHtml}</td>
                            <td>
                                <button 
                                    class="cancel-btn" 
                                    data-user-id="${userId}" 
                                    data-index-number="${indexNumber}">
                                    Cancel
                                </button>
                            </td>
                        `;
                        tableBody.appendChild(row);
                    }
                }

                document.querySelectorAll('.cancel-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const userId = button.getAttribute('data-user-id');
                        const indexNumber = button.getAttribute('data-index-number');
                        cancelOrder(userId, indexNumber);
                    });
                });
            } else {
                console.log('No data available in outgoing.');
            }
        })
        .catch(error => {
            console.error('Error fetching outgoing orders:', error);
        });
}

function cancelOrder(userId, indexNumber) {
    const outgoingRef = ref(database, `outgoing/${userId}/${indexNumber}`);
    const notificationsRef = ref(database, `users/${userId}/notifications/${indexNumber}`);

    get(outgoingRef)
        .then(snapshot => {
            if (!snapshot.exists()) {
                throw new Error(`Order does not exist at path: outgoing/${userId}/${indexNumber}`);
            }
            const orderData = snapshot.val();
            const notificationMessage = {
                message: "Your order has been canceled",
                timestamp: new Date().toISOString(),
                orderDetails: orderData
            };

            return set(notificationsRef, notificationMessage)
                .then(() => remove(outgoingRef));
        })
        .then(() => {
            console.log(`Order moved to notifications and removed from outgoing.`);
       
            const row = document.querySelector(`button[data-user-id="${userId}"][data-index-number="${indexNumber}"]`).closest('tr');
            if (row) {
                row.remove();
            }
        })
        .catch(error => {
            console.error('Error during cancellation:', error);
        });
}

document.addEventListener('DOMContentLoaded', fetchOutgoingOrders);
