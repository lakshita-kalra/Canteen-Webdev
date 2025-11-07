// script.js - handles register, login, basic auth utilities and demo accounts

// Demo users (will be created in localStorage on first run)
// Backend base URL
const API_BASE = "http://localhost:5050";

const demoUsers = [];

function ensureDemoUsers() {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  // add demo users if not present
  demoUsers.forEach(d => {
    if (!users.find(u => u.email === d.email)) users.push(d);
  });
  localStorage.setItem('users', JSON.stringify(users));
}
ensureDemoUsers();

// Register function to be used on register page
if (document.getElementById('registerForm')) {
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const firstname = document.getElementById('firstname').value.trim();
    const lastname = document.getElementById('lastname').value.trim();
    const email = document.getElementById('email').value.trim().toLowerCase();
    const password = document.getElementById('regPassword').value.trim();
    const role = document.getElementById('role').value;

    if (!firstname || !lastname || !email || !password || !role)
      return alert("Please fill all fields.");
    if (password.length < 4)
      return alert("Password must be at least 4 characters.");

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(u => u.email === email)) {
      return alert("Email already registered. Try logging in.");
    }

    // Save locally (for offline use)
    users.push({ firstname, lastname, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    // 🔗 Also send to backend
    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: firstname + " " + lastname, email, password, role })
      });
      const data = await res.json();
      console.log("Backend:", data);
    } catch (err) {
      console.error("Backend not reachable:", err);
    }

    alert("✅ Registered successfully. Now login.");
    window.location.href = role === 'staff' ? 'loginstaff.html' : 'logincustomer.html';
  });
}


// Generic login function used by both login pages
function loginUser(email, password, roleExpected) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email.toLowerCase() && u.password === password);
  if (!user) return alert("Invalid credentials.");
  if (roleExpected && user.role !== roleExpected) {
    return alert("You must login through the correct portal for your role.");
  }
  // store only essential info
  const logged = { email: user.email, role: user.role, username: (user.firstname || user.email.split('@')[0]) };
  localStorage.setItem('loggedUser', JSON.stringify(logged));
  alert("✅ Login successful as " + user.role);
  if (user.role === 'staff') window.location.href = 'staffmenu.html';
  else window.location.href = 'menu.html';
}

// Logout helper accessible from various pages
function logout() {
  localStorage.removeItem('loggedUser');
  window.location.href = 'index.html';
}
// Load menu items dynamically
if (document.getElementById('menuList')) {
  async function loadMenu() {
    try {
      const res = await fetch(`${API_BASE}/api/menu`);
      const data = await res.json();

      const menuList = document.getElementById('menuList');
      menuList.innerHTML = ""; // Clear old content

      data.forEach(item => {
        const div = document.createElement('div');
        div.className = "menu-item";
        div.innerHTML = `
          <h3>${item.name}</h3>
          <p>Price: ₹${item.price}</p>
          <button onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        `;
        menuList.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load menu:", err);
    }
  }

  loadMenu();
}

