
import { el, $, $$ } from './dom-helpers.js';

// orders-view.js - Lógica de Visualização do Dashboard (Refatorado)

// Configuration
const CATEGORY_ORDER = [
    'entradas', 'jantinhas', 'porcoes', 'especiais', 'burguers', 
    'fritas', 'batatas', 'caldos', 'coxinhas', 'escondidinhos', 'bebidas'
];

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// --- DATA SERVICES (Supabase Wrapper) ---

async function getFeaturedItems() {
    if (!window.supabaseClient) return [];
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true)
        .eq('destaque', true) 
        .limit(5);
    if (error) console.error('Erro featured:', error);
    return data || [];
}

async function getAllItems() {
    if (!window.supabaseClient) return [];
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true);
    return data || [];
}

async function getItemsByCategory(category) {
    if (!window.supabaseClient) return [];
    const { data, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('ativo', true)
        .eq('categoria', category);
    return data || [];
}

// --- UI LOGIC ---

async function loadUserProfile() {
    if (!window.checkSession) return;
    const session = await checkSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const { data: user } = await getUserProfile(session.user.id);
    
    if (user) {
        const nameEl = $('#header-name');
        const addrEl = $('#header-address');
        
        if (nameEl) nameEl.innerText = user.nome || 'Cliente';
        if (addrEl) {
            addrEl.innerText = user.endereco_rua 
                ? `${user.endereco_rua}, ${user.endereco_numero}`
                : 'Sem endereço';
        }
    }
}

async function loadFeatured() {
    const container = $('#featured-container');
    if (!container) return;

    container.innerHTML = '';
    const items = await getFeaturedItems();

    if (!items || items.length === 0) {
        container.appendChild(el('div', { class: 'text-muted px-5 py-4' }, 'Sem destaques hoje.'));
        return;
    }

    items.forEach(item => {
        // [REF] assets/css/components/card.css (.featured-card)
        const card = el('div', { 
            class: 'featured-card group',
            onclick: () => window.location.href = `pagina_pedido.html?id=${item.id}`
        }, [
            // Background Layer
            el('div', { 
                class: 'featured-card__bg',
                style: { backgroundImage: `url('${item.img_url || 'assets/img/placeholder_food.png'}')` }
            }),
            // Gradient Overlay
            el('div', { class: 'featured-card__overlay' }),
            // Content
            el('div', { class: 'featured-card__content' }, [
                el('div', { class: 'flex justify-between items-end' }, [
                    el('div', {}, [
                        el('span', { class: 'featured-card__tag' }, 'Destaque'),
                        el('h3', { class: 'featured-card__title' }, item.nome),
                        el('p', { class: 'featured-card__desc' }, item.descricao || '')
                    ]),
                    el('p', { class: 'featured-card__price' }, formatCurrency(item.valor))
                ])
            ])
        ]);

        container.appendChild(card);
    });
}

// Renderiza grid principal (Populares ou Filtrados)
function renderGridItems(items, container) {
    container.innerHTML = '';

    if (!items || items.length === 0) {
        container.appendChild(el('div', { class: 'text-muted col-span-3 text-center py-8' }, 'Nenhum item encontrado.'));
        return;
    }

    items.forEach(item => {
        const safeName = item.nome.replace(/'/g, "\\'");
        
        // [REF] assets/css/components/card.css (.product-card)
        const card = el('div', { class: 'product-card group' }, [
            // Image Container
            el('div', { 
                class: 'product-card__image-container',
                style: { backgroundImage: `url('${item.img_url || 'assets/img/placeholder_food.png'}')` },
                onclick: () => window.location.href = `pagina_pedido.html?id=${item.id}`
            }, [
                // Favorite Button
                el('button', { 
                    class: 'product-card__fav-btn',
                    'data-favorite-name': item.nome,
                    onclick: (e) => {
                        e.stopPropagation();
                        // Assume window.toggleFavorite global from orders.js
                        if(window.toggleFavorite) window.toggleFavorite(item.nome, item.valor, item.img_url || '');
                    }
                }, [
                    el('span', { class: 'material-symbols-outlined product-card__fav-icon' }, 'favorite')
                ])
            ]),
            
            // Info Container
            el('div', { 
                class: 'product-card__info',
                onclick: () => window.location.href = `pagina_pedido.html?id=${item.id}`
            }, [
                el('h3', { class: 'product-card__title' }, item.nome),
                el('div', { class: 'flex items-center justify-between' }, [
                    el('span', { class: 'product-card__price' }, formatCurrency(item.valor))
                ])
            ])
        ]);

        container.appendChild(card);
    });

    // Reapply favorite states
    if (window.updateFavoriteIcons) window.updateFavoriteIcons();
}

async function loadPopular() {
    const container = $('#popular-container');
    if (!container) return;
    
    container.innerHTML = ''; 
    container.appendChild(el('div', { class: 'text-muted py-8 text-center w-full' }, 'Carregando cardápio...'));
    
    // Default load: all items (sorted later)
    const items = await getAllItems();
    renderGridItems(items, container);
}

// Logic to filter by category
async function filterByCategory(category, element) {
    // 1. Update UI (Active State)
    if (element) {
        // Remove .category-item--active de todos
        $$('.category-item').forEach(btn => btn.classList.remove('category-item--active'));
        // Adiciona ao clicado
        element.classList.add('category-item--active');
    }

    const container = $('#popular-container');
    container.innerHTML = '';
    container.appendChild(el('div', { class: 'text-muted py-8 text-center' }, 'Carregando...'));

    let items;
    if (category === 'todas') {
        items = await getAllItems();
        // Custom Sort by CATEGORY_ORDER
        items.sort((a, b) => {
            const indexA = CATEGORY_ORDER.indexOf(a.categoria?.toLowerCase());
            const indexB = CATEGORY_ORDER.indexOf(b.categoria?.toLowerCase());
            const posA = indexA === -1 ? 999 : indexA;
            const posB = indexB === -1 ? 999 : indexB;
            return posA - posB;
        });
    } else {
        items = await getItemsByCategory(category);
    }
    
    renderGridItems(items, container);
}

// Bind Global
window.filterMenuByCategory = filterByCategory;

/**
 * Renderiza a lista de categorias dinamicamente
 * (Substitui o HTML estático)
 */
function renderCategoryList() {
    const container = $('#category-list-container');
    if (!container) return;

    container.innerHTML = '';
    
    // Mapeamento Icones
    const icons = {
        'todas': 'menu_book',
        'entradas': 'restaurant',
        'jantinhas': 'dinner_dining',
        'porcoes': 'tapas',
        'especiais': 'star',
        'burguers': 'lunch_dining',
        'fritas': 'fastfood',
        'batatas': 'egg',
        'caldos': 'soup_kitchen',
        'coxinhas': 'bakery_dining',
        'escondidinhos': 'rice_bowl',
        'bebidas': 'local_bar'
    };

    // Item "Todas"
    const allBtn = createCategoryItem('todas', 'Todas', icons['todas'], true);
    container.appendChild(allBtn);

    // Outras Categorias
    CATEGORY_ORDER.forEach(cat => {
        const label = cat.charAt(0).toUpperCase() + cat.slice(1);
        const icon = icons[cat] || 'restaurant';
        const btn = createCategoryItem(cat, label, icon, false);
        container.appendChild(btn);
    });
}

function createCategoryItem(id, label, iconName, isActive) {
    // [REF] assets/css/components/category-nav.css (.category-item)
    const btn = el('div', { 
        class: `category-item ${isActive ? 'category-item--active' : ''}`,
        onclick: function() { filterMenuByCategory(id, this); } 
    }, [
        el('div', { class: 'category-item__circle' }, [
            el('span', { class: 'material-symbols-outlined category-item__icon' }, iconName)
        ]),
        el('span', { class: 'category-item__label' }, label)
    ]);
    return btn;
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    renderCategoryList();
    loadFeatured();
    loadPopular();
});
