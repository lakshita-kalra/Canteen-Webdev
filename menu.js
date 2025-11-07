// menu.js

const API_BASE = "http://localhost:5050";

// --- GLOBAL VARIABLES ---
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// --- LOAD MENU ITEMS ---
async function loadMenu() {
  try {
    const res = await fetch(`${API_BASE}/api/menu`);
    const data = await res.json();

    const menuContainer = document.getElementById("menuItems");
    if (!data.length) {
      menuContainer.innerHTML = "<p>No menu items found.</p>";
      return;
    }

    let html = "";
    data.forEach(item => {
      html += `
        <div class="menu-item">
          <img src="${item.image || 'images/default.jpg'}" alt="${item.name}" />
          <h4>${item.name}</h4>
          <p>Price: ₹${item.price}</p>
          <button class="btn small" onclick="addToCart(${item.id}, '${item.name}', ${item.price}, '${item.image || 'images/default.jpg'}')">Add to Cart</button>
        </div>
      `;
    });
    menuContainer.innerHTML = html;
  } catch (err) {
    console.error("Error loading menu:", err);
    document.getElementById("menuItems").innerHTML = "<p>⚠️ Could not load menu.</p>";
  }
}

// --- CART LOGIC ---
function addToCart(id, name, price, image) {
  const existing = cart.find(i => i.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ id, name, price, qty: 1, image });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const cartContainer = document.getElementById("cartItems");
  const totalPrice = document.getElementById("totalPrice");

  if (!cart.length) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    totalPrice.innerText = 0;
    return;
  }

  let html = "";
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.qty;
    html += `
      <div class="cart-item">
        <div class="manage-left">
          <img src="${item.image}" alt="${item.name}" />
          <strong>${item.name}</strong> x${item.qty} - ₹${item.price * item.qty}
        </div>
        <div class="manage-right">
          <button class="btn small danger" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `;
  });

  cartContainer.innerHTML = html;
  totalPrice.innerText = total;
}

// --- PLACE ORDER ---
async function placeOrder() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  if (!loggedUser) return alert("Please login first!");
  if (!cart.length) return alert("Cart is empty!");

  const order = {
    user: loggedUser.email,
    cart,
    total: cart.reduce((sum, i) => sum + i.price * i.qty, 0)
  };

  try {
    const res = await fetch(`${API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });
    const data = await res.json();

    alert("✅ Order placed successfully!");
    cart = [];
    localStorage.removeItem("cart");
    updateCart();
  } catch (err) {
    alert("❌ Failed to place order.");
    console.error(err);
  }
}

// --- CUSTOMER: VIEW MY ORDERS ---
async function viewMyOrders() {
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));
  if (!loggedUser) return alert("Please login first!");

  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    const allOrders = await res.json();

    const myOrders = allOrders.filter(o => o.user === loggedUser.email);
    const container = document.getElementById("myOrdersList");

    if (!myOrders.length) {
      container.innerHTML = "<p>No orders yet.</p>";
    } else {
      container.innerHTML = myOrders.map(order => `
        <div class="cart-item">
          <div class="manage-left">
            <strong>Order ID:</strong> ${order.id}<br>
            <strong>Items:</strong> ${order.cart.map(i => `${i.name} x${i.qty}`).join(", ")}<br>
            <strong>Total:</strong> ₹${order.total}<br>
            <strong>Date:</strong> ${order.date}<br>
            <strong>Status:</strong> <span style="color:${order.status === 'Completed' ? 'green' : 'orange'}">${order.status}</span>
          </div>
        </div>
      `).join("");
    }

    document.getElementById("ordersModal").classList.remove("hidden");
  } catch (err) {
    console.error(err);
    alert("Failed to load orders.");
  }
}

function closeOrdersModal() {
  document.getElementById("ordersModal").classList.add("hidden");
}

// --- INITIALIZATION ---
window.onload = () => {
  loadMenu();
  updateCart();
  document.getElementById("placeOrder").addEventListener("click", placeOrder);
};
