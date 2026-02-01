import { el, $, $$ } from './dom-helpers.js';

/**
 * navbar.js - Barra de navegação simplificada (sem login)
 * Apenas 3 itens: Início | Cardápio | Carrinho
 */

// ============================================
// FUNÇÕES GLOBAIS
// ============================================

/**
 * Atualiza o contador do carrinho na navbar
 */
window.updateNavbarCartCount = function() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    // Lê do localStorage
    let cart = [];
    const raw = localStorage.getItem('bar-los-hermanos-cart');
    if (raw) {
        try {
            cart = JSON.parse(raw);
            if (!Array.isArray(cart)) cart = [];
        } catch (e) {
            cart = [];
        }
    }
    
    const totalItems = cart.reduce((acc, item) => acc + (item.quantidade || item.quantity || 0), 0);
    
    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
};

// ============================================
// INICIALIZAÇÃO DA NAVBAR
// ============================================

function initNavbar() {
    // Construir a Navbar simplificada (3 itens)
    const navbar = el('nav', { class: 'bottom-nav' }, [
        // Início
        createNavItem({ 
            id: 'nav-home', 
            href: 'index.html', 
            icon: 'home', 
            label: 'Início' 
        }),
        // Cardápio
        createNavItem({ 
            id: 'nav-cardapio', 
            href: 'orders.html', 
            icon: 'restaurant_menu', 
            label: 'Cardápio' 
        }),
        // Carrinho (com badge)
        createNavItem({ 
            id: 'nav-cart', 
            href: 'shopping.html', 
            icon: 'shopping_cart', 
            label: 'Carrinho',
            hasBadge: true
        })
    ]);

    // Inserir no Body (se ainda não existir)
    if (!document.querySelector('.bottom-nav')) {
        document.body.appendChild(navbar);
    }

    // Destacar Link Ativo
    highlightActiveLink();

    // Atualizar contador do carrinho
    updateNavbarCartCount();
}

// Ensure execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

function createNavItem({ id, href, icon, label, hasBadge = false }) {
    const children = [
        el('span', { class: 'material-symbols-outlined nav-item__icon' }, icon),
        el('span', { class: 'nav-item__label' }, label)
    ];

    if (hasBadge) {
        children.unshift(el('div', { id: 'navbar-cart-count', class: 'nav-badge' }, '0'));
    }

    return el('a', { id, href, class: 'nav-item' }, children);
}

function highlightActiveLink() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const activeMapping = {
        '': 'nav-home',
        'index.html': 'nav-home',
        'historia.html': 'nav-home',
        'orders.html': 'nav-cardapio',
        'pagina_pedido.html': 'nav-cardapio',
        'shopping.html': 'nav-cart'
    };

    const activeId = activeMapping[currentPath];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) {
            activeLink.classList.add('nav-item--active');
        }
    }
}
