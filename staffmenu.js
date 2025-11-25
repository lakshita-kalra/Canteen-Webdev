document.addEventListener("DOMContentLoaded", function() {
    const loggedUserStaff = JSON.parse(localStorage.getItem("loggedUser"));
    if (!loggedUserStaff || loggedUserStaff.role !== "staff") {
        alert("❌ Please login as staff");
        window.location.href = "index.html";
        return;
    }
    renderOrders();
});

function renderOrders() {
    const ordersList = document.getElementById("ordersList");
    const orders = JSON.parse(localStorage.getItem("orders")) || [];
    ordersList.innerHTML = "";
    if (orders.length === 0) {
        ordersList.innerHTML = "<p>No orders yet.</p>";
        return;
    }
    orders.forEach((order, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <h4>${order.user} (${order.email})</h4>
            <p>${order.items.map(i => i.name + " x" + i.qty).join(", ")}</p>
            <p><b>Total:</b> ₹${order.total}</p>
            <p><b>Date:</b> ${order.date}</p>
            <label>
                <b>Status</b>
                <select onchange="updateStatus(${index}, this.value)">
                    <option value="Pending" ${order.status === "Pending" ? "selected" : ""}>Pending</option>
                    <option value="Preparing" ${order.status === "Preparing" ? "selected" : ""}>Preparing</option>
                    <option value="Ready" ${order.status === "Ready" ? "selected" : ""}>Ready</option>
                    <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>Delivered</option>
                </select>
            </label>
            <button class="btn small danger" onclick="deleteOrder(${index})">Delete</button>
        `;
        ordersList.appendChild(div);
    });
}

window.deleteOrder = function(index) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders.splice(index, 1);
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
};

window.updateStatus = function(index, status) {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    orders[index].status = status;
    localStorage.setItem("orders", JSON.stringify(orders));
    renderOrders();
};
