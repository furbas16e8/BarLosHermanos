// ============================================
// CART LOGIC V2 - Isolamento e Expiração
// ============================================
// CONSTANTES PRIMEIRO (evitar hoisting issues)
const CART_STORAGE_KEY = 'bar_los_hermanos_cart_v2';
const LEGACY_CART_KEY = 'bar-los-hermanos-cart';
const STORE_CLOSE_HOUR = 23; // Horário de fechamento da loja

// Tailwind config (deve vir depois ou ser movido para arquivo separado)
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: "class",
    theme: {
      extend: {
        colors: {
          primary: "#ff3131",
          "background-light": "#f8f7f5",
          "background-dark": "#000000",
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
}

/**
 * Obtém o ID do usuário atual logado
 * @returns {string|null} UUID do usuário ou null se não logado
 */
function getCurrentUserId() {
  // Primeiro tenta o cache global
  if (window.currentUserId) {
    return window.currentUserId;
  }
  
  // Tenta obter do localStorage como fallback (útil para recarregamento de página)
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw) {
      const cartData = JSON.parse(raw);
      if (cartData && cartData.userId) {
        // Verifica se o carrinho ainda é válido antes de usar o userId
        const cartDate = new Date(cartData.createdAt);
        const now = new Date();
        if (isSameDay(cartDate, now) && isBeforeClosingTime()) {
          window.currentUserId = cartData.userId;
          return cartData.userId;
        }
      }
    }
  } catch (e) {
    // Ignora erro
  }
  
  return null;
}

/**
 * Define o ID do usuário atual (chamado pelo listener de auth)
 * @param {string|null} userId 
 */
function setCurrentUserId(userId) {
  window.currentUserId = userId;
}

/**
 * Verifica se duas datas são do mesmo dia
 */
function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

/**
 * Verifica se o horário atual é antes do fechamento da loja (23:00)
 */
function isBeforeClosingTime() {
  const now = new Date();
  return now.getHours() < STORE_CLOSE_HOUR;
}

/**
 * Valida se o carrinho é válido (VERSÃO SIMPLIFICADA - sem auth)
 * @param {Object} cartData 
 * @returns {boolean}
 */
function isCartValid(cartData) {
  // Verificar estrutura mínima
  if (!cartData || !cartData.createdAt || !Array.isArray(cartData.items)) {
    console.log('[Cart] isCartValid: Estrutura inválida');
    return false;
  }

  // VERSÃO SIMPLIFICADA: Aceita carrinhos de guest ou sem userId
  // Não valida mais se o userId bate (já que não temos mais login obrigatório)
  console.log('[Cart] isCartValid: Cart userId:', cartData.userId);

  // Verificar se é do mesmo dia
  const cartDate = new Date(cartData.createdAt);
  const now = new Date();
  if (!isSameDay(cartDate, now)) {
    console.log('[Cart] Carrinho de outro dia detectado. Limpando...');
    return false;
  }

  // Verificar se já passou do horário de fechamento
  if (!isBeforeClosingTime()) {
    console.log('[Cart] Horário após fechamento (23h). Limpando carrinho...');
    return false;
  }

  return true;
}

/**
 * Limpa o carrinho do localStorage (VERSÃO SIMPLIFICADA)
 */
function clearCartStorage() {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CART_KEY);
  console.log('[Cart] Carrinho limpo do localStorage');
}

/**
 * Carrega os itens do carrinho (VERSÃO SIMPLIFICADA)
 * @returns {Array} Array de itens ou array vazio
 */
function getCart() {
  // Tenta chave nova primeiro
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  
  if (raw) {
    try {
      const cartData = JSON.parse(raw);
      console.log('[Cart] getCart: Carrinho encontrado (novo formato)', { userId: cartData.userId });
      
      if (!isCartValid(cartData)) {
        console.log('[Cart] getCart: Carrinho inválido, limpando');
        clearCartStorage();
        return [];
      }
      console.log('[Cart] getCart: Carrinho válido, items:', cartData.items.length);
      return cartData.items || [];
    } catch (e) {
      console.error('[Cart] Erro ao parsear carrinho:', e);
      clearCartStorage();
      return [];
    }
  }
  
  // Fallback: tenta chave legada
  const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
  if (legacyRaw) {
    try {
      const legacyItems = JSON.parse(legacyRaw);
      if (Array.isArray(legacyItems)) {
        console.log('[Cart] getCart: Carrinho encontrado (formato legado), items:', legacyItems.length);
        return legacyItems;
      }
    } catch (e) {
      console.error('[Cart] Erro ao parsear carrinho legado:', e);
    }
  }
  
  console.log('[Cart] getCart: Nenhum carrinho encontrado');
  return [];
}

