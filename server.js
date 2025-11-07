import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

// 📂 Get current directory for saving data file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFilePath = path.join(__dirname, "data.json");

// 🧾 Helper: Load and Save Orders from data.json
function loadOrders() {
  try {
    if (fs.existsSync(dataFilePath)) {
      const data = fs.readFileSync(dataFilePath);
      return JSON.parse(data);
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error reading data file:", err);
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error("Error writing data file:", err);
  }
}

// ---------------- USERS ----------------
let users = [];
let menu = [
  { id: 1, name: "Pizza", price: 100 },
  { id: 2, name: "Burger", price: 80 },
  { id: 3, name: "Pasta", price: 120 }
];

// Root route
app.get("/", (req, res) => {
  res.send("🍴 Canteen Management Backend Running Successfully!");
});

// Menu
app.get("/api/menu", (req, res) => {
  res.json(menu);
});

// Register
app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  users.push({ name, email, password });
  res.json({ message: "User registered successfully!" });
});

// All users
app.get("/api/users", (req, res) => {
  res.json(users);
});

// ---------------- ORDERS ----------------
let orders = loadOrders(); // Load saved orders on server start

// Place new order
app.post("/api/orders", (req, res) => {
  const { user, cart, total } = req.body;
  if (!user || !cart || cart.length === 0) {
    return res.status(400).json({ message: "Invalid order data" });
  }

  const newOrder = {
    id: orders.length + 1,
    user,
    cart,
    total,
    date: new Date().toLocaleString(),
    status: "Pending",
  };

  orders.push(newOrder);
  saveOrders(orders); // 💾 Save to file
  console.log("🛒 New Order Saved:", newOrder);
  res.json({ message: "Order placed successfully!", order: newOrder });
});

// Get all orders
app.get("/api/orders", (req, res) => {
  res.json(orders);
});

// Update order status
app.put("/api/orders/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  saveOrders(orders); // 💾 Save updated data
  console.log(`🟢 Order #${id} marked as ${status}`);
  res.json({ message: "Order status updated!", order });
});

// ✅ Start the server
app.listen(5050, () => console.log("✅ Server running on http://localhost:5050"));
