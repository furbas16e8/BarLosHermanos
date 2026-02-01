/**
 * Checkout Guest - Cadastro simplificado no modal
 * Fluxo: Usuário só insere dados ao finalizar pedido
 */

// ============================================================
// ESTADO GLOBAL DO CHECKOUT
// ============================================================

const checkoutStateGlobal = {
    tipoEntrega: 'entrega', // 'entrega' ou 'retirada'
    formaPagamento: 'pix',
    trocoPara: null,
    telefone: '',
    nome: '',
    endereco: null,
    observacoes: '',
    dadosCompletos: false
};

// ============================================================
// FUNÇÕES DA PÁGINA DO CARRINHO
// ============================================================

function selecionarTipoEntrega(tipo) {
    checkoutStateGlobal.tipoEntrega = tipo;
    
    // Atualiza UI
    document.querySelectorAll('.delivery-option').forEach(btn => {
        btn.classList.toggle('delivery-option--active', btn.dataset.value === tipo);
    });
    
    // Atualiza taxa
    if (tipo === 'retirada') {
        checkoutStateGlobal.taxaEntrega = 0;
        document.getElementById('delivery-row').style.display = 'none';
    } else {
        document.getElementById('delivery-row').style.display = 'flex';
        // Recalcula com bairro selecionado
        const bairroSelect = document.getElementById('checkout-bairro');
        if (bairroSelect && bairroSelect.value) {
            calcularTaxaEntregaGlobal();
        }
    }
    
    atualizarTotalCarrinho();
    
    // Atualiza texto do botão
    atualizarTextoBotao();
    
    // Salva no localStorage
    salvarEstadoCheckout();
}

function atualizarFormaPagamento(forma) {
    checkoutStateGlobal.formaPagamento = forma;
    
    // Mostra/esconde campo de troco
    const trocoContainer = document.getElementById('cart-troco-container');
    if (trocoContainer) {
        trocoContainer.style.display = forma === 'dinheiro' ? 'block' : 'none';
    }
    
    salvarEstadoCheckout();
}

function atualizarTroco(valor) {
    checkoutStateGlobal.trocoPara = valor ? parseFloat(valor) : null;
    salvarEstadoCheckout();
}

function atualizarTextoBotao() {
    const btnText = document.getElementById('btn-finish-text');
    if (!btnText) return;
    
    if (checkoutStateGlobal.tipoEntrega === 'retirada') {
        btnText.textContent = 'Identificação';
    } else {
        btnText.textContent = 'Endereço de Entrega';
    }
}

function calcularTaxaEntregaGlobal() {
    // Implementado depois quando bairros são carregados
}

function atualizarTotalCarrinho() {
    // Calcula subtotal do carrinho
    let cart = [];
    const rawNew = localStorage.getItem('bar_los_hermanos_cart_v2');
    if (rawNew) {
        try {
            const parsed = JSON.parse(rawNew);
            cart = parsed.items || [];
        } catch (e) {}
    } else {
        const rawLegacy = localStorage.getItem('bar-los-hermanos-cart');
        if (rawLegacy) {
            try {
                cart = JSON.parse(rawLegacy);
                if (!Array.isArray(cart)) cart = [];
            } catch (e) {}
        }
    }
    
    const subtotal = cart.reduce((sum, item) => {
        const preco = item.preco || item.price || 0;
        const qtd = item.quantidade || item.quantity || 1;
        return sum + (preco * qtd);
    }, 0);
    
    const taxa = checkoutStateGlobal.tipoEntrega === 'retirada' ? 0 : (checkoutStateGlobal.taxaEntrega || 0);
    const total = subtotal + taxa;
    
    // Atualiza UI
    const subtotalEl = document.getElementById('cart-subtotal');
    const taxaEl = document.getElementById('taxa-entrega');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = formatarPreco(subtotal);
    if (taxaEl) taxaEl.textContent = formatarPreco(taxa);
    if (totalEl) totalEl.textContent = formatarPreco(total);
}

function formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function salvarEstadoCheckout() {
    localStorage.setItem('bar-los-hermanos-checkout-state', JSON.stringify(checkoutStateGlobal));
}

function carregarEstadoCheckout() {
    const raw = localStorage.getItem('bar-los-hermanos-checkout-state');
    if (raw) {
        try {
            const estado = JSON.parse(raw);
            Object.assign(checkoutStateGlobal, estado);
            
            // Restaura UI
            if (estado.tipoEntrega) {
                selecionarTipoEntrega(estado.tipoEntrega);
            }
            if (estado.formaPagamento) {
                // Marca o radio correto
                const radio = document.querySelector(`input[name="forma-pagamento-cart"][value="${estado.formaPagamento}"]`);
                if (radio) radio.checked = true;
                atualizarFormaPagamento(estado.formaPagamento);
            }
            if (estado.trocoPara) {
                const inputTroco = document.getElementById('cart-troco');
                if (inputTroco) inputTroco.value = estado.trocoPara;
            }
            
            // Se tem dados do cliente, mostra
            if (estado.dadosCompletos) {
                mostrarDadosCliente(estado);
            }
        } catch (e) {
            console.error('Erro ao carregar estado:', e);
        }
    }
}

