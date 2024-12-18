import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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

// Function to format timestamp
function formatDate(timestamp) {
    return new Date(timestamp * 1000).toLocaleString();
}
function loadAllTransactions() {
    const announcementsDiv = document.getElementById('TransactionsTableRecent');
    
    // Clear existing content
    announcementsDiv.innerHTML = '';

    // Reference to all transactions
    const transactionsRef = ref(db, 'transactions');
    
    get(transactionsRef).then((snapshot) => {
        if (snapshot.exists()) {
            // Create table headers
            const headerRow = document.createElement('tr');
            headerRow.innerHTML = `
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total Items</th>
                <th>Total Price</th>
                
                <th>Actions</th>
            `;
            announcementsDiv.appendChild(headerRow);

            // Handle both object-based and array-like structures
            const transactionsData = snapshot.val();
            
            // Determine if it's an array-like or object structure
            const transactions = Array.isArray(transactionsData) 
                ? transactionsData.filter(item => item != null)  // Remove null entries if array
                : Object.entries(transactionsData)
                    .filter(([key, value]) => value != null)
                    .map(([key, value]) => ({
                        ...value,
                        transactionId: key  // Preserve the original key
                    }));

            // Sort transactions by timestamp (most recent first)
            transactions.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

            // Render transactions
            transactions.forEach((transaction) => {
                const transactionId = transaction.transactionId || 
                    (typeof transaction === 'object' ? Object.keys(transaction)[0] : null);
                
                // Create and append table row for each transaction
                const transactionRow = createTransactionTableRow(transaction, transactionId);
                announcementsDiv.appendChild(transactionRow);
            });

            // Handle empty case
            if (transactions.length === 0) {
                const noTransactionsRow = document.createElement('tr');
                noTransactionsRow.innerHTML = '<td colspan="7">No transactions found.</td>';
                announcementsDiv.appendChild(noTransactionsRow);
            }
        } else {
            // No transactions found
            const noTransactionsRow = document.createElement('tr');
            noTransactionsRow.innerHTML = '<td colspan="7">No transactions found.</td>';
            announcementsDiv.appendChild(noTransactionsRow);
        }
    }).catch((error) => {
        console.error('Error fetching transactions:', error);
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = '<td colspan="7">Error loading transactions. Please try again later.</td>';
        announcementsDiv.appendChild(errorRow);
    });
}

function createTransactionTableRow(transactionData, transactionId) {
    // Ensure we're working with the correct transaction object
    const transaction = transactionData && transactionData.orderItems 
        ? transactionData 
        : Object.values(transactionData)[0];

    // Calculate total items and total price
    let totalItems = 0;
    let totalPrice = 0;
    
    // Correctly handle nested orderItems
    if (transaction.orderItems) {
        Object.values(transaction.orderItems).forEach(item => {
            totalItems += item.quantity || 0;
            totalPrice += (parseFloat(item.price) * (item.quantity || 0));
        });
    }

    // Create table row
    const tr = document.createElement('tr');
    tr.classList.add('transaction-row');
    tr.innerHTML = `
        <td>${transactionId || 'N/A'}</td>
        <td>${transaction.timestamp ? formatDate(transaction.timestamp) : 'N/A'}</td>
        <td>${transaction.Status || 'N/A'}</td>
        <td>${totalItems}</td>
        <td>₱${totalPrice.toFixed(2)}</td>
       
        <td>
            <button class="view-details-btn" data-transaction-id="${transactionId}">View Details</button>
        </td>
    `;

    // Add click event to view details
    const viewDetailsBtn = tr.querySelector('.view-details-btn');
    viewDetailsBtn.addEventListener('click', () => {
        // Create a modal or detailed view for the transaction
        showTransactionDetails(transaction, transactionId);
    });

    return tr;
}

function showTransactionDetails(transactionData, transactionId) {
    // Ensure we're working with the correct transaction object
    const transaction = transactionData && transactionData.orderItems 
        ? transactionData 
        : Object.values(transactionData)[0];

    // Prepare ordered items HTML
    const orderedItemsHtml = transaction.orderItems 
        ? Object.values(transaction.orderItems).map(item => `
            <div class="order-item">
                <img src="${item.productImage}" alt="${item.productName}" style="max-width: 100px; max-height: 100px;">
                <div>
                    <p><strong>Product:</strong> ${item.productName}</p>
                    <p><strong>Variant:</strong> ${item.variant}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <p><strong>Price:</strong> ₱${item.price}</p>
                </div>
            </div>
        `).join('') : '<p>No items found</p>';

    // Create modal
    const modal = document.createElement('div');
    modal.classList.add('transaction-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            
            <div class="transaction-details">
                <p><strong>Transaction ID:</strong> ${transactionId || 'N/A'}</p>

                <p><strong>Order Time:</strong> ${transaction.orderTime || 'N/A'}</p>
                <p><strong>Contact Number:</strong> ${transaction.contactNumber || 'N/A'}</p>
                
                
                <p><strong>Name:</strong> ${transaction.location?.name || 'N/A'}</p>
                <p><strong>Address:</strong> ${transaction.location?.address || 'N/A'}</p>
                
                <h3>Ordered Items</h3>
                <div class="ordered-items">
                    ${orderedItemsHtml}
                </div>
            </div>
        </div>
    `;

    // Close modal functionality
    const closeModal = modal.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Add modal to body
    document.body.appendChild(modal);
}

loadAllTransactions();