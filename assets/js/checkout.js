/**
 * checkout.js - Lógica de Finalização de Pedido Aprimorada
 */

let currentUser = null;
let currentZone = null;
let deliveryFee = 0;
let deliveryMode = 'delivery'; // 'delivery' ou 'pickup'
let paymentMethod = 'online'; // 'online' ou 'cash'
let discountValue = 0;
let totalOrder = 0;

document.addEventListener('DOMContentLoaded', initCheckout);

async function initCheckout() {
    // 1. Verificar Sessão
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Carregar Dados do Usuário
    await loadUserData(session.user.id);

    // 3. Inicializar Carrinho (usando orders.js)
    if (typeof updateCartUI === 'function') {
        updateCartUI();
    } else {
        console.error('orders.js não carregado corretamente.');
    }

    // 4. Verificar Desconto Fidelidade
    await checkLoyaltyDiscount(session.user.id);

    // 5. Configurar Eventos e UI Inicial
    updateCheckoutTotals();
    
    // Configurar Botão Finalizar
    const btnFinish = document.getElementById('btn-finish') || document.querySelector('button[onclick="submitOrder()"]');
    if(btnFinish) {
        btnFinish.onclick = submitOrder;
        btnFinish.id = 'btn-finish';
    }
}

async function loadUserData(userId) {
    const { data: user, error } = await getUserProfile(userId);
    
    if (error || !user) {
        console.error('Erro ao carregar usuário', error);
        return;
    }

    currentUser = user;

    // Preencher UI de Endereço
    const addressDetails = document.getElementById('address-details');
    if (addressDetails) {
        if (user.endereco_rua) {
            addressDetails.innerHTML = `
                <p class="text-sm text-white font-medium">${user.endereco_rua}, ${user.endereco_numero} ${user.endereco_complemento || ''}</p>
                <p class="text-xs text-[#cbad90]">${user.endereco_bairro} - Governador Valadares</p>
                <div class="mt-3 flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span class="text-xs font-bold" id="delivery-time">Calculando prazo...</span>
                </div>
            `;
            
            // Buscar Zona de Entrega para Taxa
            await fetchDeliveryZone(user.endereco_bairro);

        } else {
            addressDetails.innerHTML = `
                <p class="text-sm text-red-400 font-medium whitespace-normal">Endereço incompleto no seu perfil.</p>
                <p class="text-xs text-[#cbad90]">Toque em alterar para configurar.</p>
            `;
        }
    }
}

async function fetchDeliveryZone(bairro) {
    if (!bairro) return;
    const { data: zone, error } = await getDeliveryZone(bairro);
    
    if (zone) {
        currentZone = zone;
        deliveryFee = parseFloat(zone.taxa_entrega);
        
        const estimatedTime = Math.ceil(30 * zone.multiplicador_tempo);
        const timeEl = document.getElementById('delivery-time');
        if(timeEl) timeEl.innerText = `Prazo Estimado: ${estimatedTime}-${estimatedTime+15} min`;
    } else {
        console.warn('Bairro não atendido:', bairro);
        deliveryFee = 15; // Taxa padrão se não achar? Ou alertar?
    }
    updateCheckoutTotals();
}

async function checkLoyaltyDiscount(userId) {
    try {
        // Contar pedidos concluídos do usuário
        const { count, error } = await window.supabaseClient
            .from('pedidos')
            .select('*', { count: 'exact', head: true })
            .eq('cliente_id', userId)
            .eq('status', 'concluido');

        if (!error && count >= 5) {
            console.log('Cliente Fidelidade detectado! 10% de desconto aplicado.');
            // O desconto será calculado sobre o subtotal no updateCheckoutTotals
            document.getElementById('discount-row').classList.remove('hidden');
            return true;
        } else {
            document.getElementById('discount-row').classList.add('hidden');
            return false;
        }
    } catch (e) {
        console.error('Erro ao verificar fidelidade:', e);
        return false;
    }
}