function mostrarDadosCliente(dados) {
    const section = document.getElementById('cart-dados-cliente');
    const telefoneEl = document.getElementById('cart-dados-telefone');
    const nomeEl = document.getElementById('cart-dados-nome');
    const enderecoEl = document.getElementById('cart-dados-endereco');
    const enderecoRow = document.getElementById('cart-dados-endereco-row');
    const btnText = document.getElementById('btn-finish-text');
    
    if (section) section.style.display = 'block';
    if (telefoneEl) telefoneEl.textContent = formatarTelefoneExibicao(dados.telefone);
    if (nomeEl) nomeEl.textContent = dados.nome;
    
    if (dados.tipoEntrega === 'retirada') {
        if (enderecoRow) enderecoRow.style.display = 'none';
    } else if (dados.endereco) {
        if (enderecoRow) enderecoRow.style.display = 'flex';
        if (enderecoEl) {
            const end = dados.endereco;
            enderecoEl.textContent = `${end.rua}, ${end.numero}${end.complemento ? ' - ' + end.complemento : ''} - ${end.bairro}`;
        }
    }
    
    // Muda botão para Finalizar
    if (btnText) btnText.textContent = 'Finalizar Pedido';
    
    // Atualiza o onclick do botão
    const btn = document.getElementById('btn-finish');
    if (btn) {
        btn.onclick = finalizarPedidoCompleto;
    }
}

function formatarTelefoneExibicao(telefone) {
    if (!telefone || telefone.length !== 11) return telefone;
    const ddd = telefone.slice(0, 2);
    const parte1 = telefone.slice(2, 7);
    const parte2 = telefone.slice(7, 11);
    return `(${ddd}) ${parte1}-${parte2}`;
}

// ============================================================
// UTILITÁRIOS DE FORMATAÇÃO
// ============================================================

/**
 * Formata o DDD (apenas 2 dígitos)
 */
function formatarDDD(valor) {
    return valor.replace(/\D/g, '').slice(0, 2);
}

/**
 * Formata o número de telefone
 * - Remove não-dígitos
 * - Limita a 9 dígitos (aceita 8 ou 9)
 * - Retorna objeto com número formatado e status
 */
function formatarNumeroTelefone(valor) {
    let numero = valor.replace(/\D/g, '');
    
    // Limita a 9 dígitos (permite digitar 8 ou 9)
    numero = numero.slice(0, 9);
    
    return {
        numero: numero,
        isValido: numero.length === 8 || numero.length === 9
    };
}

/**
 * Concatena DDD + Número para o formato do banco
 * Ex: "11" + "987654321" = "11987654321"
 * Se número tiver 8 dígitos, adiciona '9' na frente
 */
function montarTelefoneCompleto(ddd, numero) {
    // Se tiver 8 dígitos, adiciona 9 no início
    if (numero.length === 8) {
        numero = '9' + numero;
    }
    return ddd + numero;
}

/**
 * Formata telefone para exibição: (11) 98765-4321
 */
function formatarTelefoneExibicao(telefoneCompleto) {
    if (!telefoneCompleto || telefoneCompleto.length !== 11) return telefoneCompleto;
    const ddd = telefoneCompleto.slice(0, 2);
    const parte1 = telefoneCompleto.slice(2, 7);
    const parte2 = telefoneCompleto.slice(7, 11);
    return `(${ddd}) ${parte1}-${parte2}`;
}

/**
 * Valida se o formulário está completo
 */
function validarFormularioCheckout(dados) {
    const erros = [];
    
    if (!dados.ddd || dados.ddd.length !== 2) {
        erros.push('DDD inválido');
    }
    
    if (!dados.numero || (dados.numero.length !== 8 && dados.numero.length !== 9)) {
        erros.push('Número de telefone inválido');
    }
    
    if (!dados.nome || dados.nome.trim().length < 2) {
        erros.push('Nome é obrigatório');
    }
    
    // Só valida endereço se for entrega
    if (dados.tipoEntrega === 'entrega') {
        if (!dados.rua || dados.rua.trim().length < 3) {
            erros.push('Rua é obrigatória');
        }
        if (!dados.numeroEndereco || dados.numeroEndereco.trim().length < 1) {
            erros.push('Número é obrigatório');
        }
        if (!dados.bairro || dados.bairro.trim().length < 2) {
            erros.push('Bairro é obrigatório');
        }
    }
    
    return {
        valido: erros.length === 0,
        erros: erros
    };
}

