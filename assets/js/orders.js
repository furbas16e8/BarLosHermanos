tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#ff3131", // Global Red
        "background-light": "#f8f7f5", // Neutral Light
        "background-dark": "#000000", // Global Black
        "surface-dark": "#1a130c",
        "secondary-text": "#cbad90",
      },
      fontFamily: {
        display: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
    },
  },
};

// --- Cart Logic ---

function getCart() {
  return JSON.parse(localStorage.getItem("bar-los-hermanos-cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("bar-los-hermanos-cart", JSON.stringify(cart));
  updateCartBadge();
  if (typeof updateNavbarCartCount === "function") updateNavbarCartCount();
}

function addToCart(name, price, img_url, removedIngredients = [], extras = []) {
  let cart = getCart();
  
  // Normalizar arrays para comparação (sort)
  const incomingRemoved = (removedIngredients || []).sort();
  const incomingExtras = (extras || []).slice().sort((a, b) => a.name.localeCompare(b.name));
  
  let item = cart.find((i) => {
      const existingRemoved = (i.removed || []).sort();
      const existingExtras = (i.extras || []).slice().sort((a, b) => a.name.localeCompare(b.name));
      
      const sameName = i.name === name;
      const sameRemoved = JSON.stringify(existingRemoved) === JSON.stringify(incomingRemoved);
      const sameExtras = JSON.stringify(existingExtras) === JSON.stringify(incomingExtras);
      
      return sameName && sameRemoved && sameExtras;
  });

  if (item) {
    item.quantity++;
  } else {
    cart.push({ 
      name, 
      price, 
      img_url, 
      quantity: 1, 
      removed: incomingRemoved,
      extras: incomingExtras
    });
  }
  saveCart(cart);
  console.log(`${name} adicionado ao carrinho!`, { extras: incomingExtras });
}
// Exposing globally for module access
window.addToCart = addToCart;

function updateCartBadge() {
  const badge = document.getElementById("cart-badge");
  const badgeCount = document.getElementById("cart-count");
  const cart = getCart();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (badge) badge.innerText = totalItems;
  if (badgeCount) badgeCount.innerText = totalItems;
}

function updateCartUI() {
  const container = document.getElementById("cart-items-container");
  const emptyMsg = document.getElementById("empty-cart-msg");
  const subtotalEl = document.getElementById("cart-subtotal");
  const totalEl = document.getElementById("cart-total");
  const checkoutTotalEl = document.getElementById("checkout-total");

  if (!container) return;

  let cart = getCart();

  if (cart.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    container.innerHTML = "";
    if (subtotalEl) subtotalEl.innerText = "R$ 0,00";
    if (totalEl) totalEl.innerText = "R$ 0,00";
    if (checkoutTotalEl) checkoutTotalEl.innerText = "R$ 0,00";
    return;
  }

  if (emptyMsg) emptyMsg.classList.add("hidden");
  container.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item, index) => {
    subtotal += item.price * item.quantity;
    
    // Fallback para imagem
    const imageUrl = item.img_url || item.image || 'assets/img/placeholder_food.png';
    
    const removedText = (item.removed && item.removed.length > 0) 
        ? `<div class="cart-item__extras">
             ${item.removed.map(ing => `<span class="cart-item__extra-tag">SEM ${ing}</span>`).join("")}
           </div>`
        : "";
    
    // Mostrar extras adicionados
    const extrasText = (item.extras && item.extras.length > 0)
        ? `<div class="cart-item__extras">
             ${item.extras.map(ext => `<span class="cart-item__extra-tag cart-item__extra-tag--added">+ ${ext.name}</span>`).join("")}
           </div>`
        : "";

    const itemHtml = `
            <div class="cart-item">
                <div class="cart-item__image" style="background-image: url('${imageUrl}');"></div>
                <div class="cart-item__content">
                    <div class="cart-item__header">
                        <h3 class="cart-item__name">${item.name}</h3>
                        <button class="cart-item__remove" onclick="removeFromCart(${index})">
                            <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                    ${removedText}
                    ${extrasText}
                    <div class="cart-item__footer">
                        <span class="cart-item__price">R$ ${(item.price * item.quantity).toFixed(2).replace(".", ",")}</span>
                        <div class="cart-item__quantity">
                            <button class="cart-item__qty-btn" onclick="changeQuantity(${index}, -1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
                            </button>
                            <span class="cart-item__qty-value">${item.quantity}</span>
                            <button class="cart-item__qty-btn cart-item__qty-btn--add" onclick="changeQuantity(${index}, 1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    container.innerHTML += itemHtml;
  });

  const delivery = subtotal > 0 ? 5.0 : 0.0;
  const total = subtotal + delivery;

  if (subtotalEl)
    subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace(".", ",")}`;
  if (totalEl) totalEl.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;
  if (checkoutTotalEl)
    checkoutTotalEl.innerText = `R$ ${total.toFixed(2).replace(".", ",")}`;

  updateCartBadge();

  // Notificar checkout se estiver na página de checkout
  if (typeof updateCheckoutTotals === "function") {
    updateCheckoutTotals();
  }
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

// --- Favorite Logic (Supabase Integration) ---

let currentUserFavs = []; // Cache local

async function loadFavorites() {
  const session = await checkSession();
  if (!session) return;

  // Buscar Favoritos do banco
  const { data, error } = await getFavorites(session.user.id);
  if (data) {
    currentUserFavs = data.map((f) => ({
      id: f.id,
      item_id: f.item_id,
      name: f.cardapio.nome,
      price: f.cardapio.valor,
      image: f.cardapio.img_url,
    }));
    updateFavoriteIcons();
    updateFavoritesUI();
  }
}

async function toggleFavorite(name, price, image) {
  const session = await checkSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  // Verificar se já é favorito
  const existingIndex = currentUserFavs.findIndex((f) => f.name === name);
  const btn = document.querySelector(
    `button[data-favorite-name="${name.replace(/"/g, '\\"')}"]`,
  );

  // Feedback visual imediato (Optimistic UI)
  if (btn) {
    const icon = btn.querySelector(".material-symbols-outlined");
    if (existingIndex > -1) {
      icon.style.fontVariationSettings = "'FILL' 0";
      icon.classList.remove("text-primary");
    } else {
      icon.style.fontVariationSettings = "'FILL' 1";
      icon.classList.add("text-primary");
    }
  }

  try {
    if (existingIndex > -1) {
      // Remover
      const itemId = currentUserFavs[existingIndex].item_id;
      await removeFavorite(session.user.id, itemId);
      currentUserFavs.splice(existingIndex, 1);
      console.log(`${name} removido dos favoritos`);
    } else {
      // Adicionar
      // Precisamos do ID do item. Se não tivermos, buscamos pelo nome.
      const { data: itemData } = await getItemIdByName(name);
      if (itemData) {
        await addFavorite(session.user.id, itemData.id);
        // Atualizar cache local com dados frescos ou mock
        currentUserFavs.push({
          item_id: itemData.id,
          name,
          price,
          image,
        });
        console.log(`${name} adicionado aos favoritos`);
      } else {
        console.error("Item não encontrado no banco para favoritar:", name);
      }
    }
    // Sincronizar UI final
    updateFavoritesUI();
    updateFavoriteIcons(); // Garante consistência
  } catch (e) {
    console.error("Erro ao atualizar favorito:", e);
    // Reverter UI em caso de erro (TBD)
  }
}

function isFavorite(name) {
  return currentUserFavs.some((f) => f.name === name);
}

function updateFavoriteIcons() {
  const favoriteButtons = document.querySelectorAll("[data-favorite-name]");
  favoriteButtons.forEach((btn) => {
    const name = btn.getAttribute("data-favorite-name");
    const icon = btn.querySelector(".material-symbols-outlined");
    if (icon) {
      if (isFavorite(name)) {
        icon.style.fontVariationSettings = "'FILL' 1";
        icon.classList.add("text-primary", "fill-1");
      } else {
        icon.style.fontVariationSettings = "'FILL' 0";
        icon.classList.remove("text-primary", "fill-1");
      }
    }
  });
}

function updateFavoritesUI() {
  const container = document.getElementById("favorites-container");
  if (!container) return;

  if (currentUserFavs.length === 0) {
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

  container.innerHTML = "";

  currentUserFavs.forEach((item) => {
    const itemHtml = `
            <div class="bg-card-dark rounded-2xl overflow-hidden border border-white/5 shadow-xl flex gap-4 p-3 relative mb-4">
                <div class="relative w-32 h-32 shrink-0">
                    <img alt="${item.name}" class="w-full h-full object-cover rounded-xl" src="${item.image || "assets/img/placeholder_food.png"}"/>
                </div>
                <div class="flex flex-col justify-between flex-1 py-1">
                    <div class="pr-8">
                        <h3 class="text-lg font-bold">${item.name}</h3>
                        <p class="text-slate-400 text-xs line-clamp-2">Item favorito do Bar Los Hermanos.</p>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-primary font-bold text-lg">R$ ${parseFloat(item.price).toFixed(2).replace(".", ",")}</span>
                        <button class="bg-primary text-white p-2 rounded-xl flex items-center justify-center hover:scale-95 transition-all" onclick="addToCart('${item.name}', ${item.price}, '${item.img_url}')">
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

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  updateCartUI();
  // Load favorites from DB instead of local storage
  if (window.supabaseClient) {
    loadFavorites();
  }
});
