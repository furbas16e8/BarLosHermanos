/**
 * navbar.js - Gerencia a barra de navegação global do Bar Los Hermanos
 */

document.addEventListener('DOMContentLoaded', () => {
    const navbarHTML = `
        <nav class="fixed bottom-0 w-full bg-[#000000] border-t border-white/5 h-[84px] pb-4 z-50 flex justify-around items-center px-2">
            <a class="flex flex-col items-center justify-center w-16 gap-1 group" href="index.html" id="nav-home">
                <span class="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors text-[28px]">home</span>
                <span class="text-[10px] font-semibold text-white/40 group-hover:text-primary">Início</span>
            </a>
            <a class="flex flex-col items-center justify-center w-16 gap-1 group" href="favoritos.html" id="nav-favoritos">
                <span class="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors text-[28px]">favorite</span>
                <span class="text-[10px] font-semibold text-white/40 group-hover:text-primary">Favoritos</span>
            </a>
            <a class="flex flex-col items-center justify-center w-16 gap-1 group relative" href="shopping.html" id="nav-cart">
                <div class="absolute top-0 right-3 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full border-2 border-[#1a130c] flex items-center justify-center opacity-0" id="navbar-cart-count">0</div>
                <span class="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors text-[28px]">shopping_bag</span>
                <span class="text-[10px] font-semibold text-white/40 group-hover:text-primary">Carrinho</span>
            </a>
            <a class="flex flex-col items-center justify-center w-16 gap-1 group" href="perfil.html" id="nav-profile">
                <span class="material-symbols-outlined text-white/50 group-hover:text-primary transition-colors text-[28px]">person</span>
                <span class="text-[10px] font-semibold text-white/40 group-hover:text-primary">Perfil</span>
            </a>
        </nav>
    `;

    // Insere a barra no final do body
    document.body.insertAdjacentHTML('beforeend', navbarHTML);

    // Define o estado ativo baseado na página atual
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    const activeMapping = {
        'index.html': 'nav-home',
        'orders.html': 'nav-home',
        'favoritos.html': 'nav-favoritos',
        'shopping.html': 'nav-cart',
        'perfil.html': 'nav-profile',
        'address.html': 'nav-profile',
        'login.html': 'nav-profile',
        'cadastro.html': 'nav-profile',
        'pagina_pedido.html': 'nav-home',
        'historia.html': 'nav-home'
    };

    const activeId = activeMapping[currentPath];
    if (activeId) {
        const activeLink = document.getElementById(activeId);
        if (activeLink) {
            const icon = activeLink.querySelector('.material-symbols-outlined');
            const label = activeLink.querySelector('span:not(.material-symbols-outlined)');
            
            icon.classList.remove('text-white/50');
            icon.classList.add('text-primary', 'fill-1');
            label.classList.remove('text-white/40');
            label.classList.add('text-primary', 'font-bold');
        }
    }

    // Configuração de cores (Vermelho Global #ff3131)
    document.documentElement.style.setProperty('--primary', '#ff3131');

    // Listener para o contador do carrinho
    updateNavbarCartCount();
});

/**
 * Atualiza o contador do carrinho na barra de navegação
 */
function updateNavbarCartCount() {
    const badge = document.getElementById('navbar-cart-count');
    if (!badge) return;

    const cart = JSON.parse(localStorage.getItem('bar-los-hermanos-cart')) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    if (totalItems > 0) {
        badge.innerText = totalItems;
        badge.classList.remove('opacity-0');
    } else {
        badge.classList.add('opacity-0');
    }
}
