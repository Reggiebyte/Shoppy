function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateForm() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!validateEmail(email)) {
        alert('Please enter a valid email');
        return false;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return false;
    }

    return true;
}

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
    const existing = cart.find(item => item.name === product.name);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
    }
}

function updateCartDisplay() {
    const cartDiv = document.getElementById('cart');
    if (cartDiv) {
        cartDiv.innerHTML = '<h3>Shopping Cart</h3>';
        if (cart.length === 0) {
            cartDiv.innerHTML += '<p>Cart is empty</p>';
        } else {
            let total = 0;
            cart.forEach((item, index) => {
                const price = parseFloat(item.price.replace('$', ''));
                const itemTotal = price * item.quantity;
                total += itemTotal;
                cartDiv.innerHTML += `
                    <p>${item.name} - ${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                    <button onclick="removeFromCart(${index})">Remove</button></p>
                `;
            });
            cartDiv.innerHTML += `<p><strong>Total: $${total.toFixed(2)}</strong></p>`;
            cartDiv.innerHTML += '<button class="place-order" onclick="placeOrder()">Place Order</button>';
        }
    }
}

function placeOrder() {
    if (cart.length === 0) {
        alert('Cart is empty');
        return;
    }
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price.replace('$', '')) * item.quantity, 0);
    const order = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        items: cart,
        total: total,
        status: 'Pending'
    };
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    cart = [];
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartDisplay();
    alert('Order placed!');
}

function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const ordersTable = document.querySelector('#orders-table tbody');
    if (ordersTable) {
        ordersTable.innerHTML = '';
        orders.forEach(order => {
            ordersTable.innerHTML += `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.date}</td>
                    <td>${order.status}</td>
                    <td>$${order.total.toFixed(2)}</td>
                </tr>
            `;
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            if (!validateForm()) {
                event.preventDefault();
            }
        });
    }
    updateCartDisplay();
    loadOrders();
});