// ============================================================
// API SUPABASE
// ============================================================

/**
 * Busca usuário por telefone completo
 * Retorna: { user, adress } ou null
 */
async function buscarUsuarioPorTelefone(telefoneCompleto) {
    try {
        console.log('[Checkout] Buscando usuário:', telefoneCompleto);
        
        // Busca usuário
        const { data: user, error: userError } = await supabaseClient
            .from('users')
            .select('id, telefone, nome, created_at')
            .eq('telefone', telefoneCompleto)
            .maybeSingle();
        
        if (userError) {
            console.error('[Checkout] Erro ao buscar usuário:', userError);
            return null;
        }
        
        if (!user) {
            console.log('[Checkout] Usuário não encontrado');
            return null;
        }
        
        console.log('[Checkout] Usuário encontrado:', user.nome);
        
        // Busca endereço
        const { data: adress, error: adressError } = await supabaseClient
            .from('adress')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
        
        if (adressError) {
            console.error('[Checkout] Erro ao buscar endereço:', adressError);
        }
        
        return { user, adress };
    } catch (error) {
        console.error('Erro em buscarUsuarioPorTelefone:', error);
        return null;
    }
}

/**
 * Cria ou atualiza usuário
 */
async function salvarUsuario(telefoneCompleto, nome) {
    try {
        console.log('[Checkout] Salvando usuário:', telefoneCompleto, nome);
        
        // Tenta buscar usuário existente
        const { data: existente, error: searchError } = await supabaseClient
            .from('users')
            .select('id')
            .eq('telefone', telefoneCompleto)
            .maybeSingle();
        
        if (searchError) {
            console.error('[Checkout] Erro ao buscar usuário existente:', searchError);
        }
        
        if (existente) {
            console.log('[Checkout] Usuário existente, atualizando...');
            // Atualiza nome se mudou
            const { data: user, error } = await supabaseClient
                .from('users')
                .update({ nome: nome, updated_at: new Date().toISOString() })
                .eq('id', existente.id)
                .select()
                .single();
            
            if (error) throw error;
            return user;
        } else {
            console.log('[Checkout] Criando novo usuário...');
            // Cria novo usuário
            const { data: user, error } = await supabaseClient
                .from('users')
                .insert([{
                    telefone: telefoneCompleto,
                    nome: nome
                }])
                .select()
                .single();
            
            if (error) throw error;
            return user;
        }
    } catch (error) {
        console.error('Erro em salvarUsuario:', error);
        throw error;
    }
}

/**
 * Cria ou atualiza endereço
 */
async function salvarEndereco(userId, enderecoData) {
    try {
        console.log('[Checkout] Salvando endereço para user:', userId);
        
        const { data: existente, error: searchError } = await supabaseClient
            .from('adress')
            .select('id')
            .eq('user_id', userId)
            .maybeSingle();
        
        if (searchError) {
            console.error('[Checkout] Erro ao buscar endereço existente:', searchError);
        }
        
        const payload = {
            user_id: userId,
            rua: enderecoData.rua,
            numero: enderecoData.numero,
            complemento: enderecoData.complemento || null,
            bairro: enderecoData.bairro
        };
        
        if (existente) {
            console.log('[Checkout] Atualizando endereço existente...');
            const { data: adress, error } = await supabaseClient
                .from('adress')
                .update(payload)
                .eq('id', existente.id)
                .select()
                .single();
            
            if (error) throw error;
            return adress;
        } else {
            console.log('[Checkout] Criando novo endereço...');
            const { data: adress, error } = await supabaseClient
                .from('adress')
                .insert([payload])
                .select()
                .single();
            
            if (error) throw error;
            return adress;
        }
    } catch (error) {
        console.error('Erro em salvarEndereco:', error);
        throw error;
    }
}

/**
 * Cria o pedido no banco
 */
