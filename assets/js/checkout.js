/**
 * checkout.js - Lógica de Finalização de Pedido
 */

let currentUser = null;
let currentZone = null;
let currentCart = [];
let deliveryFee = 0;
let branchSelected = 'Bairro'; // Default

document.addEventListener('DOMContentLoaded', initCheckout);

async function initCheckout() {
    // 1. Verificar Sessão
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Carregar Carrinho
    currentCart = JSON.parse(localStorage.getItem('bar-los-hermanos-cart')) || [];
    if (currentCart.length === 0) {
        document.getElementById('empty-cart-msg').classList.remove('hidden');
        document.getElementById('empty-cart-msg').style.display = 'flex';
        document.getElementById('cart-items-container').innerHTML = '';
        updateTotals();
        return;
    }

    // 3. Renderizar Itens (Visual apenas, não editável aqui por simplificação)
    renderCheckoutItems();

    // 4. Carregar Dados do Usuário
    loadUserData(session.user.id);

    // 5. Configurar Botão Finalizar
    const btnFinish = document.querySelector('button[onclick="submitOrder()"]') || 
                      document.querySelector('button.w-full.bg-primary'); // Fallback se não tiver onclick
    if(btnFinish) {
        btnFinish.onclick = submitOrder;
        btnFinish.id = 'btn-finish';
    }
}

async function loadUserData(userId) {
    const { data: user, error } = await getUserProfile(userId);
    
    if (error || !user) {
        console.error('Erro ao carregar usuário', error);
        alert('Erro ao carregar seus dados. Tente recarregar.');
        return;
    }

    currentUser = user;

    // Preencher UI de Endereço
    const addressContainer = document.querySelector('.bg-card-dark .pl-7');
    if (addressContainer) {
        if (user.endereco_rua) {
            addressContainer.innerHTML = `
                <p class="text-sm text-white font-medium">${user.endereco_rua}, ${user.endereco_numero} ${user.endereco_complemento || ''}</p>
                <p class="text-xs text-[#cbad90]">${user.endereco_bairro} - Governador Valadares</p>
                <div class="mt-3 flex items-center gap-2 text-primary">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span class="text-xs font-bold" id="delivery-time">Calculando prazo...</span>
                </div>
            `;
            
            // Buscar Zona de Entrega para Taxa
            fetchDeliveryZone(user.endereco_bairro);

        } else {
            addressContainer.innerHTML = `
                <p class="text-sm text-red-400 font-medium">Endereço incompleto</p>
                <p class="text-xs text-[#cbad90]">Toque em alterar para configurar.</p>
            `;
        }
    }
}

async function fetchDeliveryZone(bairro) {
    const { data: zone, error } = await getDeliveryZone(bairro);
    
    if (zone) {
        currentZone = zone;
        deliveryFee = parseFloat(zone.taxa_entrega);
        
        // Atualizar UI de Taxa e Tempo
        const subtotalEl = document.querySelectorAll('.flex.justify-between.items-center.text-sm span.font-medium')[1]; // Hacky selector
        if(subtotalEl) subtotalEl.innerText = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;
        
        // Tempo estimado base (ex: 40 min) * multiplicador
        // Pegar maior tempo de preparo do carrinho
        let maxPrepTime = 25; // Default fallback
        // Idealmente teríamos o tempo de preparo no objeto do carrinho, mas no localStorage só tem nome/preço/img
        // Vamos assumir um tempo base médio de 30 min se não tiver info
        
        const estimatedTime = Math.ceil(30 * zone.multiplicador_tempo);
        document.getElementById('delivery-time').innerText = `Prazo Estimado: ${estimatedTime}-${estimatedTime+15} min`;

    } else {
        console.warn('Bairro não encontrado na zona de entrega:', bairro);
        deliveryFee = 0; // Ou bloquear entrega?
        document.getElementById('delivery-time').innerText = `Consulte taxa de entrega`;
        // Avisar user?
    }
    updateTotals();
}

function renderCheckoutItems() {
    const container = document.getElementById('cart-items-container');
    container.innerHTML = '';
    
    currentCart.forEach(item => {
        container.innerHTML += `
            <div class="flex items-center gap-4 bg-card-dark p-3 rounded-xl border border-white/5">
                <div class="bg-center bg-no-repeat bg-cover rounded-lg size-16 shrink-0" style='background-image: url("${item.image}");'></div>
                <div class="flex-1">
                    <h3 class="text-sm font-bold line-clamp-1">${item.name}</h3>
                    <div class="flex justify-between items-center mt-1">
                        <span class="text-xs text-white/60">Qtd: ${item.quantity}</span>
                        <span class="text-primary font-bold">R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            </div>
        `;
    });
}