/**
 * Salva o carrinho no localStorage (VERSÃO SIMPLIFICADA - sem auth)
 * @param {Array} items 
 */
function saveCart(items) {
  console.log('[Cart] saveCart chamado. Items:', items.length);
  
  // VERSÃO SIMPLIFICADA: Sem vinculação a usuário
  // Usa formato simples array ou formato antigo compatível
  const cartData = {
    userId: 'guest', // Marcador para identificar formato novo
    createdAt: new Date().toISOString(),
    items: items
  };

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
    // Também salva na chave legada para compatibilidade com checkout-guest.js
    localStorage.setItem(LEGACY_CART_KEY, JSON.stringify(items));
    console.log('[Cart] Carrinho salvo no localStorage');
  } catch (e) {
    console.error('[Cart] Erro ao salvar no localStorage:', e);
  }
  
  updateCartBadge();
  if (typeof updateNavbarCartCount === "function") updateNavbarCartCount();
}

/**
 * Migra carrinho legado se possível (mesmo usuário e mesmo dia)
 */
function migrateLegacyCart() {
  const legacyRaw = localStorage.getItem(LEGACY_CART_KEY);
  if (!legacyRaw) return;

  try {
    const legacyItems = JSON.parse(legacyRaw);
    if (Array.isArray(legacyItems) && legacyItems.length > 0) {
      const currentUserId = getCurrentUserId();
      if (currentUserId && isBeforeClosingTime()) {
        // Criar novo formato com dados do usuário atual
        const cartData = {
          userId: currentUserId,
          createdAt: new Date().toISOString(),
          items: legacyItems
        };
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartData));
        console.log('[Cart] Carrinho legado migrado com sucesso');
      }
    }
    // Sempre remove o legado após tentativa de migração
    localStorage.removeItem(LEGACY_CART_KEY);
  } catch (e) {
    console.error('[Cart] Erro ao migrar carrinho legado:', e);
    localStorage.removeItem(LEGACY_CART_KEY);
  }
}

// Expor funções globalmente
window.clearCartStorage = clearCartStorage;
window.getCurrentUserId = getCurrentUserId;
window.setCurrentUserId = setCurrentUserId;

async function addToCart(name, price, img_url, removedIngredients = [], extras = []) {
  console.log('[Cart] addToCart chamado:', { name, price });
  
  // VERSÃO SIMPLIFICADA: Sem verificação de login
  // O cadastro será feito apenas no checkout
  
  let cart = getCart();
  console.log('[Cart] Carrinho atual:', cart);
  
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
  console.log(`[Cart] ${name} adicionado ao carrinho! Total items:`, cart.reduce((a, b) => a + b.quantity, 0));
  
  // Feedback visual opcional
  // alert(`${name} adicionado ao carrinho!`);
}
// Exposing globally for module access (agora é async)
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
  // VERSÃO SIMPLIFICADA: Favoritos desabilitados sem cadastro
  // Como não temos mais login obrigatório, favoritos ficam para uma v2
  alert('💡 Faça um pedido primeiro! O sistema de favoritos estará disponível em breve.');
  return;

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

document.addEventListener("DOMContentLoaded", async () => {
  // Verificar sessão antes de carregar carrinho
  if (typeof checkSession === 'function') {
    const session = await checkSession();
    if (session && session.user) {
      setCurrentUserId(session.user.id);
      // Tenta migrar carrinho legado se existir
      migrateLegacyCart();
    } else {
      // Sem usuário logado, limpa referência
      setCurrentUserId(null);
    }
  }
  
  // Atualiza UI do carrinho (vai validar e limpar se necessário)
  updateCartBadge();
  updateCartUI();
  
  // Load favorites from DB instead of local storage
  if (window.supabaseClient) {
    loadFavorites();
  }
});