async function criarPedido(pedidoData) {
    try {
        // 1. Salvar/atualizar usuário
        const user = await salvarUsuario(pedidoData.telefone, pedidoData.nome);
        
        // 2. Salvar/atualizar endereço (se for entrega)
        let enderecoSalvo = null;
        if (pedidoData.tipoEntrega === 'entrega' && pedidoData.endereco) {
            enderecoSalvo = await salvarEndereco(user.id, pedidoData.endereco);
        }
        
        // 3. Montar payload do pedido
        const enderecoJson = pedidoData.tipoEntrega === 'entrega' ? {
            rua: pedidoData.endereco.rua,
            numero: pedidoData.endereco.numero,
            complemento: pedidoData.endereco.complemento || null,
            bairro: pedidoData.endereco.bairro
        } : null;
        
        const orderPayload = {
            user_id: user.id,
            telefone: pedidoData.telefone,
            nome_cliente: pedidoData.nome,
            endereco_entrega: enderecoJson,
            tipo_entrega: pedidoData.tipoEntrega,
            subtotal: pedidoData.subtotal,
            taxa_entrega: pedidoData.taxaEntrega || 0,
            desconto: pedidoData.desconto || 0,
            total: pedidoData.total,
            forma_pagamento: pedidoData.formaPagamento,
            troco_para: pedidoData.trocoPara || null,
            status: 'novo',
            observacoes: pedidoData.observacoes || null
        };
        
        // 4. Inserir pedido
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .insert([orderPayload])
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // 5. Inserir itens do pedido
        if (pedidoData.itens && pedidoData.itens.length > 0) {
            const itensPayload = pedidoData.itens.map(item => {
                // Normaliza nomes dos campos (suporta inglês e português)
                const nome = item.nome || item.name || 'Produto';
                const preco = item.preco || item.price || 0;
                const qtd = item.quantidade || item.quantity || 1;
                
                return {
                    order_id: order.id,
                    nome_cliente: pedidoData.nome, // Denormalizado para facilitar consultas
                    produto_id: item.id || null,
                    produto_cod: item.cod || null,
                    produto_nome: nome,
                    produto_categoria: item.categoria || item.category || null,
                    quantidade: qtd,
                    preco_unitario: preco,
                    total_item: preco * qtd,
                    observacoes: item.observacoes || item.observations || null,
                    extras: item.extras || []
                };
            });
            
            const { error: itemsError } = await supabaseClient
                .from('order_items')
                .insert(itensPayload);
            
            if (itemsError) throw itemsError;
        }
        
        return { success: true, orderId: order.id };
    } catch (error) {
        console.error('Erro em criarPedido:', error);
        throw error;
    }
}

// ============================================================
// CONTROLE DO MODAL
// ============================================================

let checkoutModal = null;
let checkoutState = {
    buscando: false,
    usuarioExistente: null,
    tipoEntrega: 'entrega',
    carrinho: [],
    subtotal: 0,
    taxaEntrega: 0,
    total: 0
};

/**
 * Inicializa o modal de checkout
 */
function initCheckoutModal() {
    checkoutModal = document.getElementById('checkout-modal');
    if (!checkoutModal) {
        console.error('Modal de checkout não encontrado');
        return;
    }
    
    setupEventListeners();
    carregarCarrinho();
}

/**
 * Carrega dados do carrinho (VERSÃO CORRIGIDA)
 */
function carregarCarrinho() {
    try {
        let cart = [];
        
        // Tenta chave nova primeiro
        const rawNew = localStorage.getItem('bar_los_hermanos_cart_v2');
        if (rawNew) {
            const parsed = JSON.parse(rawNew);
            cart = parsed.items || [];
        } else {
            // Fallback para chave legada
            const rawLegacy = localStorage.getItem('bar-los-hermanos-cart');
            if (rawLegacy) {
                cart = JSON.parse(rawLegacy);
                if (!Array.isArray(cart)) cart = [];
            }
        }
        
        // Normaliza os dados (converte campos inglês -> português)
        checkoutState.carrinho = cart.map(item => ({
            ...item,
            nome: item.nome || item.name || 'Produto',
            quantidade: item.quantidade || item.quantity || 1,
            preco: item.preco || item.price || 0,
            categoria: item.categoria || item.category || null
        }));
        
        checkoutState.subtotal = checkoutState.carrinho.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        checkoutState.total = checkoutState.subtotal + checkoutState.taxaEntrega;
        
        atualizarResumoPedido();
        atualizarResumoModal();
    } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
    }
}

/**
 * Atualiza o resumo no modal
 */
function atualizarResumoModal() {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxaEl = document.getElementById('checkout-taxa');
    const totalModalEl = document.getElementById('checkout-total-modal');
    
    if (subtotalEl) subtotalEl.textContent = formatarPreco(checkoutState.subtotal);
    if (taxaEl) taxaEl.textContent = formatarPreco(checkoutState.taxaEntrega);
    if (totalModalEl) totalModalEl.textContent = formatarPreco(checkoutState.total);
    
    // Atualiza também os elementos da página principal
    const pageSubtotal = document.getElementById('cart-subtotal');
    const pageTotal = document.getElementById('checkout-total');
    const pageTaxa = document.getElementById('taxa-entrega');
    
    if (pageSubtotal) pageSubtotal.textContent = formatarPreco(checkoutState.subtotal);
    if (pageTotal) pageTotal.textContent = formatarPreco(checkoutState.total);
    if (pageTaxa) pageTaxa.textContent = formatarPreco(checkoutState.taxaEntrega);
}

