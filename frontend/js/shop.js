console.log("SHOP.JS LOADED");

// ✅ CORRECT URL: Points to the specific API folder on your server
const API_URL = "https://rosastudio-sfgv.onrender.com/api/products";

let allProducts = [];

// 1. Fetch products
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`Server Error: ${res.status}`);
    
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error("Load error:", err);
    // Only show error if grid is empty
    const container = document.getElementById("product-grid");
    if (container && container.innerHTML.trim() === "") {
        container.innerHTML = "<p>Loading products...</p>";
    }
  }
}

// 2. Render products
function renderProducts(products) {
  const container = document.getElementById("product-grid");
  if (!container) return;

  container.innerHTML = "";
  
  const countEl = document.getElementById("product-count");
  if (countEl) countEl.innerText = `${products.length} Items`;

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";
    
    const imgSrc = product.image || "pic/placeholder.jpg";

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${imgSrc}" alt="${product.name}" onerror="this.src='pic/placeholder.jpg'">
      </div>
      <h3>${product.name}</h3>
      <p class="price">$${Number(product.price).toFixed(2)}</p>
      <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
    `;
    container.appendChild(card);
  });
}

// 3. Add Product
async function addProduct() {
  // ✅ REVERTED TO ORIGINAL IDs: "name", "price", "image", "description"
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const imageInput = document.getElementById("image");
  const descInput = document.getElementById("description");

  // Debugging: Check if found
  if (!nameInput || !priceInput || !imageInput) {
    alert("Error: Script cannot find input fields. Check HTML IDs.");
    console.error("Looking for IDs: 'name', 'price', 'image'. Found:", nameInput, priceInput, imageInput);
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
    image: imageInput.value.trim(),
    description: descInput ? descInput.value.trim() : ""
  };

  if (!payload.name || !payload.price) {
    alert("Please enter a Name and Price.");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(txt);
    }

    // Success: Clear inputs
    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    if (descInput) descInput.value = "";

    // Refresh Shop
    await loadProducts();
    toggleAdmin();

  } catch (err) {
    console.error("Add failed:", err);
    alert("Failed to add product. Check console.");
  }
}

// 4. Delete Product
async function deleteProduct(id) {
  if (!confirm("Delete this item?")) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) loadProducts();
  } catch (err) {
    console.error("Delete error:", err);
  }
}

// 5. Toggle Admin Panel
function toggleAdmin() {
  const panel = document.getElementById("admin-panel");
  if (panel) {
    panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
  }
}

// 6. Init
document.addEventListener("DOMContentLoaded", () => {
  const sortFilter = document.getElementById("sort-filter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      let sorted = [...allProducts];
      if (this.value.includes("Low to High")) sorted.sort((a, b) => a.price - b.price);
      else if (this.value.includes("High to Low")) sorted.sort((a, b) => b.price - a.price);
      renderProducts(sorted);
    });
  }
  loadProducts();
});