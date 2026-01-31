
// Configuração do Cliente Supabase
// Substitua pelas suas chaves reais do painel do Supabase

const SUPABASE_URL = 'https://bdkqoyalqrypfzwijosd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJka3FveWFscXJ5cGZ6d2lqb3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTI4ODgsImV4cCI6MjA4NDg2ODg4OH0.u_czXqDvTDDu_iI7tD3Loc4Z3xde63gcrY-7xm2AHMc';

// Verifica se a biblioteca foi carregada via CDN
if (typeof supabase === 'undefined') {
    console.error('A biblioteca do Supabase não foi carregada. Verifique o CDN no HTML.');
}

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Exporta para uso global ou módulo dependendo do ambiente
window.supabaseClient = _supabase;

// Funções Helpers de Autenticação

async function loginUser(email, password) {
    const { data, error } = await _supabase.auth.signInWithPassword({
        email: email,
        password: password
    });
    return { data, error };
}

async function signUpUser(email, password, userData) {
    // 1. Criar Auth
    const { data: authData, error: authError } = await _supabase.auth.signUp({
        email: email,
        password: password
    });

    if (authError) return { error: authError };

    // 2. Criar Perfil na tabela 'clientes' (sem dados de endereço - nova estrutura)
    // Nota: O ID do cliente deve ser o mesmo do Auth (authData.user.id)
    if (authData.user) {
        const { error: profileError } = await _supabase
            .from('clientes')
            .insert([{
                id: authData.user.id,
                email: email,
                nome: userData.nome,
                telefone: userData.telefone,
                cpf: userData.cpf
                // Endereços agora são salvos na tabela 'enderecos' separadamente
            }]);
        
        if (profileError) {
            // Se falhar o perfil, ideal seria desfazer o Auth ou avisar suporte
            console.error('Erro ao criar perfil:', profileError);
            return { data: authData, error: profileError };
        }
    }

    return { data: authData, error: null };
}

async function logoutUser() {
    const { error } = await _supabase.auth.signOut();
    if (!error) {
        // Limpar dados locais sensíveis e carrinho
        localStorage.removeItem('bar_los_hermanos_cart_v2'); // Nova chave v2
        localStorage.removeItem('bar-los-hermanos-cart');    // Chave legada
        localStorage.removeItem('bar-los-hermanos-favs');    // Limpar cache de favs também
        window.currentUserId = null; // Limpar referência global
        window.location.href = 'login.html';
    }
    return { error };
}

async function checkSession() {
    const { data: { session } } = await _supabase.auth.getSession();
    return session;
}

async function getUserProfile(userId) {
    const { data, error } = await _supabase
        .from('clientes')
        .select('*')
        .eq('id', userId)
        .single();
    return { data, error };
}

async function getFavorites(userId) {
    const { data, error } = await _supabase
        .from('favoritos')
        .select(`
            id,
            item_id,
            cardapio (
                id, nome, descricao, valor, img_url, categoria
            )
        `)
        .eq('cliente_id', userId);
    return { data, error };
}

async function addFavorite(userId, itemId) {
    const { data, error } = await _supabase
        .from('favoritos')
        .insert([{ cliente_id: userId, item_id: itemId }])
        .select();
    return { data, error };
}

async function removeFavorite(userId, itemId) {
    const { data, error } = await _supabase
        .from('favoritos')
        .delete()
        .eq('cliente_id', userId)
        .eq('item_id', itemId);
    return { data, error };
}

async function getItemIdByName(name) {
    const { data, error } = await _supabase
        .from('cardapio')
        .select('id')
        .eq('nome', name)
        .single();
    return { data, error };
}

async function getDeliveryZone(bairro) {
    // Busca exata primeiro (case insensitive via ILIKE se fosse SQL puro, aqui usamos filtro texto)
    let { data, error } = await _supabase
        .from('zonas_entrega')
        .select('*')
        .ilike('bairro', bairro)
        .eq('ativo', true)
        .single();
    
    return { data, error };
}

async function getDeliveryZones() {
    let { data, error } = await _supabase
        .from('zonas_entrega')
        .select('*')
        .eq('ativo', true)
        .order('bairro');
    return { data, error };
}

async function createOrder(orderPayload) {
    const { data, error } = await _supabase
        .from('pedidos')
        .insert([orderPayload])
        .select()
        .single();
    return { data, error };
}

async function createOrderItems(itemsPayload) {
    const { data, error } = await _supabase
        .from('itens_pedido')
        .insert(itemsPayload)
        .select();
    return { data, error };
}

// ============================================
// AUTH STATE LISTENER - Isolamento do Carrinho
// ============================================

// Listener global para mudanças de estado de autenticação
_supabase.auth.onAuthStateChange((event, session) => {
    console.log('[Auth] Evento:', event);
    
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        if (session && session.user) {
            const userId = session.user.id;
            console.log('[Auth] Usuário logado:', userId);
            
            // Define o userId global para uso no carrinho
            if (typeof setCurrentUserId === 'function') {
                setCurrentUserId(userId);
            } else {
                window.currentUserId = userId;
            }
            
            // Tenta migrar carrinho legado se existir
            if (typeof migrateLegacyCart === 'function') {
                migrateLegacyCart();
            }
            
            // Valida e recarrega o carrinho
            if (typeof updateCartUI === 'function') {
                updateCartUI();
            }
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }
        }
    }
    
    if (event === 'SIGNED_OUT') {
        console.log('[Auth] Usuário deslogado');
        
        // Limpa referência global
        window.currentUserId = null;
        
        // Limpa carrinho do localStorage
        localStorage.removeItem('bar_los_hermanos_cart_v2');
        localStorage.removeItem('bar-los-hermanos-cart'); // Legado
        
        // Atualiza UI do carrinho
        if (typeof updateCartUI === 'function') {
            updateCartUI();
        }
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    }
    
    if (event === 'USER_UPDATED') {
        // Atualiza userId se necessário
        if (session && session.user) {
            window.currentUserId = session.user.id;
            if (typeof setCurrentUserId === 'function') {
                setCurrentUserId(session.user.id);
            }
        }
    }
});
