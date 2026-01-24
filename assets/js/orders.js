tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#ff3131", // Global Red
                "background-light": "#f8f7f5", // Neutral Light
                "background-dark": "#000000", // Global Black
                "surface-dark": "#1a130c", 
                "secondary-text": "#cbad90", 
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"],
                "body": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem", 
                "lg": "0.5rem", 
                "xl": "0.75rem", 
                "2xl": "1rem", 
                "full": "9999px"
            },
        },
    },
}

// --- Cart Logic ---

function getCart() {
    return JSON.parse(localStorage.getItem('bar-los-hermanos-cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('bar-los-hermanos-cart', JSON.stringify(cart));
    updateCartBadge();
}

function addToCart(name, price, image) {
    let cart = getCart();
    let item = cart.find(i => i.name === name);
    if (item) {
        item.quantity++;
    } else {
        cart.push({ name, price, image, quantity: 1 });
    }
    saveCart(cart);
    alert(`${name} adicionado ao carrinho!`);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    const badgeCount = document.getElementById('cart-count');
    const cart = getCart();
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    if (badge) badge.innerText = totalItems;
    if (badgeCount) badgeCount.innerText = totalItems;
}

function updateCartUI() {
    const container = document.getElementById('cart-items-container');
    const emptyMsg = document.getElementById('empty-cart-msg');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const checkoutTotalEl = document.getElementById('checkout-total');
    
    if (!container) return;

    let cart = getCart();

    if (cart.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'flex';
        container.innerHTML = ''; 
        if (emptyMsg) container.appendChild(emptyMsg);
        if (subtotalEl) subtotalEl.innerText = 'R$ 0,00';
        if (totalEl) totalEl.innerText = 'R$ 0,00';
        if (checkoutTotalEl) checkoutTotalEl.innerText = 'R$ 0,00';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    container.innerHTML = '';

    let subtotal = 0;

    cart.forEach((item, index) => {
        subtotal += item.price * item.quantity;
        const itemHtml = `
            <div class="flex items-center gap-4 px-4 py-4 border-b border-gray-200 dark:border-white/5 last:border-0">
                <div class="bg-center bg-no-repeat bg-cover rounded-xl size-20 shrink-0 shadow-sm" style='background-image: url("${item.image}");'></div>
                <div class="flex flex-col flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                        <h3 class="text-base font-bold leading-tight line-clamp-1">${item.name}</h3>
                        <button class="text-gray-400 hover:text-red-500 transition-colors ml-2" onclick="removeFromCart(${index})">
                            <span class="material-symbols-outlined" style="font-size: 20px;">delete</span>
                        </button>
                    </div>
                    <div class="flex items-center justify-between mt-3">
                        <p class="text-primary font-bold">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <div class="flex items-center bg-gray-100 dark:bg-[#342618] rounded-full p-1 h-8">
                            <button class="w-7 h-full flex items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-[#493622] text-gray-600 dark:text-white transition-colors" onclick="changeQuantity(${index}, -1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
                            </button>
                            <span class="w-6 text-center text-sm font-semibold">${item.quantity}</span>
                            <button class="w-7 h-full flex items-center justify-center rounded-full bg-white dark:bg-primary shadow-sm text-gray-900 dark:text-white transition-colors" onclick="changeQuantity(${index}, 1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });

    const delivery = 5.00;
    const total = subtotal + delivery;

    if (subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    if (checkoutTotalEl) checkoutTotalEl.innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
    
    updateCartBadge();
}

function changeQuantity(index, delta) {
    let cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    saveCart(cart);
    updateCartUI();
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
});
