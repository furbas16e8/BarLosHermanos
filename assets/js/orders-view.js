
import { getFeaturedItems, getPopularItems, getItemsByCategory, getAllItems } from "./menu-service.js";
// orders.js logic is global (window.addToCart), so no import needed. 

// Como orders.js provavelmente não é um módulo ES6, as funções addToCart e toggleFavorite devem estar no escopo global (window).
// Vamos assumir que orders.js é carregado como script normal e coloca essas funções no window.

const CATEGORY_ICONS = {
    'entradas': 'restaurant',
    'coxinhas': 'bakery_dining', 
    'hamburguers': 'lunch_dining',
    'porcoes': 'tapas',
    'jantinhas': 'dinner_dining',
    'especiais': 'star',
    'caldos': 'soup_kitchen',
    'escondidinhos': 'rice_bowl',
    'bebidas': 'local_bar',
    'combos': 'fastfood' // Mantendo combos caso exista
};

/* 
 * Helper para formatar moeda 
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

/* 
 * Renderizar seção de Destaques (Carousel)
 */
async function loadFeatured() {
    const container = document.getElementById('featured-container');
    if (!container) return;

    // Loading state placeholder (opcional, pode ser feito no HTML)
    container.innerHTML = '<div class="text-white/50 px-5">Carregando destaques...</div>';

    const items = await getFeaturedItems();
    
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-white/50 px-5">Nenhum destaque no momento.</div>';
        return;
    }

    container.innerHTML = ''; // Limpa

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'relative flex-none w-72 h-48 rounded-2xl overflow-hidden group';
        card.innerHTML = `
            <!-- Image -->
            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                 data-alt="${item.nome}" 
                 style="background-image: url('${item.img_url}');">
                <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
            </div>
            <!-- Content -->
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
/* 
 * Renderizar Grade de Itens Populares (ou Categoria específica)
 */
async function loadPopular() {
    const container = document.getElementById('popular-container');
    if (!container) return;

    container.innerHTML = '<div class="text-white/50 col-span-2 text-center text-sm py-8">Carregando cardápio...</div>';

    // Por padrão busca populares/geral
    const items = await getPopularItems();

    renderGridItems(items, container);
}

function renderGridItems(items, container) {
    if (!items || items.length === 0) {
        container.innerHTML = '<div class="text-white/50 col-span-2 text-center text-sm py-8">Nenhum item encontrado.</div>';
        return;
    }

    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'bg-surface-dark rounded-2xl p-3 flex flex-col gap-3 group';
        
        // Proteção contra aspas no JS inline
        const safeName = item.nome.replace(/'/g, "\\'");
        const safeImg = item.img_url;
        
        card.innerHTML = `
            <div class="w-full aspect-square rounded-xl bg-cover bg-center relative overflow-hidden" 
                 data-alt="${item.nome}" 
                 style="background-image: url('${item.img_url}');"
                 onclick="window.location.href='pagina_pedido.html?id=${item.id}'">
                
                 <button class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full p-1 z-10 hover:scale-110 transition-transform" 
                    data-favorite-name="${item.nome}" 
                    onclick="event.stopPropagation(); window.toggleFavorite('${safeName}', ${item.valor}, '${safeImg}')">
                    <span class="material-symbols-outlined text-white text-[16px]">favorite</span>
                </button>
            </div>
            <div onclick="window.location.href='pagina_pedido.html?id=${item.id}'" class="cursor-pointer">
                <h3 class="text-white font-bold text-sm leading-tight mb-1 cursor-pointer">${item.nome}</h3>
                <div class="flex items-center justify-between">
                    <span class="text-secondary-text text-sm font-semibold">${formatCurrency(item.valor)}</span>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    // Re-bind favorite icons styles (se a função existir no global)
    if (window.updateFavoriteIcons) window.updateFavoriteIcons();
}

/**
 * Filtro de Categoria
 */
async function filterByCategory(category, element) {
    const container = document.getElementById('popular-container');
    const title = document.getElementById('section-title');
    
    // UI Update - Visual Selection
    if (element) {
        // Reset old selection
        const allButtons = element.parentElement.children;
        for (let btn of allButtons) {
            const circle = btn.querySelector('div');
            const label = btn.querySelector('span:last-child');
            
            // Remove active styles (Primary Red)
            circle.classList.remove('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
            // Add default styles (Dark Surface)
            circle.classList.add('bg-surface-dark', 'text-secondary-text', 'border', 'border-white/5');
            
            label.classList.remove('text-white');
            label.classList.add('text-secondary-text');
        }

        // Set active style on clicked
        const circle = element.querySelector('div');
        const label = element.querySelector('span:last-child');
        
        circle.classList.remove('bg-surface-dark', 'text-secondary-text', 'border', 'border-white/5');
        circle.classList.add('bg-primary', 'text-white', 'shadow-lg', 'shadow-primary/30');
        
        label.classList.remove('text-secondary-text');
        label.classList.add('text-white');
    }

    if (title) title.innerText = category.charAt(0).toUpperCase() + category.slice(1);
    
    container.innerHTML = '<div class="text-white/50 col-span-2 text-center text-sm py-8">Carregando...</div>';
    
    let items;
    if (category === 'todas') {
        items = await getAllItems();
    } else {
        items = await getItemsByCategory(category);
    }
    
    renderGridItems(items, container);
}

// Inicialização
function init() {
    loadFeatured();
    loadPopular();
    window.filterMenuByCategory = filterByCategory;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