function setDeliveryMode(mode) {
    deliveryMode = mode;
    
    const btnDelivery = document.getElementById('btn-delivery-mode');
    const btnPickup = document.getElementById('btn-pickup-mode');
    const addressSection = document.getElementById('address-section');

    if (mode === 'delivery') {
        btnDelivery.className = "flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-primary text-white shadow-sm transition-all";
        btnPickup.className = "flex-1 py-3 px-4 rounded-xl text-sm font-bold text-[#8e7a65] hover:bg-white/5 transition-all";
        addressSection.classList.remove('hidden');
    } else {
        btnPickup.className = "flex-1 py-3 px-4 rounded-xl text-sm font-bold bg-primary text-white shadow-sm transition-all";
        btnDelivery.className = "flex-1 py-3 px-4 rounded-xl text-sm font-bold text-[#8e7a65] hover:bg-white/5 transition-all";
        addressSection.classList.add('hidden');
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

    if (method === 'online') {
        btnOnline.classList.add('border-primary/20');
        btnOnline.classList.remove('border-white/5');
        btnCash.classList.remove('border-primary/20');
        btnCash.classList.add('border-white/5');
        
        checkOnline.classList.remove('hidden');
        checkCash.classList.add('hidden');
        changeContainer.classList.add('hidden');
        
        textCash.classList.add('text-[#8e7a65]');
    } else {
        btnCash.classList.add('border-primary/20');
        btnCash.classList.remove('border-white/5');
        btnOnline.classList.remove('border-primary/20');
        btnOnline.classList.add('border-white/5');
        
        checkCash.classList.remove('hidden');
        checkOnline.classList.add('hidden');
        changeContainer.classList.remove('hidden');
        
        textCash.classList.remove('text-[#8e7a65]');
        textCash.classList.add('text-white');
    }
}

// Esta função é chamada globalmente por orders.js quando o carrinho muda
function updateCheckoutTotals() {
    const cart = JSON.parse(localStorage.getItem('bar-los-hermanos-cart')) || [];
    let subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    
    // 1. Taxa de Entrega
    let activeDeliveryFee = (deliveryMode === 'delivery') ? deliveryFee : 0;
    
    // 2. Desconto (Fidelidade 10%)
    let hasDiscount = !document.getElementById('discount-row').classList.contains('hidden');
    discountValue = hasDiscount ? (subtotal * 0.10) : 0;
    
    totalOrder = subtotal + activeDeliveryFee - discountValue;

    // Atualizar UI
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxaEl = document.getElementById('taxa-entrega');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('checkout-total');
    const deliveryRow = document.getElementById('delivery-row');

    if(subtotalEl) subtotalEl.innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    if(taxaEl) {
        taxaEl.innerText = activeDeliveryFee > 0 ? `R$ ${activeDeliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis';
        if(deliveryMode === 'pickup') deliveryRow.classList.add('opacity-50');
        else deliveryRow.classList.remove('opacity-50');
    }

    if(discountEl) discountEl.innerText = `- R$ ${discountValue.toFixed(2).replace('.', ',')}`;
    if(totalEl) totalEl.innerText = `R$ ${totalOrder.toFixed(2).replace('.', ',')}`;
}

async function submitOrder() {
    if (deliveryMode === 'delivery' && (!currentUser || !currentUser.endereco_rua)) {
        alert('Por favor, complete seu endereço de entrega no perfil.');
        return;
    }
    
    const cart = JSON.parse(localStorage.getItem('bar-los-hermanos-cart')) || [];
    if (cart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    const changeValue = document.getElementById('cash-change').value;
    if (paymentMethod === 'cash' && changeValue && parseFloat(changeValue) < totalOrder) {
        alert('O valor para troco deve ser maior que o total do pedido.');
        return;
    }

    const btn = document.getElementById('btn-finish');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Enviando...';
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
            bairro_entrega: deliveryMode === 'delivery' ? currentUser.endereco_bairro : 'RETIRADA',
            zona_entrega_id: (deliveryMode === 'delivery' && currentZone) ? currentZone.id : null,
            endereco_entrega: deliveryMode === 'delivery' ? {
                rua: currentUser.endereco_rua,
                numero: currentUser.endereco_numero,
                complemento: currentUser.endereco_complemento,
                bairro: currentUser.endereco_bairro
            } : { info: 'Retirada no Balcão' },
            forma_pagamento: paymentMethod === 'online' ? 'cartao_pix' : 'dinheiro',
            troco_para: (paymentMethod === 'cash' && changeValue) ? parseFloat(changeValue) : null,
            observacoes: 'Pedido via Web App'
        };

        const { data: orderData, error: orderError } = await createOrder(orderPayload);
        if (orderError) throw orderError;

        // Inserir Itens (Melhorado: Agora buscamos IDs antes)
        const itemsPayload = [];
        for (const cartItem of cart) {
            const { data: dbItem } = await window.supabaseClient
                .from('cardapio')
                .select('id, tempo_preparo')
                .eq('nome', cartItem.name)
                .single();
            
            if (dbItem) {
                let finalName = cartItem.name;
                if (cartItem.removed && cartItem.removed.length > 0) {
                    const modifications = cartItem.removed.map(r => r.toUpperCase()).join(', ');
                    finalName = `${cartItem.name} (SEM: ${modifications})`;
                }

                itemsPayload.push({
                    pedido_id: orderData.id,
                    item_id: dbItem.id,
                    item_cod: 'WEB', 
                    item_nome: finalName,
                    item_valor: cartItem.price,
                    item_tempo_preparo: dbItem.tempo_preparo || 0,
                    quantidade: cartItem.quantity,
                    subtotal: cartItem.price * cartItem.quantity
                });
            }
        }

        if (itemsPayload.length > 0) {
            const { error: itemsError } = await createOrderItems(itemsPayload);
            if (itemsError) throw itemsError;
        }

        alert('Pedido realizado com sucesso!');
        localStorage.removeItem('bar-los-hermanos-cart');
        window.location.href = 'perfil.html';

    } catch (e) {
        console.error(e);
        alert('Erro ao finalizar pedido: ' + (e.message || 'Erro desconhecido'));
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Expor funções para o HTML
window.setDeliveryMode = setDeliveryMode;
window.setPaymentMethod = setPaymentMethod;
window.updateCheckoutTotals = updateCheckoutTotals;
window.submitOrder = submitOrder;
