import { el, $, $$ } from './dom-helpers.js';

// details-view.js - Lógica da Página de Detalhes (Refatorado)

// --- Mapeamento de Ingredientes ---
const INGREDIENT_ICONS = {
    "Carne": { icon: "ph-hamburger", color: "text-orange-400" },
    "Queijo": { icon: "ph-cheese", color: "text-yellow-400" },
    "Bacon": { icon: "ph-waves", color: "text-red-500" },
    "Alface": { icon: "ph-plant", color: "text-green-500" },
    "Tomate": { icon: "ph-pizza", color: "text-red-600" }, 
    "Cebola": { icon: "ph-wind", color: "text-purple-300" },
    "Ovo": { icon: "ph-egg", color: "text-yellow-200" },
    "Picles": { icon: "ph-cactus", color: "text-green-700" },
    "Molho": { icon: "ph-drop", color: "text-orange-300" },
    "Pão": { icon: "ph-grains", color: "text-amber-200" }
};

// Colors map for inline style (fallback if classes not working with Phosphor inside JS)
// Note: Tailwind "text-orange-400" classes won't work without Tailwind. 
// We should use hex codes or var colors in style attribute.
const COLOR_MAP = {
    "text-orange-400": "#fb923c",
    "text-yellow-400": "#facc15",
    "text-red-500": "#ef4444",
    "text-green-500": "#22c55e",
    "text-red-600": "#dc2626",
    "text-purple-300": "#d8b4fe",
    "text-yellow-200": "#fef08a",
    "text-green-700": "#15803d",
    "text-orange-300": "#fdba74",
    "text-amber-200": "#fde68a",
    "text-gray-400": "#9ca3af",
    "text-gray-500": "#6b7280"
};

let removedIngredients = new Set();
let selectedExtras = new Map(); // Mapa de extras: nome -> preço
let currentProduct = null;
let basePrice = 0;

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        window.location.href = 'orders.html';
        return;
    }

    // Elements
    const heroBg = $('.product-hero__bg');
    const titleEl = $('#product-title');
    const priceTopEl = $('#product-price-top');
    const priceBtnEl = $('#btn-price-display');
    const descEl = $('#product-desc');
    const favBtn = $('#btn-favorite');
    const cartBtn = $('#btn-add-cart');

    // Fetch Data
    const { data: item, error } = await window.supabaseClient
        .from('cardapio')
        .select('*')
        .eq('id', productId)
        .single();
    
    if (error || !item) {
        console.error('Erro ao carregar produto:', error);
        if(titleEl) titleEl.innerText = 'Item Indisponível';
        return;
    }

    currentProduct = item; 
    basePrice = parseFloat(item.valor) || 0;

    // Update UI
    document.title = `Bar Los Hermanos - ${item.nome}`;
    
    if(heroBg) heroBg.style.backgroundImage = `url('${item.img_url || 'assets/img/placeholder_food.png'}')`;
    if(titleEl) titleEl.innerText = item.nome;
    
    // Atualizar preços
    updatePriceDisplay();

    // Render Ingredientes
    renderIngredients(item.ingredientes);

    // Update Favorite Button logic
    if (favBtn) {
        // Assume window.toggleFavorite exists globally from orders.js
        favBtn.onclick = (e) => {
            e.stopPropagation();
            if(window.toggleFavorite) window.toggleFavorite(item.nome, item.valor, item.img_url);
            
            // Toggle local visual state (simple version)
            const icon = favBtn.querySelector('span');
            if(icon.style.color === 'var(--color-primary)') {
                icon.style.color = 'white';
            } else {
                icon.style.color = 'var(--color-primary)';
            }
        };
    }

    // Update Cart Button Logic
    if (cartBtn) {
        console.log('[Details] Botão carrinho encontrado e configurado');
        cartBtn.style.display = 'flex'; // Garantir visibilidade
        cartBtn.onclick = async () => {
            console.log('[Details] Botão carrinho clicado!');
            const removedList = Array.from(removedIngredients);
            const extrasList = Array.from(selectedExtras.entries()).map(([name, price]) => ({ name, price }));
            const finalPrice = calculateTotalPrice();
            
            if(window.addToCart) {
                console.log('[Details] Chamando addToCart...');
                try {
                    await window.addToCart(
                        item.nome, 
                        finalPrice, // Preço com extras
                        item.img_url, 
                        removedList,
                        extrasList // Enviar extras para o carrinho
                    );
                    console.log('[Details] addToCart concluído');
                    
                    // Redirecionar para o carrinho após adicionar
                    // window.location.href = 'orders.html';
                } catch (e) {
                    console.error('[Details] Erro ao chamar addToCart:', e);
                }
                
                // Feedback visual
                cartBtn.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    cartBtn.style.transform = '';
                }, 150);
            } else {
                console.error('[Details] window.addToCart não está disponível!');
            }
        };
    } else {
        console.error('[Details] Botão carrinho NÃO encontrado!');
    }
}

// Calcular preço total (base + extras)
function calculateTotalPrice() {
    let extrasTotal = 0;
    selectedExtras.forEach(price => {
        extrasTotal += price;
    });
    return basePrice + extrasTotal;
}

// Atualizar display de preço
function updatePriceDisplay() {
    const priceTopEl = $('#product-price-top');
    const priceBtnEl = $('#btn-price-display');
    const totalPrice = calculateTotalPrice();
    
    if(priceTopEl) priceTopEl.innerText = formatCurrency(totalPrice);
    if(priceBtnEl) priceBtnEl.innerText = formatCurrency(totalPrice);
}

// Toggle extra (função global chamada pelo onclick)
window.toggleExtra = function(name, price) {
    const checkbox = document.getElementById(`extra-${name}`);
    if (!checkbox) return;
    
    // Prevenir duplo toggle (o label já dispara o checkbox)
    setTimeout(() => {
        const isChecked = checkbox.checked;
        
        if (isChecked) {
            selectedExtras.set(name, price);
        } else {
            selectedExtras.delete(name);
        }
        
        console.log('[Details] Extras atualizados:', Array.from(selectedExtras.entries()));
        updatePriceDisplay();
    }, 0);
};

function renderIngredients(ingredientsList) {
    const container = $('#ingredients-container');
    if (!container) return;

    container.innerHTML = '';

    if (!ingredientsList || !Array.isArray(ingredientsList) || ingredientsList.length === 0) {
        return;
    }

    ingredientsList.forEach(ingName => {
        const mapData = INGREDIENT_ICONS[ingName] || { icon: "ph-fork-knife", color: "text-gray-400" };
        const isRemoved = removedIngredients.has(ingName);
        
        // Determine Color Style
        const iconColor = isRemoved ? COLOR_MAP['text-gray-500'] : (COLOR_MAP[mapData.color] || '#ffffff');

        // [REF] assets/css/pages/product.css (.ingredient-card)
        const cardClass = `ingredient-card ${isRemoved ? 'ingredient-card--removed' : ''}`;

        const card = el('button', { 
            class: cardClass,
            onclick: () => toggleIngredient(ingName)
        }, [
            el('i', { 
                class: `ph-duotone ${mapData.icon}`,
                style: { fontSize: '24px', color: iconColor, transition: 'color 0.2s' }
            }),
            el('span', { class: 'ingredient-card__label' }, ingName)
        ]);
        
        container.appendChild(card);
    });
}

function toggleIngredient(name) {
    if (removedIngredients.has(name)) {
        removedIngredients.delete(name);
    } else {
        removedIngredients.add(name);
    }
    
    if (currentProduct && currentProduct.ingredientes) {
        renderIngredients(currentProduct.ingredientes);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});
