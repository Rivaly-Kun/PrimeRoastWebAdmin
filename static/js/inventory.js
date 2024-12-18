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
// Fetch and display products
function fetchAndDisplayProducts() {
    const inventoryTableDiv = document.getElementById("InventoryTableDiv");
    const productsRef = ref(db, "products");

    inventoryTableDiv.innerHTML = ""; // Clear existing rows

    onValue(productsRef, (snapshot) => {
        inventoryTableDiv.innerHTML = "";

        if (snapshot.exists()) {
            const products = snapshot.val();

            Object.keys(products).forEach((productId) => {
                const product = products[productId];

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

                inventoryTableDiv.appendChild(row);
            });

            addEditAndDeleteListeners();
        } else {
            inventoryTableDiv.innerHTML = `<tr><td colspan="4" class="no-orders-message">No products available.</td></tr>`;
        }
    });
}

// Add event listeners
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
}

// Show Edit Product modal
function showEditProductModal(productId) {
    const modal = document.getElementById("editProductModal");
    const variantsContainer = modal.querySelector("#variants-container");

    const productRef = ref(db, `products/${productId}`);
    modal.style.display = "block";

    onValue(productRef, (snapshot) => {
        if (snapshot.exists()) {
            const product = snapshot.val();

            modal.querySelector(".product-name-input").value = product.productName;

            // Display variants
            const variants = product.variants || {};
            variantsContainer.innerHTML = Object.keys(variants)
                .map(
                    (key) => `
                        <div class="VarBlocks">
                            <h1> ${variants[key].name}</h1>
                            <h3 class="HeadersSMTH">Price</h3>
                            <input type="text" class="variant-price-input" placeholder="Price" value="${variants[key].price}">
                                                        <h3 class="HeadersSMTH">Stock</h3>
                            <input type="text" class="variant-stock-input" placeholder="Stock" value="${variants[key].stock}">
                        </div>
                    `
                )
                .join("");
        }
    });

    modal.querySelector(".save-btn").onclick = () => {
        const newName = modal.querySelector(".product-name-input").value;

        if (newName) {
            update(productRef, { productName: newName });
        }

        // Update variants
        const variantInputs = Array.from(variantsContainer.children);
        variantInputs.forEach((variantElement, index) => {
            const priceInput = variantElement.querySelector(".variant-price-input").value;
            const stockInput = variantElement.querySelector(".variant-stock-input").value;

            update(ref(db, `products/${productId}/variants/${index}`), {
                price: priceInput,
                stock: stockInput
            });
        });

        modal.style.display = "none";
    };

    modal.querySelector(".close-btn").onclick = () => {
        modal.style.display = "none";
    };
}

// Delete product
function deleteProduct(productId) {
    if (confirm("Are you sure you want to delete this product?")) {
        remove(ref(db, `products/${productId}`));
    }
}

// Initialize on page load
fetchAndDisplayProducts();