/**
 * Atualiza o resumo do pedido no modal
 */
function atualizarResumoPedido() {
    const subtotalEl = document.getElementById('checkout-subtotal');
    const taxaEl = document.getElementById('checkout-taxa');
    const totalEl = document.getElementById('checkout-total');
    
    if (subtotalEl) subtotalEl.textContent = formatarPreco(checkoutState.subtotal);
    if (taxaEl) taxaEl.textContent = formatarPreco(checkoutState.taxaEntrega);
    if (totalEl) totalEl.textContent = formatarPreco(checkoutState.total);
}

/**
 * Formata preço para exibição
 */
function formatarPreco(valor) {
    return `R$ ${valor.toFixed(2).replace('.', ',')}`;
}

/**
 * Abre o modal de checkout
 * Configura baseado no tipo de entrega selecionado na página
 */
function abrirCheckoutModal() {
    if (!checkoutModal) {
        initCheckoutModal();
    }
    
    // Recarrega carrinho (pode ter mudado)
    carregarCarrinho();
    
    // Reseta estado
    checkoutState.buscando = false;
    checkoutState.usuarioExistente = null;
    
    // Limpa campos
    limparCamposFormulario();
    
    // Configura o modal baseado no tipo de entrega
    const tipoEntrega = checkoutStateGlobal.tipoEntrega || 'entrega';
    const camposEndereco = document.getElementById('checkout-campos-endereco');
    const avisoEndereco = document.getElementById('checkout-aviso-endereco');
    const tituloModal = document.getElementById('modal-titulo');
    
    if (tipoEntrega === 'retirada') {
        // Retirada: esconde endereço, mostra só telefone + nome
        if (camposEndereco) camposEndereco.style.display = 'none';
        if (avisoEndereco) avisoEndereco.style.display = 'none';
        if (tituloModal) tituloModal.textContent = '📱 Identificação para Retirada';
    } else {
        // Entrega: mostra tudo
        if (camposEndereco) camposEndereco.style.display = 'block';
        if (avisoEndereco) avisoEndereco.style.display = 'flex';
        if (tituloModal) tituloModal.textContent = '📱 Identificação e Endereço';
    }
    
    // Mostra modal
    checkoutModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Foca no DDD
    setTimeout(() => {
        const dddInput = document.getElementById('checkout-ddd');
        if (dddInput) dddInput.focus();
    }, 100);
}

/**
 * Fecha o modal de checkout
 */
