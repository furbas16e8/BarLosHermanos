/**
 * checkout.js - Lógica de Finalização de Pedido (Refatorado para Vanilla CSS)
 * Suporte a Múltiplos Endereços (Fase 4c)
 */

let currentUser = null;
let currentZone = null;
let deliveryFee = 0;
let deliveryMode = 'delivery'; // 'delivery' ou 'pickup'
let paymentMethod = 'online'; // 'online' ou 'cash'
let discountValue = 0;
let totalOrder = 0;
let selectedAddress = null; // Endereço selecionado para entrega
let userAddresses = []; // Lista de endereços do usuário

document.addEventListener('DOMContentLoaded', initCheckout);

async function initCheckout() {
    // 1. Verificar Sessão
    if(!window.checkSession) {
        console.error("supabase-client.js logic missing");
        return;
    }
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Carregar Dados do Usuário e Endereços
    await loadUserData(session.user.id);
    await loadUserAddresses();

    // 3. Inicializar Carrinho
    if (typeof setCurrentUserId === 'function') {
        setCurrentUserId(session.user.id);
    }
    
    if (typeof updateCartUI === 'function') {
        const cart = typeof getCart === 'function' ? getCart() : [];
        if (cart.length === 0) {
            document.getElementById('cart-items-container').innerHTML = '';
            document.getElementById('empty-cart-msg').classList.remove('hidden');
        } else {
             renderCartItems(cart);
        }
    }

    // 4. Verificar Desconto
    await checkLoyaltyDiscount(session.user.id);

    // 5. Configurar Eventos
    updateCheckoutTotals();
    
    const btnFinish = document.getElementById('btn-finish');
    if(btnFinish) {
        btnFinish.onclick = submitOrder;
    }
}

function renderCartItems(cart) {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    
    cart.forEach((item, index) => {
        const imageUrl = item.img_url || item.image || 'assets/img/placeholder_food.png';
        
        const removedText = (item.removed && item.removed.length > 0) 
            ? `<div class="cart-item__extras">
                 ${item.removed.map(ing => `<span class="cart-item__extra-tag">SEM ${ing}</span>`).join("")}
               </div>`
            : "";
        
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
                        <h4 class="cart-item__name">${item.name}</h4>
                        <button onclick="removeItem(${index})" class="cart-item__remove">
                             <span class="material-symbols-outlined">delete</span>
                        </button>
                    </div>
                    ${removedText}
                    ${extrasText}
                    <div class="cart-item__footer">
                        <span class="cart-item__price">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                        <div class="cart-item__quantity">
                            <button class="cart-item__qty-btn" onclick="changeCartQuantity(${index}, -1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">remove</span>
                            </button>
                            <span class="cart-item__qty-value">${item.quantity}</span>
                            <button class="cart-item__qty-btn cart-item__qty-btn--add" onclick="changeCartQuantity(${index}, 1)">
                                <span class="material-symbols-outlined" style="font-size: 16px;">add</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += itemHtml;
    });
}

// Função para alterar quantidade no carrinho (checkout)
window.changeCartQuantity = function(index, delta) {
    let cart = typeof getCart === 'function' ? getCart() : [];
    
    if (cart[index]) {
        cart[index].quantity += delta;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        if (typeof saveCart === 'function') {
            saveCart(cart);
        }
        
        renderCartItems(cart);
        updateCheckoutTotals();
        
        if(window.updateNavbarCartCount) window.updateNavbarCartCount();
    }
};

window.removeItem = (index) => {
    let cart = typeof getCart === 'function' ? getCart() : [];
    cart.splice(index, 1);
    
    if (typeof saveCart === 'function') {
        saveCart(cart);
    }
    
    if(window.updateNavbarCartCount) window.updateNavbarCartCount();

    if(cart.length === 0) {
         document.getElementById('cart-items-container').innerHTML = '';
         document.getElementById('empty-cart-msg').classList.remove('hidden');
    } else {
         renderCartItems(cart);
    }
    updateCheckoutTotals();
};

async function loadUserData(userId) {
    const { data: user, error } = await getUserProfile(userId);
    if (error || !user) return;
    currentUser = user;
}

/**
 * Carregar endereços do usuário e inicializar seletor
 */
async function loadUserAddresses() {
    try {
        const { data: addresses, error } = await addressesAPI.getUserAddresses();
        
        if (error) {
            console.error('Erro ao carregar endereços:', error);
            renderNoAddresses();
            return;
        }
        
        userAddresses = addresses || [];
        
        if (userAddresses.length === 0) {
            renderNoAddresses();
        } else {
            // Selecionar o padrão automaticamente
            selectedAddress = userAddresses.find(a => a.is_padrao) || userAddresses[0];
            renderAddressSelector();
            updateAddressDisplay();
        }
    } catch (err) {
        console.error('Erro ao carregar endereços:', err);
        renderNoAddresses();
    }
}

/**
 * Renderizar botão de alterar endereço (simplificado - sem dropdown)
 */
