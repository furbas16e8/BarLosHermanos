import { el, $, $$ } from './dom-helpers.js';

/**
 * navbar.js - Gerencia a barra de navegação global
 */

// ============================================
// FUNÇÕES GLOBAIS (definidas primeiro para evitar hoisting issues)
// ============================================

/**
 * Atualiza o contador do carrinho na navbar
 * Definida antes de initNavbar para evitar ReferenceError
 */
window.updateNavbarCartCount = function() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    // Tenta usar getCart() do orders.js (valida userId e expiração)
    let cart = [];
    if (typeof getCart === 'function') {
        cart = getCart();
    } else {
        // Fallback: tenta nova chave primeiro, depois legada
        const raw = localStorage.getItem('bar_los_hermanos_cart_v2') || localStorage.getItem('bar-los-hermanos-cart');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                cart = Array.isArray(parsed) ? parsed : (parsed.items || []);
            } catch (e) {
                cart = [];
            }
        }
    }
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
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
    // 1. Construir a Navbar usando DOM Helpers e BEM
    const navbar = el('nav', { class: 'bottom-nav' }, [
        // Home
        createNavItem({ 
            id: 'nav-home', 
            href: 'orders.html', 
            icon: 'home', 
            label: 'Início' 
        }),
        // Favoritos
        createNavItem({ 
            id: 'nav-favoritos', 
            href: 'favoritos.html', 
            icon: 'favorite', 
            label: 'Favoritos' 
        }),
        // Carrinho
        createNavItem({ 
            id: 'nav-cart', 
            href: 'shopping.html', 
            icon: 'shopping_bag', 
            label: 'Carrinho',
            hasBadge: true
        }),
        // Perfil
        createNavItem({ 
            id: 'nav-profile', 
            href: 'perfil.html', 
            icon: 'person', 
            label: 'Perfil' 
        })
    ]);

    // 2. Inserir no Body (se ainda não existir)
    if (!document.querySelector('.bottom-nav')) {
        document.body.appendChild(navbar);
    }

    // 3. Destacar Link Ativo
    highlightActiveLink();

    // 4. Configurar Listener do Carrinho
    updateNavbarCartCount();
}

// Ensure execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavbar);
} else {
    initNavbar();
}

function createNavItem({ id, href, icon, label, hasBadge = false }) {
    // Estrutura:
    // a.nav-item
    //   div.nav-badge (opcional)
    //   span.material-symbols-outlined.nav-item__icon
    //   span.nav-item__label
    
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
        '': 'nav-home', // root
        'index.html': 'nav-home',
        'orders.html': 'nav-home',
        'pagina_pedido.html': 'nav-home',
        'historia.html': 'nav-home',
        'favoritos.html': 'nav-favoritos',
        'shopping.html': 'nav-cart',
        'perfil.html': 'nav-profile',
        'address.html': 'nav-profile',
        'login.html': 'nav-profile',
        'cadastro.html': 'nav-profile'
    };

    const activeId = activeMapping[currentPath];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) {
            activeLink.classList.add('nav-item--active');
        }
    }
}

/**
 * Atualiza o contador do carrinho
 * DEFINIDA ANTES DE initNavbar PARA EVITAR REFERENCE ERROR
 */
window.updateNavbarCartCount = function() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    // Tenta usar getCart() do orders.js (valida userId e expiração)
    // Se não disponível, tenta ler diretamente do localStorage (fallback)
    let cart = [];
    if (typeof getCart === 'function') {
        cart = getCart();
    } else {
        // Fallback: tenta nova chave primeiro, depois legada
        const raw = localStorage.getItem('bar_los_hermanos_cart_v2') || localStorage.getItem('bar-los-hermanos-cart');
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                // Se for novo formato, extrai items; se for legado, usa direto
                cart = Array.isArray(parsed) ? parsed : (parsed.items || []);
            } catch (e) {
                cart = [];
            }
        }
    }
    
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.add('visible');
    } else {
        badge.classList.remove('visible');
    }
};
