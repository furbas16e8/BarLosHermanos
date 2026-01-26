
// orders-view.js - Lógica de Visualização do Dashboard

// Helper de Formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// --- SERVIÇOS DE DADOS (Substituindo menu-service.js) ---

async function getFeaturedItems() {
    // Exemplo: Itens 'especiais' ou aleatórios
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true)
        .eq('categoria', 'especiais') 
        .limit(5);
    
    if (error) console.error('Erro featured:', error);
    return data || [];
}

async function getPopularItems() {
    // Exemplo: Itens aleatórios ou fixos. Vamos pegar 'burgers' e 'entradas' por enquanto.
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true)
        .limit(9);
    
    if (error) console.error('Erro popular:', error);
    return data || [];
}

async function getAllItems() {
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true);
    return data || [];
}

async function getItemsByCategory(category) {
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true)
        .eq('categoria', category);
    return data || [];
}

// --- LÓGICA DE UI ---

async function loadUserProfile() {
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const { data: user, error } = await getUserProfile(session.user.id);
    
    if (user) {
        const nameEl = document.getElementById('header-name');
        const addrEl = document.getElementById('header-address');
        
        if (nameEl) nameEl.innerText = user.nome || 'Cliente';
        
        if (addrEl) {
            if (user.endereco_rua) {
                // Formata endereço curto: Rua X, 123...
                addrEl.innerText = `${user.endereco_rua}, ${user.endereco_numero}`;
            } else {
                addrEl.innerText = 'Sem endereço';
            }
        }
    }
}

async function loadFeatured() {
    const container = document.getElementById('featured-container');
    if (!container) return;

    container.innerHTML = '<div class="text-white/50 px-5">Carregando destaques...</div>';
    const items = await getFeaturedItems();

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-white/50 px-5">Sem destaques hoje.</div>';
        return;
    }

    container.innerHTML = '';
    items.forEach(item => {
        // Card de Destaque
        const card = document.createElement('div');
        card.className = 'relative flex-none w-72 h-48 rounded-2xl overflow-hidden group';
        card.innerHTML = `
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                 style="background-image: url('${item.img_url || 'assets/img/placeholder_food.png'}');">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>
            <div class="absolute inset-0 flex flex-col justify-end p-4 border-2 border-primary/60 rounded-2xl shadow-[0_0_20px_rgba(242,127,13,0.3)] cursor-pointer"
                 onclick="window.location.href='pagina_pedido.html?id=${item.id}'">
                <div class="flex justify-between items-end">
                    <div>
                        <span class="px-2 py-0.5 rounded-md bg-primary text-white text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">Destaque</span>
                        <h3 class="text-white text-lg font-bold leading-tight">${item.nome}</h3>
                        <p class="text-secondary-text text-xs mt-0.5 truncate max-w-[150px]">${item.descricao || ''}</p>
                    </div>
                    <p class="text-primary text-xl font-extrabold">${formatCurrency(item.valor)}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

async function loadPopular() {
    const container = document.getElementById('popular-container');
    if (!container) return;
    
    container.innerHTML = '<div class="text-white/50 col-span-3 text-center text-sm py-8">Carregando cardápio...</div>';
    const items = await getAllItems();
    renderGridItems(items, container);
}

function renderGridItems(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-white/50 col-span-3 text-center text-sm py-8">Nenhum item encontrado.</div>';
        return;
    }

    container.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-surface-dark rounded-2xl p-3 flex flex-col gap-3 group';
        const safeName = item.nome.replace(/'/g, "\\'");
        
        card.innerHTML = `
            <div class="w-full aspect-square rounded-xl bg-cover bg-center relative overflow-hidden" 
                 style="background-image: url('${item.img_url || 'assets/img/placeholder_food.png'}');"
                 onclick="window.location.href='pagina_pedido.html?id=${item.id}'">
                 <button class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1 z-10 hover:scale-110 transition-transform" 
                    data-favorite-name="${item.nome}" 
                    onclick="event.stopPropagation(); window.toggleFavorite('${safeName}', ${item.valor}, '${item.img_url || ''}')">
                    <span class="material-symbols-outlined text-white text-[16px]">favorite</span>
                </button>
            </div>
            <div onclick="window.location.href='pagina_pedido.html?id=${item.id}'" class="cursor-pointer">
                <h3 class="text-white font-bold text-sm leading-tight mb-1 cursor-pointer line-clamp-1">${item.nome}</h3>
                <div class="flex items-center justify-between">
                    <span class="text-secondary-text text-sm font-semibold">${formatCurrency(item.valor)}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
    
    // Atualiza ícones de favorito se a função existir
    if (window.updateFavoriteIcons) window.updateFavoriteIcons();
}

async function filterByCategory(category, element) {
    const container = document.getElementById('popular-container');
    // UI Update (Visual Selection)
    if (element) {
        const allButtons = element.parentElement.children;
        for (let btn of allButtons) {
            const circle = btn.querySelector('div');
            const label = btn.querySelector('span:last-child');
            circle.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
            circle.classList.add('bg-surface-dark', 'text-secondary-text', 'border', 'border-white/5');
            label.classList.remove('text-white');
            label.classList.add('text-secondary-text');
        }
        const circle = element.querySelector('div');
        const label = element.querySelector('span:last-child');
        circle.classList.remove('bg-surface-dark', 'text-secondary-text', 'border', 'border-white/5');
        circle.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
        label.classList.remove('text-secondary-text');
        label.classList.add('text-white');
    }

    container.innerHTML = '<div class="text-white/50 col-span-3 text-center text-sm py-8">Carregando...</div>';
    
    let items;
    if (category === 'todas') {
        items = await getAllItems(); // Busca tudo ao filtrar por 'todas'
        
        // Ordenação personalizada por categoria
        items.sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a.categoria?.toLowerCase());
            const indexB = CATEGORY_ORDER.indexOf(b.categoria?.toLowerCase());
            
            // Se não encontrar, joga pro final
            const posA = indexA === -1 ? 999 : indexA;
            const posB = indexB === -1 ? 999 : indexB;
            
            return posA - posB;
        });
    } else {
        items = await getItemsByCategory(category);
    }
    
    renderGridItems(items, container);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadFeatured();
    loadPopular(); // Carrega inicial
    
    // Bind global para o HTML acessar
    window.filterMenuByCategory = filterByCategory;
});