function renderAddressSelector() {
    // Não renderiza mais dropdown - apenas o botão ALTERAR na UI
    // O usuário altera o endereço na página address.html
}

/**
 * Redirecionar para página de endereços
 */
function redirectToAddressPage() {
    window.location.href = 'address.html';
}

/**
 * Atualizar exibição do endereço selecionado
 */
async function updateAddressDisplay() {
    const addressDetails = document.getElementById('address-details');
    if (!addressDetails) return;
    
    if (!selectedAddress) {
        renderNoAddresses();
        return;
    }
    
    // Calcular tempo estimado
    await fetchDeliveryZone(selectedAddress.bairro);
    
    const timeText = currentZone 
        ? `${Math.ceil(30 * currentZone.multiplicador_tempo)}-${Math.ceil(30 * currentZone.multiplicador_tempo) + 15} min`
        : '30-45 min';
    
    addressDetails.innerHTML = `
        <div class="flex justify-between items-start mb-3">
            <div class="space-y-1 flex-1">
                ${selectedAddress.apelido ? `
                    <p class="text-xs text-primary font-bold uppercase tracking-wider">${selectedAddress.apelido}</p>
                ` : ''}
                <p class="text-sm text-white font-medium">${selectedAddress.rua}, ${selectedAddress.numero} ${selectedAddress.complemento || ''}</p>
                <p class="text-xs text-[#cbad90]">${selectedAddress.bairro} - Governador Valadares</p>
            </div>
            <button onclick="redirectToAddressPage()" class="text-xs text-primary font-bold uppercase tracking-wider hover:text-primary/80 transition-colors ml-4">
                ALTERAR
            </button>
        </div>
        <div class="flex items-center gap-2 text-primary">
            <span class="material-symbols-outlined text-sm">schedule</span>
            <span class="text-xs font-bold">Entrega em: ${timeText}</span>
        </div>
    `;
}

/**
 * Renderizar estado sem endereços
 */
function renderNoAddresses() {
    const addressDetails = document.getElementById('address-details');
    if (!addressDetails) return;
    
    addressDetails.innerHTML = `
        <div class="flex justify-between items-center py-4">
            <div>
                <p class="text-sm text-red-400 font-medium mb-1">Nenhum endereço cadastrado</p>
                <p class="text-xs text-slate-400">Cadastre um endereço para continuar</p>
            </div>
            <button onclick="redirectToAddressPage()" class="text-xs text-primary font-bold uppercase tracking-wider hover:text-primary/80 transition-colors">
                CADASTRAR
            </button>
        </div>
    `;
    
    deliveryFee = 0;
    updateCheckoutTotals();
}

async function fetchDeliveryZone(bairro) {
    if (!bairro) return;
    const { data: zone } = await getDeliveryZone(bairro);
    if (zone) {
        currentZone = zone;
        deliveryFee = parseFloat(zone.taxa_entrega);
    } else {
        deliveryFee = 15; 
    }
    updateCheckoutTotals();
}

async function checkLoyaltyDiscount(userId) {
    try {
        const { count, error } = await window.supabaseClient
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', userId)
            .eq('status', 'concluido');

        const discountRow = document.getElementById('discount-row');
        if (!error && count >= 5) {
            discountRow.classList.remove('hidden');
        } else {
            discountRow.classList.add('hidden');
        }
    } catch (e) { console.error(e); }
}

function setDeliveryMode(mode) {
    deliveryMode = mode;
    
    const btnDelivery = document.getElementById('btn-delivery-mode');
    const btnPickup = document.getElementById('btn-pickup-mode');
    const addressSection = document.getElementById('address-section');

    if (!btnDelivery || !btnPickup) return;

    btnDelivery.classList.remove('delivery-btn--active');
    btnPickup.classList.remove('delivery-btn--active');

    if (mode === 'delivery') {
        btnDelivery.classList.add('delivery-btn--active');
        if (addressSection) addressSection.classList.remove('hidden');
    } else {
        btnPickup.classList.add('delivery-btn--active');
        if (addressSection) addressSection.classList.add('hidden');
    }
    updateCheckoutTotals();
}

function setPaymentMethod(method) {
    paymentMethod = method;
    
    const btnOnline = document.getElementById('pay-online');
    const btnCash = document.getElementById('pay-cash');
    const checkOnline = document.getElementById('check-online');
    const checkCash = document.getElementById('check-cash');
    const changeContainer = document.getElementById('change-container');
    const textCash = document.getElementById('text-cash');

    if (!btnOnline || !btnCash) return;

    btnOnline.classList.remove('payment-option--selected');
    btnCash.classList.remove('payment-option--selected');

    if (method === 'online') {
        btnOnline.classList.add('payment-option--selected');
        
        if (checkOnline) checkOnline.classList.remove('hidden');
        if (checkCash) checkCash.classList.add('hidden');
        if (changeContainer) changeContainer.classList.add('hidden');
        if (textCash) textCash.style.color = 'var(--color-text-secondary)';
    } else {
        btnCash.classList.add('payment-option--selected');
        
        if (checkCash) checkCash.classList.remove('hidden');
        if (checkOnline) checkOnline.classList.add('hidden');
        if (changeContainer) changeContainer.classList.remove('hidden');
        if (textCash) textCash.style.color = 'var(--color-white)';
    }
}

