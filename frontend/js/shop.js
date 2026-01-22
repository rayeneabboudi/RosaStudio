console.log("SHOP.JS LOADED");

// 🔗 POINT TO YOUR LIVE BACKEND ON RENDER
const API_URL = "https://rosastudio-sfgv.onrender.com/";

let allProducts = [];

async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);

    all_products = await res.json();
    renderProducts(all_products);
  } catch (err) {
    console.error("Failed to load products:", err);
    // Optional: show user-friendly error on page
    const container = document.getElementById("product-grid");
    if (container) {
      container.innerHTML = "<p>⚠️ Unable to load products. Please try again later.</p>";
    }
  }
}

function renderProducts(products) {
  const container = document.getElementById("product-grid");
  if (!container) {
    console.error("product-grid element not found");
    return;
  }

  container.innerHTML = "";

  const countEl = document.getElementById("product-count");
  if (countEl) countEl.innerText = products.length;

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card";

    // Fallback image if missing
    const imgSrc = product.image || "pic/placeholder.jpg";

    card.innerHTML = `
      <div class="image-wrapper">
        <img src="${imgSrc}" alt="${product.name || 'Product'}" onerror="this.src='pic/placeholder.jpg'">
      </div>
      <h3>${product.name || 'Unnamed Product'}</h3>
      <p class="price">$${(product.price || 0).toFixed(2)}</p>
      <button onclick="deleteProduct(${product.id})">Delete</button>
    `;

    container.appendChild(card);
  });
}

async function deleteProduct(id) {
  if (!confirm("Are you sure you want to delete this product?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Delete failed");
    loadProducts(); // Refresh list
  } catch (err) {
    console.error("Delete error:", err);
    alert("Failed to delete product. Check console.");
  }
}

async function addProduct() {
  const name = document.getElementById("name")?.value.trim();
  const price = Number(document.getElementById("price")?.value);
  const image = document.getElementById("image")?.value.trim();
  const description = document.getElementById("description")?.value.trim();

  if (!name || isNaN(price) || price <= 0 || !image || !description) {
    alert("Please fill in all fields correctly");
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price, image, description })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Add failed: ${errorText}`);
    }

    // Clear form
    document.getElementById("name").value = "";
    document.getElementById("price").value = "";
    document.getElementById("image").value = "";
    document.getElementById("description").value = "";

    loadProducts();
  } catch (err) {
    console.error("Add product error:", err);
    alert("Error adding product. Check console for details.");
  }
}

function toggleAdmin() {
  const panel = document.getElementById("admin-panel");
  if (panel) {
    panel.style.display = panel.style.display === "none" ? "block" : "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const sortFilter = document.getElementById("sort-filter");
  if (sortFilter) {
    sortFilter.addEventListener("change", function () {
      let sorted = [...allProducts];

      if (this.value === "Price: Low to High") {
        sorted.sort((a, b) => a.price - b.price);
      } else if (this.value === "Price: High to Low") {
        sorted.sort((a, b) => b.price - a.price);
      }

      renderProducts(sorted);
    });
  }

  loadProducts();
});