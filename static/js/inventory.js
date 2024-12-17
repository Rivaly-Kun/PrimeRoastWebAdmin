// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getDatabase, ref, onValue, update, remove } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";

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
const db = getDatabase(app);

// Function to fetch and display products in the table
function fetchAndDisplayProducts() {
    const inventoryTableDiv = document.getElementById("InventoryTableDiv");
    const productsRef = ref(db, 'products');

    // Clear existing rows
    inventoryTableDiv.innerHTML = "";

    onValue(productsRef, (snapshot) => {
        if (snapshot.exists()) {
            const products = snapshot.val();
            inventoryTableDiv.innerHTML = "";


            Object.keys(products).forEach((productId) => {
                const product = products[productId];

                // Create a table row for the product
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.productName}</td> 
                    <td>${product.category}</td>
                   
                    <td><img src="${product.productImage}" alt="${product.productName}" style="width: 50px; height: 50px;"></td>
                    <td>
                        <button class="edit-btn" data-id="${productId}">Edit</button>
                        <button class="delete-btn" data-id="${productId}">Delete</button>
                    </td>
                `;

                // Add product row to the table
                inventoryTableDiv.appendChild(row);

                // Add variants as sub-rows
                const variants = product.variants || {};
                Object.keys(variants).forEach((variantKey) => {
                    const variant = variants[variantKey];

                    const variantRow = document.createElement("tr");
                    variantRow.innerHTML = `
                        <td colspan="2">Variant: ${variant.name}</td>
                        <td>Price: ${variant.price}</td>
                        <td>Stock: ${variant.stock}</td>
                        <td>
                            <button class="edit-variant-btn" data-id="${productId}" data-variant="${variantKey}">Edit Variant</button>
                            <button class="delete-variant-btn" data-id="${productId}" data-variant="${variantKey}">Delete Variant</button>
                        </td>
                    `;

                    inventoryTableDiv.appendChild(variantRow);
                });
            });

            // Add event listeners for edit and delete buttons
            addEditAndDeleteListeners();
        } else {
            inventoryTableDiv.innerHTML = '<tr><td colspan="6" class="no-orders-message">No products available.</td></tr>';
        }
    });
}

// Add event listeners to edit and delete buttons
function addEditAndDeleteListeners() {
    document.querySelectorAll(".edit-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.target.dataset.id;
            showEditProductModal(productId);
        });
    });

    document.querySelectorAll(".delete-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.target.dataset.id;
            deleteProduct(productId);
        });
    });

    document.querySelectorAll(".edit-variant-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.target.dataset.id;
            const variantKey = e.target.dataset.variant;
            showEditVariantModal(productId, variantKey);
        });
    });

    document.querySelectorAll(".delete-variant-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const productId = e.target.dataset.id;
            const variantKey = e.target.dataset.variant;
            deleteVariant(productId, variantKey);
        });
    });
}

// Show modal to edit product
function showEditProductModal(productId) {
    const modal = document.getElementById("editProductModal");
    modal.style.display = "block";

    const saveButton = modal.querySelector(".save-btn");
    saveButton.onclick = () => {
        const newName = modal.querySelector(".product-name-input").value;
        if (newName) {
            update(ref(db, `products/${productId}`), { productName: newName });
            modal.style.display = "none";
        }
    };

    const closeButton = modal.querySelector(".close-btn");
    closeButton.onclick = () => {
        modal.style.display = "none";
    };
}

// Show modal to edit variant
function showEditVariantModal(productId, variantKey) {
    const modal = document.getElementById("editVariantModal");
    modal.style.display = "block";

    const saveButton = modal.querySelector(".save-btn");
    saveButton.onclick = () => {
        const newPrice = modal.querySelector(".variant-price-input").value;
        const newStock = modal.querySelector(".variant-stock-input").value;

        if (newPrice && newStock) {
            update(ref(db, `products/${productId}/variants/${variantKey}`), {
                price: newPrice,
                stock: newStock
            });
            modal.style.display = "none";
        }
    };

    const closeButton = modal.querySelector(".close-btn");
    closeButton.onclick = () => {
        modal.style.display = "none";
    };
}

// Delete product function
function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        remove(ref(db, `products/${productId}`));
    }
}

// Delete variant function
function deleteVariant(productId, variantKey) {
    if (confirm("Are you sure you want to delete this variant?")) {
        remove(ref(db, `products/${productId}/variants/${variantKey}`));
    }
}

// Initialize fetch on page load
fetchAndDisplayProducts();