function updateCheckoutTotals() {
    const cart = typeof getCart === 'function' ? getCart() : [];
    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    let activeDeliveryFee = (deliveryMode === 'delivery') ? deliveryFee : 0;
    
    const discountRow = document.getElementById('discount-row');
    let hasDiscount = discountRow && !discountRow.classList.contains('hidden');
    discountValue = hasDiscount ? (subtotal * 0.10) : 0;
    
    totalOrder = subtotal + activeDeliveryFee - discountValue;

    const subtotalEl = document.getElementById('cart-subtotal');
    const taxaEl = document.getElementById('taxa-entrega');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('checkout-total');
    
    if(subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    if(taxaEl) taxaEl.innerText = activeDeliveryFee > 0 ? `R$ ${activeDeliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis';
    if(discountEl) discountEl.innerText = `- R$ ${discountValue.toFixed(2).replace('.', ',')}`;
    if(totalEl) totalEl.innerText = `R$ ${totalOrder.toFixed(2).replace('.', ',')}`;
}

async function submitOrder() {
    // Validação de endereço para delivery
    if (deliveryMode === 'delivery') {
        if (!selectedAddress) {
            alert('Cadastre um endereço de entrega.');
            window.location.href = 'address.html';
            return;
        }
        
        if (!currentZone) {
            alert('Bairro não atendido para entrega.');
            return;
        }
    }
    
    const cart = typeof getCart === 'function' ? getCart() : [];
    if (cart.length === 0) {
        alert('Carrinho vazio.');
        return;
    }

    const changeInput = document.getElementById('cash-change');
    const changeValue = changeInput ? changeInput.value : null;

    if (paymentMethod === 'cash' && changeValue && parseFloat(changeValue) < totalOrder) {
        alert('Troco deve ser maior que o total.');
        return;
    }

    const btn = document.getElementById('btn-finish');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Enviando...';
    btn.disabled = true;

    try {
        let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        const orderPayload = {
            cliente_id: currentUser.id,
            status: 'pendente',
            tipo_pedido: deliveryMode,
            subtotal: subtotal,
            taxa_entrega: (deliveryMode === 'delivery' ? deliveryFee : 0),
            desconto: discountValue,
            total: totalOrder,
            bairro_entrega: deliveryMode === 'delivery' ? selectedAddress.bairro : 'RETIRADA',
            zona_entrega_id: (deliveryMode === 'delivery' && currentZone) ? currentZone.id : null,
            endereco_id: deliveryMode === 'delivery' ? selectedAddress.id : null, // NOVO: Referência ao endereço
            endereco_entrega: deliveryMode === 'delivery' ? {
                rua: selectedAddress.rua,
                numero: selectedAddress.numero,
                complemento: selectedAddress.complemento,
                bairro: selectedAddress.bairro,
                cidade: selectedAddress.cidade,
                estado: selectedAddress.estado
            } : { info: 'Retirada no Balcão' },
            forma_pagamento: paymentMethod === 'online' ? 'cartao_pix' : 'dinheiro',
            troco_para: (paymentMethod === 'cash' && changeValue) ? parseFloat(changeValue) : null,
            observacoes: 'App Web'
        };

        const { data: orderData, error: orderError } = await createOrder(orderPayload);
        if (orderError) throw orderError;

        alert('Pedido realizado!');
        
        if (typeof clearCartStorage === 'function') {
            clearCartStorage();
        } else {
            localStorage.removeItem('bar_los_hermanos_cart_v2');
            localStorage.removeItem('bar-los-hermanos-cart');
        }
        window.location.href = 'perfil.html';

    } catch (e) {
        console.error(e);
        alert('Erro: ' + e.message);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Expose
window.setDeliveryMode = setDeliveryMode;
window.setPaymentMethod = setPaymentMethod;
window.submitOrder = submitOrder;
window.redirectToAddressPage = redirectToAddressPage;
window.setBranch = (branch) => {
    localStorage.setItem('selected-branch', branch);
    updateBranchUI();
}

function updateBranchUI() {
    const selected = localStorage.getItem('selected-branch') || 'Bairro';
    const btnBairro = document.getElementById('btn-branch-bairro');
    const btnCentro = document.getElementById('btn-branch-centro');
    
    if (!btnBairro || !btnCentro) return;
    
    btnBairro.classList.remove('branch-option--selected');
    btnCentro.classList.remove('branch-option--selected');

    if (selected === 'Bairro') btnBairro.classList.add('branch-option--selected');
    else btnCentro.classList.add('branch-option--selected');
}

document.addEventListener('DOMContentLoaded', updateBranchUI);
