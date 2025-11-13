function renderMenuManagement() {
    menuList.innerHTML = "";
    menu = JSON.parse(localStorage.getItem("menu")) || defaultMenu;
    if (menu.length === 0) {
        menuList.innerHTML = "<p>No items</p>";
        return;
    }
    menu.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
            <h4>${item.name} - ₹${item.price}</h4>
            <label>
                <input type="checkbox" ${item.available ? "checked" : ""} onchange="toggleAvailability(${index}, this.checked)">
                Available
            </label>
            <button class="btn small" onclick="editMenuItem(${index})">Edit</button>
            <button class="btn small danger" onclick="removeMenuItem(${index})">Remove</button>
        `;
        menuList.appendChild(div);
    });
}

window.toggleAvailability = function(index, checked) {
    let menu = JSON.parse(localStorage.getItem("menu")) || defaultMenu;
    menu[index].available = checked;
    localStorage.setItem("menu", JSON.stringify(menu));
    renderMenuManagement();
};

window.removeMenuItem = function(index) {
    let menu = JSON.parse(localStorage.getItem("menu")) || defaultMenu;
    menu.splice(index, 1);
    localStorage.setItem("menu", JSON.stringify(menu));
    renderMenuManagement();
};

window.editMenuItem = function(index) {
    // Your edit item logic here,
    // e.g., open a form prefilled with the item's info for update
};
window.addNewItem = function() {
    const name = document.getElementById("newName").value.trim();
    const price = parseFloat(document.getElementById("newPrice").value.trim());
    const image = document.getElementById("newImage").value.trim();
    const available = document.getElementById("newAvailable").checked;

    if (!name || isNaN(price) || price <= 0) {
        alert("Please enter valid name and price.");
        return;
    }
    let menu = JSON.parse(localStorage.getItem("menu")) || [];
    const newItem = {
        id: menu.length ? Math.max(...menu.map(i => i.id)) + 1 : 1,
        name: name,
        price: price,
        image: image,
        available: available
    };
    menu.push(newItem);
    localStorage.setItem("menu", JSON.stringify(menu));
    // Clear input fields
    document.getElementById("newName").value = "";
    document.getElementById("newPrice").value = "";
    document.getElementById("newImage").value = "";
    document.getElementById("newAvailable").checked = true;
    // Re-render menu
    renderMenuManagement();
    alert("Item added successfully!");
};
