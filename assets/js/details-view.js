
import { getItemById } from "./menu-service.js";
// orders.js logic is global 

// Assumes orders.js logic is global

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        alert("Produto não encontrado.");
        window.location.href = 'orders.html';
        return;
    }

    const item = await getItemById(id);

    if (!item) {
        alert("Erro ao carregar produto.");
        window.location.href = 'orders.html';
        return;
    }

    // Render Data
    document.title = `Bar Los Hermanos | ${item.nome}`;
    
    // Background Image
    const bgContainer = document.querySelector('.bg-cover');
    if (bgContainer && item.img_url) {
        bgContainer.style.backgroundImage = `url('${item.img_url}')`;
    }

    // Header Info
    const titleEl = document.querySelector('h1');
    if (titleEl) titleEl.innerText = item.nome; // Supports <br/> manually if needed, but innerText is safer

    const priceEl = document.querySelector('.text-3xl.font-bold.text-primary'); // "R$ 42,50"
    if (priceEl) priceEl.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor);

    // Description
    const descEl = document.querySelector('p.text-white\\/70');
    if (descEl) descEl.innerText = item.descricao || "Sem descrição disponível.";

    // Update Favorite Icon State
    const favButton = document.querySelector('[data-favorite-name]');
    if (favButton) {
        favButton.setAttribute('data-favorite-name', item.nome);
        // Atualiza evento de click para usar dados reais
        favButton.onclick = (e) => {
            e.stopPropagation();
            window.toggleFavorite(item.nome, item.valor, item.img_url);
            updateFavIconState(favButton, item.nome);
        };
        updateFavIconState(favButton, item.nome);
    }

    // Update Add to Cart Button
    const addToCartBtn = document.querySelector('.fixed.bottom-\\[90px\\] button');
    if (addToCartBtn) {
        // Find the price span inside button
        const btnPriceSpan = addToCartBtn.querySelectorAll('span')[1];
        if (btnPriceSpan) btnPriceSpan.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor);
        
        addToCartBtn.onclick = () => {
            window.addToCart(item.nome, item.valor, item.img_url);
            // Feedback visual ou redirecionar
            const btnText = addToCartBtn.querySelector('span:first-child');
            const originalText = btnText.innerText;
            btnText.innerText = "Adicionado!";
            setTimeout(() => {
                btnText.innerText = originalText;
            }, 1000);
        };
    }
}

function updateFavIconState(btn, name) {
    const icon = btn.querySelector('.material-symbols-outlined');
    if (window.isFavorite && window.isFavorite(name)) {
        icon.classList.add('text-primary');
        icon.style.fontVariationSettings = "'FILL' 1";
    } else {
        icon.classList.remove('text-primary');
        icon.style.fontVariationSettings = "'FILL' 0";
    }
}

document.addEventListener('DOMContentLoaded', loadProductDetails);
