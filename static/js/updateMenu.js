import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-auth.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js";
import { getStorage, ref as sRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-storage.js";

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

const productMenu = document.getElementById('productMenu');
const updateMenu = document.getElementById('updateMenu');
const closeMenu = document.getElementById('closeMenu');
const submitProduct = document.getElementById('submitProduct');
const variantsContainer = document.getElementById('variantsContainer');
const addVariantButton = document.getElementById('addVariant');
const productCategory = document.getElementById('productCategory'); // Ensure this is defined
const categoryNameInput = document.getElementById('newCategoryName');
const saveCategoryButton = document.getElementById('saveCategoryBtn');
const addCategoryButton = document.getElementById('addCategoryBtn');
const newCategoryModal = document.getElementById('newCategoryModal');
const closeCategoryModal = document.getElementById('closeCategoryModal');
let variantCount = 1;

// Open the Product Menu when `.box` is clicked
updateMenu.addEventListener('click', () => {
    productMenu.style.display = 'block';
});

// Close the Product Menu
closeMenu.addEventListener('click', () => {
    productMenu.style.display = 'none';
});

// Load Categories into the Dropdown
function loadCategories() {
    const categoryRef = ref(database, 'categories/');
    
    onValue(categoryRef, (snapshot) => {
        productCategory.innerHTML = '<option value="" disabled selected>Select category</option>';
        
        if (!snapshot.exists()) {
            const option = document.createElement('option');
            option.value = "";
            option.disabled = true;
            option.textContent = "No categories available";
            productCategory.appendChild(option);
        } else {
            snapshot.forEach((childSnapshot) => {
                const categoryName = childSnapshot.val();
                const option = document.createElement('option');
                option.value = categoryName;
                option.textContent = categoryName;
                productCategory.appendChild(option);
            });
        }
    });
}

// Save a new category to Firebase
saveCategoryButton.addEventListener('click', () => {
    const categoryName = categoryNameInput.value.trim();
    if (categoryName) {
        const categoryRef = ref(database, 'categories/');
        push(categoryRef, categoryName)
            .then(() => {
                console.log("Category saved successfully");
                categoryNameInput.value = ''; // Clear input after saving
                loadCategories(); // Refresh the dropdown to include the new category
                newCategoryModal.style.display = 'none'; // Close modal after saving
            })
            .catch((error) => {
                console.error("Error saving category:", error);
            });
    } else {
        alert("Please enter a category name.");
    }
});

// Show new category modal
addCategoryButton.addEventListener('click', () => {
    newCategoryModal.style.display = 'block';
});

// Close new category modal
closeCategoryModal.addEventListener('click', () => {
    newCategoryModal.style.display = 'none';
});

// Call the function to load categories on page load
document.addEventListener('DOMContentLoaded', loadCategories);

// Add new variant input fields dynamically
addVariantButton.addEventListener('click', () => {
    variantCount++;
    const newVariantDiv = document.createElement('div');
    newVariantDiv.classList.add('variant');
    newVariantDiv.innerHTML = `
        <label for="variantName${variantCount}">Variant ${variantCount} Name:</label>
        <input type="text" class="variant-name" placeholder="Enter variant name (e.g., 'spicy sinigang')" />
        <label for="variantPrice${variantCount}">Price:</label>
        <input type="number" class="variant-price" placeholder="Enter price (e.g., '160')" />
    `;
    variantsContainer.appendChild(newVariantDiv);
});

// Upload Product Image and Save Data
submitProduct.addEventListener('click', (event) => {
    event.preventDefault();
    const productName = document.getElementById('productName').value;
    const productImageFile = document.getElementById('productImage').files[0];

    if (productName && productImageFile) {
        const urls = [];
        const userId = auth.currentUser ? auth.currentUser.uid : 'anonymous';
        uploadImage(productImageFile, userId, urls, 1);
    } else {
        alert("Please fill out all fields.");
    }
});

// Upload image function
function uploadImage(file, userId, urls, totalFiles) {
    const storageRef = sRef(storage, 'images/' + userId + '/' + file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload is ' + progress + '% done for ' + file.name);
        },
        (error) => {
            console.error("Upload failed:", error);
            alert("Error uploading image: " + error.message);
        },
        () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                urls.push(downloadURL);
                if (urls.length === totalFiles) {
                    saveProductData(urls);
                }
            });
        }
    );
}

// Save product data function
function saveProductData(imageUrls) {
    const productId = 'product_' + Math.random().toString(36).substr(2, 9);
    const productName = document.getElementById('productName').value;

    const variantNames = document.querySelectorAll('.variant-name');
    const variantPrices = document.querySelectorAll('.variant-price');
    const variants = {};

    variantNames.forEach((nameInput, index) => {
        const priceInput = variantPrices[index];
        const variantName = nameInput.value;
        const variantPrice = priceInput.value;

        if (variantName && variantPrice) {
            const variantKey = `var${index + 1}`;
            variants[variantKey] = `${variantName} + ${variantPrice}`;
        }
    });

    const productData = {
        productId: productId,
        productName: productName,
        productImage: imageUrls[0],
        variant: variants,
        category: productCategory.value
    };

    const productRef = ref(database, 'products/' + productId);

    set(productRef, productData)
        .then(() => {
            console.log("Product and image URLs saved successfully");
            alert("Product added successfully!");
            productMenu.style.display = 'none';
        })
        .catch((error) => {
            console.error("Error saving product data:", error);
            alert("Error adding product: " + error.message);
        });
}