function fecharCheckoutModal() {
    if (checkoutModal) {
        checkoutModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * Limpa campos do formulário
 */
function limparCamposFormulario() {
    const campos = [
        'checkout-ddd',
        'checkout-numero',
        'checkout-nome',
        'checkout-rua',
        'checkout-numero-endereco',
        'checkout-complemento',
        'checkout-bairro'
    ];
    
    campos.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    
    // Esconde mensagens
    const msgPrimeiraVez = document.getElementById('checkout-msg-primeira-vez');
    const msgEncontrado = document.getElementById('checkout-msg-encontrado');
    
    if (msgPrimeiraVez) msgPrimeiraVez.style.display = 'none';
    if (msgEncontrado) msgEncontrado.style.display = 'none';
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Botão fechar
    const btnFechar = document.getElementById('checkout-fechar');
    if (btnFechar) {
        btnFechar.addEventListener('click', fecharCheckoutModal);
    }
    
    // Fechar ao clicar fora
    checkoutModal.addEventListener('click', (e) => {
        if (e.target === checkoutModal) {
            fecharCheckoutModal();
        }
    });
    
    // Input DDD - apenas números, máx 2 dígitos
    const dddInput = document.getElementById('checkout-ddd');
    if (dddInput) {
        dddInput.addEventListener('input', (e) => {
            e.target.value = formatarDDD(e.target.value);
            if (e.target.value.length === 2) {
                document.getElementById('checkout-numero')?.focus();
            }
        });
    }
    
    // Input Número - formatação automática
    const numeroInput = document.getElementById('checkout-numero');
    if (numeroInput) {
        numeroInput.addEventListener('input', (e) => {
            const formatado = formatarNumeroTelefone(e.target.value);
            e.target.value = formatado.numero;
            
            // Quando completo (8 ou 9 dígitos), busca usuário
            if (formatado.isValido && !checkoutState.buscando) {
                buscarUsuario();
            }
        });
        
        numeroInput.addEventListener('blur', () => {
            const ddd = dddInput?.value || '';
            const numero = numeroInput.value || '';
            // Busca quando tiver 8 ou 9 dígitos
            if (ddd.length === 2 && (numero.length === 8 || numero.length === 9)) {
                buscarUsuario();
            }
        });
    }
    
    // Tipo de entrega
    const radiosEntrega = document.querySelectorAll('input[name="tipo-entrega"]');
    radiosEntrega.forEach(radio => {
        radio.addEventListener('change', (e) => {
            checkoutState.tipoEntrega = e.target.value;
            toggleCamposEndereco(e.target.value === 'entrega');
            calcularTaxaEntrega();
        });
    });
    
    // Forma de pagamento - mostrar/esconder troco
    const selectPagamento = document.getElementById('checkout-forma-pagamento');
    if (selectPagamento) {
        selectPagamento.addEventListener('change', (e) => {
            const trocoContainer = document.getElementById('checkout-troco-container');
            if (trocoContainer) {
                trocoContainer.style.display = e.target.value === 'dinheiro' ? 'block' : 'none';
            }
        });
    }
    
    // Bairro - calcular taxa de entrega (agora é select)
    const bairroSelect = document.getElementById('checkout-bairro');
    if (bairroSelect) {
        bairroSelect.addEventListener('change', calcularTaxaEntrega);
    }
    
    // Botão ver resumo (novo fluxo)
    const btnVerResumo = document.getElementById('checkout-ver-resumo');
    if (btnVerResumo) {
        btnVerResumo.addEventListener('click', salvarDadosEVoltar);
    }
    
    // Botão voltar (removido - agora só tem o X)
    
    // Botão voltar
    const btnVoltar = document.getElementById('checkout-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', fecharCheckoutModal);
    }
}

/**
 * Mostra/esconde campos de endereço
 */
function toggleCamposEndereco(mostrar) {
    const camposEndereco = document.getElementById('checkout-campos-endereco');
    const avisoEndereco = document.getElementById('checkout-aviso-endereco');
    
    if (camposEndereco) {
        camposEndereco.style.display = mostrar ? 'block' : 'none';
    }
    if (avisoEndereco) {
        avisoEndereco.style.display = mostrar ? 'block' : 'none';
    }
}

/**
 * Calcula taxa de entrega baseada no bairro (VERSÃO CORRIGIDA)
 */
function calcularTaxaEntrega() {
    const bairroSelect = document.getElementById('checkout-bairro');
    const bairroSelecionado = bairroSelect?.value;
    
    if (!bairroSelecionado || checkoutState.tipoEntrega === 'retirada') {
        checkoutState.taxaEntrega = 0;
        checkoutState.total = checkoutState.subtotal;
        atualizarResumoPedido();
        atualizarResumoModal();
        return;
    }
    
    // Busca a taxa nos bairros já carregados
    const bairroData = bairrosDisponiveis.find(b => b.bairro === bairroSelecionado);
    
    if (bairroData) {
        checkoutState.taxaEntrega = parseFloat(bairroData.taxa_entrega);
    } else {
        checkoutState.taxaEntrega = 0;
    }
    
    checkoutState.total = checkoutState.subtotal + checkoutState.taxaEntrega;
    atualizarResumoPedido();
    atualizarResumoModal();
}

/**
 * Busca usuário pelo telefone
 */
async function buscarUsuario() {
    const ddd = document.getElementById('checkout-ddd')?.value;
    const numero = document.getElementById('checkout-numero')?.value;
    
    if (!ddd || ddd.length !== 2 || !numero || (numero.length !== 8 && numero.length !== 9)) {
        return;
    }
    
    const telefoneCompleto = montarTelefoneCompleto(ddd, numero);
    checkoutState.buscando = true;
    
    // Mostra indicador de busca
    mostrarEstadoBusca(true);
    
    try {
        const resultado = await buscarUsuarioPorTelefone(telefoneCompleto);
        
        if (resultado) {
            // Usuário encontrado
            checkoutState.usuarioExistente = resultado;
            preencherDadosUsuario(resultado);
            mostrarMensagemEncontrado(true);
        } else {
            // Usuário novo
            checkoutState.usuarioExistente = null;
            mostrarMensagemPrimeiraVez(true);
        }
    } catch (error) {
        console.error('Erro na busca:', error);
    } finally {
        checkoutState.buscando = false;
        mostrarEstadoBusca(false);
    }
}

/**
 * Preenche dados do usuário encontrado
 */
function preencherDadosUsuario({ user, adress }) {
    const nomeInput = document.getElementById('checkout-nome');
    if (nomeInput) nomeInput.value = user.nome || '';
    
    if (adress && checkoutState.tipoEntrega === 'entrega') {
        const ruaInput = document.getElementById('checkout-rua');
        const numeroInput = document.getElementById('checkout-numero-endereco');
        const complementoInput = document.getElementById('checkout-complemento');
        const bairroInput = document.getElementById('checkout-bairro');
        
        if (ruaInput) ruaInput.value = adress.rua || '';
        if (numeroInput) numeroInput.value = adress.numero || '';
        if (complementoInput) complementoInput.value = adress.complemento || '';
        if (bairroInput) {
            bairroInput.value = adress.bairro || '';
            calcularTaxaEntrega();
        }
    }
}

/**
 * Mostra/esconde mensagens
 */
function mostrarMensagemPrimeiraVez(mostrar) {
    const msg = document.getElementById('checkout-msg-primeira-vez');
    const msgEncontrado = document.getElementById('checkout-msg-encontrado');
    if (msg) msg.style.display = mostrar ? 'block' : 'none';
    if (msgEncontrado) msgEncontrado.style.display = 'none';
}

function mostrarMensagemEncontrado(mostrar) {
    const msg = document.getElementById('checkout-msg-encontrado');
    const msgPrimeira = document.getElementById('checkout-msg-primeira-vez');
    if (msg) msg.style.display = mostrar ? 'block' : 'none';
    if (msgPrimeira) msgPrimeira.style.display = 'none';
}

function mostrarEstadoBusca(buscando) {
    const indicador = document.getElementById('checkout-buscando');
    if (indicador) indicador.style.display = buscando ? 'inline' : 'none';
}

/**
 * Salva os dados do modal e volta para o carrinho (novo fluxo)
 */
async function salvarDadosEVoltar() {
    const ddd = document.getElementById('checkout-ddd')?.value;
    const numero = document.getElementById('checkout-numero')?.value;
    const nome = document.getElementById('checkout-nome')?.value;
    const observacoes = document.getElementById('checkout-observacoes')?.value;
    
    // Validação básica
    if (!ddd || ddd.length !== 2) {
        alert('Digite o DDD corretamente');
        return;
    }
    
    if (!numero || (numero.length !== 8 && numero.length !== 9)) {
        alert('Digite o número de telefone completo (8 ou 9 dígitos)');
        return;
    }
    
    if (!nome || nome.trim().length < 2) {
        alert('Digite seu nome completo');
        return;
    }
    
    const telefoneCompleto = montarTelefoneCompleto(ddd, numero);
    const tipoEntrega = checkoutStateGlobal.tipoEntrega || 'entrega';
    
    // Monta objeto de dados
    const dadosAtualizados = {
        tipoEntrega: tipoEntrega,
        telefone: telefoneCompleto,
        nome: nome.trim(),
        observacoes: observacoes?.trim() || null,
        dadosCompletos: true
    };
    
    // Se for entrega, valida e adiciona endereço
    if (tipoEntrega === 'entrega') {
        const rua = document.getElementById('checkout-rua')?.value;
        const numeroEndereco = document.getElementById('checkout-numero-endereco')?.value;
        const complemento = document.getElementById('checkout-complemento')?.value;
        const bairro = document.getElementById('checkout-bairro')?.value;
        
        if (!rua || rua.trim().length < 3) {
            alert('Digite a rua/avenida');
            return;
        }
        
        if (!numeroEndereco) {
            alert('Digite o número');
            return;
        }
        
        if (!bairro) {
            alert('Selecione o bairro');
            return;
        }
        
        dadosAtualizados.endereco = {
            rua: rua.trim(),
            numero: numeroEndereco.trim(),
            complemento: complemento?.trim() || null,
            bairro: bairro
        };
        
        // Calcula taxa
        const bairroData = bairrosDisponiveis.find(b => b.bairro === bairro);
        if (bairroData) {
            dadosAtualizados.taxaEntrega = parseFloat(bairroData.taxa_entrega);
        }
    }
    
    // Atualiza estado global
    Object.assign(checkoutStateGlobal, dadosAtualizados);
    salvarEstadoCheckout();
    
    // Mostra loading
    const btnVerResumo = document.getElementById('checkout-ver-resumo');
    if (btnVerResumo) {
        btnVerResumo.disabled = true;
        btnVerResumo.textContent = 'Salvando...';
    }
    
    // Pequeno delay para UX
    await new Promise(r => setTimeout(r, 300));
    
    // Fecha modal
    fecharCheckoutModal();
    
    // Mostra dados no carrinho
    mostrarDadosCliente(checkoutStateGlobal);
    
    // Atualiza total com taxa
    atualizarTotalCarrinho();
    
    // Reseta botão
    if (btnVerResumo) {
        btnVerResumo.disabled = false;
        btnVerResumo.textContent = '📋 Ver Resumo do Pedido';
    }
}

/**
 * Finaliza o pedido completamente (chamado pelo botão do carrinho)
 */
async function finalizarPedidoCompleto() {
    // Verifica se tem dados completos
    if (!checkoutStateGlobal.dadosCompletos) {
        abrirCheckoutModal();
        return;
    }
    
    // Coleta dados do carrinho
    let cart = [];
    const rawNew = localStorage.getItem('bar_los_hermanos_cart_v2');
    if (rawNew) {
        try {
            const parsed = JSON.parse(rawNew);
            cart = parsed.items || [];
        } catch (e) {}
    }
    
    if (cart.length === 0) {
        alert('Seu carrinho está vazio!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => {
        const preco = item.preco || item.price || 0;
        const qtd = item.quantidade || item.quantity || 1;
        return sum + (preco * qtd);
    }, 0);
    
    const taxaEntrega = checkoutStateGlobal.tipoEntrega === 'retirada' ? 0 : (checkoutStateGlobal.taxaEntrega || 0);
    const total = subtotal + taxaEntrega;
    
    // Normaliza itens do carrinho
    const itensNormalizados = cart.map(item => ({
        id: item.id || null,
        nome: item.nome || item.name || 'Produto',
        preco: item.preco || item.price || 0,
        quantidade: item.quantidade || item.quantity || 1,
        categoria: item.categoria || item.category || null,
        observacoes: item.observacoes || null,
        extras: item.extras || []
    }));
    
    // Monta payload
    const pedidoPayload = {
        telefone: checkoutStateGlobal.telefone,
        nome: checkoutStateGlobal.nome,
        tipoEntrega: checkoutStateGlobal.tipoEntrega,
        subtotal: subtotal,
        taxaEntrega: taxaEntrega,
        total: total,
        formaPagamento: checkoutStateGlobal.formaPagamento,
        trocoPara: checkoutStateGlobal.trocoPara,
        observacoes: checkoutStateGlobal.observacoes,
        itens: itensNormalizados
    };
    
    if (checkoutStateGlobal.tipoEntrega === 'entrega' && checkoutStateGlobal.endereco) {
        pedidoPayload.endereco = checkoutStateGlobal.endereco;
    }
    
    // Confirmação
    const confirmar = confirm(`Confirmar pedido de ${formatarPreco(total)}?`);
    if (!confirmar) return;
    
    try {
        const resultado = await criarPedido(pedidoPayload);
        
        if (resultado.success) {
            // Limpa tudo
            localStorage.removeItem('bar-los-hermanos-cart');
            localStorage.removeItem('bar_los_hermanos_cart_v2');
            localStorage.removeItem('bar-los-hermanos-checkout-state');
            
            // Atualiza badge
            if (window.updateNavbarCartCount) {
                window.updateNavbarCartCount();
            }
            
            alert('Pedido realizado com sucesso!');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('Erro ao finalizar:', error);
        alert('Erro ao finalizar pedido. Tente novamente.');
    }
}

/**
 * Finaliza o pedido (função antiga, mantida para compatibilidade)
 */
async function finalizarPedido() {
    // Redireciona para o novo fluxo
    await salvarDadosEVoltar();
}

// ============================================================
// CARREGAR BAIRROS DO BANCO
// ============================================================

let bairrosDisponiveis = [];

async function carregarBairros() {
    try {
        const { data, error } = await supabaseClient
            .from('zonas_entrega')
            .select('bairro, taxa_entrega')
            .order('bairro');
        
        if (error) {
            console.error('Erro ao carregar bairros:', error);
            return;
        }
        
        bairrosDisponiveis = data || [];
        
        // Preenche o select de bairros
        const selectBairro = document.getElementById('checkout-bairro');
        if (selectBairro) {
            selectBairro.innerHTML = '<option value="">Selecione o bairro</option>';
            bairrosDisponiveis.forEach(bairro => {
                const option = document.createElement('option');
                option.value = bairro.bairro;
                option.textContent = bairro.bairro;
                option.dataset.taxa = bairro.taxa_entrega;
                selectBairro.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar bairros:', error);
    }
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initCheckoutModal();
    carregarBairros(); // Carrega bairros ao iniciar
    carregarEstadoCheckout(); // Restaura estado salvo
    atualizarTotalCarrinho(); // Calcula total inicial
    
    // Expõe funções globais
    window.abrirCheckoutModal = abrirCheckoutModal;
    window.fecharCheckoutModal = fecharCheckoutModal;
    window.selecionarTipoEntrega = selecionarTipoEntrega;
    window.atualizarFormaPagamento = atualizarFormaPagamento;
    window.atualizarTroco = atualizarTroco;
    window.finalizarPedidoCompleto = finalizarPedidoCompleto;
});
