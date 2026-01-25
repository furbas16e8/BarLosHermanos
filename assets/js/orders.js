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
    if (typeof updateNavbarCartCount === 'function') updateNavbarCartCount();
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
    // Substituído alert por feedback silencioso/visual
    console.log(`${name} adicionado ao carrinho!`);
}
// Exposing globally for module access
window.addToCart = addToCart;


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

    const delivery = subtotal > 0 ? 5.00 : 0.00;
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

// --- Favorite Logic ---

function getFavorites() {
    return JSON.parse(localStorage.getItem('bar-los-hermanos-favs')) || [];
}

function saveFavorites(favs) {
    localStorage.setItem('bar-los-hermanos-favs', JSON.stringify(favs));
    updateFavoritesUI();
}

function toggleFavorite(name, price, image) {
    let favs = getFavorites();
    let index = favs.findIndex(f => f.name === name);
    
    if (index > -1) {
        favs.splice(index, 1);
        console.log(`${name} removido dos favoritos`);
    } else {
        favs.push({ name, price, image });
        console.log(`${name} adicionado aos favoritos`);
    }
    
    saveFavorites(favs);
    
    // Atualiza ícones na página se necessário
    updateFavoriteIcons();
}
window.toggleFavorite = toggleFavorite;
window.updateFavoriteIcons = updateFavoriteIcons; // Exposing updateFavoriteIcons too


function isFavorite(name) {
    const favs = getFavorites();
    return favs.some(f => f.name === name);
}

function updateFavoriteIcons() {
    const favoriteButtons = document.querySelectorAll('[data-favorite-name]');
    favoriteButtons.forEach(btn => {
        const name = btn.getAttribute('data-favorite-name');
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            if (isFavorite(name)) {
                icon.style.fontVariationSettings = "'FILL' 1";
                icon.classList.add('text-primary');
            } else {
                icon.style.fontVariationSettings = "'FILL' 0";
                icon.classList.remove('text-primary');
            }
        }
    });
}

function updateFavoritesUI() {
    const container = document.getElementById('favorites-container');
    if (!container) return;

    let favs = getFavorites();

    if (favs.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 text-center opacity-50">
                <span class="material-symbols-outlined text-6xl mb-4">favorite_border</span>
                <p class="text-lg font-medium">Você ainda não tem favoritos.</p>
                <p class="text-sm">Explore o cardápio e adicione os pratos que mais gosta!</p>
                <a href="orders.html" class="mt-6 px-6 py-2 bg-primary rounded-full text-white font-bold">Ver Cardápio</a>
            </div>
        `;
        return;
    }

    container.innerHTML = '';

    favs.forEach((item, index) => {
        const itemHtml = `
            <div class="bg-card-dark rounded-2xl overflow-hidden border border-white/5 shadow-xl flex gap-4 p-3 relative mb-4">
                <div class="relative w-32 h-32 shrink-0">
                    <img alt="${item.name}" class="w-full h-full object-cover rounded-xl" src="${item.image}"/>
                </div>
                <div class="flex flex-col justify-between flex-1 py-1">
                    <div class="pr-8">
                        <h3 class="text-lg font-bold">${item.name}</h3>
                        <p class="text-slate-400 text-xs line-clamp-2">Item favorito do Bar Los Hermanos.</p>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-primary font-bold text-lg">R$ ${item.price.toFixed(2).replace('.', ',')}</span>
                        <button class="bg-primary text-white p-2 rounded-xl flex items-center justify-center hover:scale-95 transition-all" onclick="addToCart('${item.name}', ${item.price}, '${item.image}')">
                            <span class="material-symbols-outlined">add_shopping_cart</span>
                        </button>
                    </div>
                </div>
                <button class="absolute top-3 right-3 text-slate-500 hover:text-red-500 transition-colors" onclick="toggleFavorite('${item.name}')">
                    <span class="material-symbols-outlined text-xl">delete</span>
                </button>
            </div>
        `;
        container.innerHTML += itemHtml;
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    updateCartUI(); 
    updateFavoritesUI();
    updateFavoriteIcons();
});
