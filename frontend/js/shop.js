console.log("SHOP.JS LOADED");

const API_URL = "https://rosastudio-sfgv.onrender.com";
let allProducts = [];

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    // FIX: Match the global variable name correctly
    allProducts = await res.json();
    renderProducts(allProducts);
  } catch (err) {
    console.error("Load error:", err);
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
      <p class="price">$${(Number(product.price) || 0).toFixed(2)}</p>
      <button class="delete-btn" onclick="deleteProduct(${product.id})">Delete</button>
    `;
    container.appendChild(card);
  });
}

async function addProduct() {
  // FIX: We use a flexible selector to find your inputs regardless of the ID prefix
  const nameVal = document.querySelector('input[placeholder*="Name"], #name, #new-name')?.value;
  const priceVal = document.querySelector('input[placeholder*="Price"], #price, #new-price')?.value;
  const imageVal = document.querySelector('input[placeholder*="URL"], #image, #new-image')?.value;
  const descVal = document.querySelector('textarea, #description, #new-desc')?.value;

  if (!nameVal || !priceVal || !imageVal) {
    alert("Please fill in the required fields");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        name: nameVal, 
        price: parseFloat(priceVal), 
        image: imageVal, 
        description: descVal || "" 
      })
    });

    if (!res.ok) throw new Error(await res.text());

    // Reset all inputs in the admin panel
    document.querySelectorAll('#admin-panel input, #admin-panel textarea').forEach(i => i.value = "");

    // Refresh the shop immediately
    await loadProducts();
    toggleAdmin(); 
    
  } catch (err) {
    console.error("Add product error:", err);
    alert("Could not add product. Check if your Render server is awake.");
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this item?")) return;
  try {
    const res = await fetch(`${API_URL}${id}`, { method: "DELETE" });
    if (res.ok) loadProducts();
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
  const sortFilter = document.getElementById("sort-filter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      let sorted = [...allProducts];
      if (this.value.includes("Low to High")) {
        sorted.sort((a, b) => a.price - b.price);
      } else if (this.value.includes("High to Low")) {
        sorted.sort((a, b) => b.price - a.price);
      }
      renderProducts(sorted);
    });
  }
  loadProducts();
});