function updateTotals() {
    let subtotal = currentCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    document.getElementById('cart-subtotal').innerText = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    
    // Atualizar Elemento Taxa se tiver ID correto, senão usa index (frágil)
    // Vamos assumir que o HTML será atualizado com IDs
    const taxaEl = document.getElementById('taxa-entrega'); 
    if(taxaEl) taxaEl.innerText = `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`;

    document.getElementById('checkout-total').innerText = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

async function submitOrder() {
    if (!currentUser || !currentUser.endereco_rua) {
        alert('Por favor, complete seu endereço de entrega.');
        return;
    }
    
    if (currentCart.length === 0) {
        alert('Seu carrinho está vazio.');
        return;
    }

    const btn = document.getElementById('btn-finish');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Enviando...';
    btn.disabled = true;

    try {
        // 1. Preparar Payload do Pedido
        let subtotal = currentCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        
        const orderPayload = {
            cliente_id: currentUser.id,
            status: 'pendente', // Default
            tipo_pedido: 'delivery', // Fixo por enquanto
            subtotal: subtotal,
            taxa_entrega: deliveryFee,
            desconto: 0,
            total: subtotal + deliveryFee,
            bairro_entrega: currentUser.endereco_bairro,
            zona_entrega_id: currentZone ? currentZone.id : null,
            endereco_entrega: {
                rua: currentUser.endereco_rua,
                numero: currentUser.endereco_numero,
                complemento: currentUser.endereco_complemento,
                bairro: currentUser.endereco_bairro
            },
            tempo_preparo_total: 30, // Mockado por enquanto (precisaria buscar do DB pra cada item)
            // tempo_entrega_estimado: calculado por trigger ou função DB? 
            // O DB tem trigger updated_at, mas não calculation auto on insert para esse campo complexo se não usarmos a função explicitamente.
            // Vamos deixar NULL e o admin/sistema atualiza, ou passar calculado aqui?
            // O ideal seria o Backend calcular, mas vamos enviar estimativa.
            tempo_entrega_estimado: Math.ceil(30 * (currentZone?.multiplicador_tempo || 1)),
            forma_pagamento: 'dinheiro_entrega', // Mockado (Falta UI de seleção real)
            observacoes: 'Pedido via App Web'
        };

        // 2. Inserir Pedido
        console.log('Enviando pedido:', orderPayload);
        const { data: orderData, error: orderError } = await createOrder(orderPayload);

        if (orderError) {
            throw new Error(orderError.message);
        }

        // 3. Inserir Itens
        // Precisamos do ID do item no banco (cardapio table). 
        // Problema: localStorage só tem nome.
        // Solução Robusta: Buscar IDs pelo nome ou carregar cardápio inteiro no inicio.
        // Solução Rápida (MVP): Vamos tentar buscar o ID fazendo match pelo nome na hora ou...
        // ...vamos salvar o Item ID no localStorage desde o inicio (melhor).
        // COMO NÃO TEMOS ID NO STORAGE AGORA, O INSERT VAI FALHAR SE A TABELA ITENS_PEDIDO EXIGIR FK VALIDA.
        // UPDATE: A tabela `itens_pedido` TEM `item_id INTEGER REFERENCES cardapio(id)`.
        // CRÍTICO: O carrinho atual NÃO tem o ID. 
        // WORKAROUND AGORA: Vamos ter que fazer uma busca reversa ou falhar.
        // -> Vamos assumir que precisamos corrigir o `orders.js` para salvar ID, mas para não quebrar agora,
        // vamos buscar o item pelo nome no DB antes de inserir.
        
        const itemsPayload = [];
        for (const cartItem of currentCart) {
            // Buscar ID do item no DB pelo nome (Lento, mas funcional pro MVP)
            const { data: dbItem } = await window.supabaseClient
                .from('cardapio')
                .select('id, tempo_preparo')
                .eq('nome', cartItem.name)
                .single();
            
            if (dbItem) {
                itemsPayload.push({
                    pedido_id: orderData.id,
                    item_id: dbItem.id,
                    item_cod: 'SKU-AUTO', // Deveria vir do DB
                    item_nome: cartItem.name,
                    item_valor: cartItem.price,
                    item_tempo_preparo: dbItem.tempo_preparo || 0,
                    quantidade: cartItem.quantity,
                    subtotal: cartItem.price * cartItem.quantity
                });
            } else {
                console.warn('Item não encontrado no DB:', cartItem.name);
                // Se não achar, o que fazer? Pular?
            }
        }

        if (itemsPayload.length > 0) {
            const { error: itemsError } = await createOrderItems(itemsPayload);
            if (itemsError) throw new Error('Erro ao salvar itens: ' + itemsError.message);
        }

        // 4. Sucesso
        alert('Pedido realizado com sucesso! Acompanhe no seu perfil.');
        localStorage.removeItem('bar-los-hermanos-cart'); // Limpar carrinho
        window.location.href = 'perfil.html';

    } catch (e) {
        console.error(e);
        // Tratamento específico para erro de horário (Trigger)
        if (e.message.includes('Estamos fechados')) {
            alert('🚫 O BAR ESTÁ FECHADO!\nHorário de funcionamento: Seg-Sáb 18h às 23h.');
        } else {
            alert('Erro ao finalizar pedido: ' + e.message);
        }
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
