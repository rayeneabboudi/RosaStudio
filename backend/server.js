console.log("SHOP.JS LOADED");

// FIX: We added '/api/products' to the end of the URL because that is what server.js defines
const API_URL = "https://rosastudio-sfgv.onrender.com/api/products";

let allProducts = [];

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error("Load error:", err);
    const container = document.getElementById("product-grid");
    if(container) container.innerHTML = "<p>Loading...</p>";
  }
}

function renderProducts(products) {
  const container = document.getElementById("product-grid");
  if (!container) return;

  container.innerHTML = "";
  const countEl = document.getElementById("product-count");
  if (countEl) countEl.innerText = `${products.length} Products`;

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

async function addProduct() {
  // Grab inputs using the IDs from your shop.html
  const nameInput = document.getElementById("new-name");
  const priceInput = document.getElementById("new-price");
  const imageInput = document.getElementById("new-image");
  const descInput = document.getElementById("new-desc");

  if (!nameInput || !priceInput || !imageInput) {
    alert("Error: Input fields not found.");
    return;
  }

  const payload = {
    name: nameInput.value.trim(),
    price: parseFloat(priceInput.value),
    image: imageInput.value.trim(),
    description: descInput ? descInput.value.trim() : ""
  };

  if (!payload.name || !payload.price) {
      alert("Please enter a name and price.");
      return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText);
    }

    // Clear inputs
    nameInput.value = "";
    priceInput.value = "";
    imageInput.value = "";
    if(descInput) descInput.value = "";

    // Refresh immediately
    await loadProducts();
    toggleAdmin(); 
    
  } catch (err) {
    console.error("Add error:", err);
    alert("Failed to add. Make sure Render is awake (wait 30s) and try again.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Are you sure?")) return;
  try {
    // FIX: Add slash between URL and ID
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (res.ok) loadProducts();
    else alert("Could not delete item");
  } catch (err) {
    console.error("Delete error:", err);
  }
}

function toggleAdmin() {
  const panel = document.getElementById("admin-panel");
  if (panel) {
    panel.style.display = (panel.style.display === "none" || panel.style.display === "") ? "block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
    // Sort logic
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