
// details-view.js - Lógica da Página de Detalhes

// --- Mapeamento de Ingredientes ---
const INGREDIENT_ICONS = {
    "Carne": { icon: "ph-hamburger", color: "text-orange-400" },
    "Queijo": { icon: "ph-cheese", color: "text-yellow-400" },
    "Bacon": { icon: "ph-waves", color: "text-red-500" },
    "Alface": { icon: "ph-plant", color: "text-green-500" },
    "Tomate": { icon: "ph-pizza", color: "text-red-600" }, // Metafórico até achar melhor
    "Cebola": { icon: "ph-wind", color: "text-purple-300" },
    "Ovo": { icon: "ph-egg", color: "text-yellow-200" },
    "Picles": { icon: "ph-cactus", color: "text-green-700" },
    "Molho": { icon: "ph-drop", color: "text-orange-300" },
    "Pão": { icon: "ph-grains", color: "text-amber-200" }
};

// Estado local de exclusão
let removedIngredients = new Set();
let currentProduct = null;

// Helper de Formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Carregar Detalhes
async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        // Fallback silencioso ou redirect
        window.location.href = 'orders.html';
        return;
    }

    // Elements
    const imgEl = document.querySelector('.bg-cover'); 
    const titleEl = document.querySelector('h1');
    const priceEl = document.querySelector('.text-3xl.font-bold.text-primary'); // Preço topo direita
    const priceBtnEl = document.getElementById('btn-price-display'); // Preço botão
    const descEl = document.querySelector('p.text-white\\/70');
    const ratingEl = document.querySelector('.text-white.font-semibold');
    const favBtn = document.querySelector('[data-favorite-name]');
    const cartBtn = document.getElementById('btn-add-cart');

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

    currentProduct = item; // Guardar referência global

    // Update UI
    document.title = `Bar Los Hermanos - ${item.nome}`;
    
    if(imgEl) imgEl.style.backgroundImage = `url('${item.img_url || 'assets/img/placeholder_food.png'}')`;
    if(titleEl) titleEl.innerText = item.nome;
    if(priceEl) priceEl.innerText = formatCurrency(item.valor);
    if(priceBtnEl) priceBtnEl.innerText = formatCurrency(item.valor);
    if(descEl) descEl.innerText = item.descricao || 'Sem descrição.';
    if(ratingEl) ratingEl.innerText = '5.0'; 

    // Render Ingredientes
    renderIngredients(item.ingredientes);

    // Update Favorite Button
    if (favBtn) {
        favBtn.setAttribute('data-favorite-name', item.nome);
        favBtn.onclick = (e) => {
            e.stopPropagation();
            window.toggleFavorite(item.nome, item.valor, item.img_url);
        };
    }

    // Update Cart Button
    if (cartBtn) {
        cartBtn.onclick = () => {
            // Passar lista de removidos para o carrinho
            // Convertendo Set para Array
            const removedList = Array.from(removedIngredients);
            window.addToCart(
                item.nome, 
                item.valor, 
                item.img_url || 'assets/img/placeholder_food.png', 
                removedList
            );
            
            // Feedback simples (opcional, já que addToCart pode ter)
            // Resetar estado após adicionar? 
            // removedIngredients.clear();
            // renderIngredients(item.ingredientes);
            // Decisão: manter estado caso usuário queira adicionar outro igual.
        };
    }
}

function renderIngredients(ingredientsList) {
    const container = document.getElementById('ingredients-container');
    if (!container) return;

    container.innerHTML = '';

    // Se nulo ou vazio, esconder seção inteira? Por enquanto deixa vazio.
    if (!ingredientsList || !Array.isArray(ingredientsList) || ingredientsList.length === 0) {
        // Opcional: container.innerHTML = '<span class="text-white/50 text-sm italic">Sem ingredientes listados.</span>';
        return;
    }

    ingredientsList.forEach(ingName => {
        // Tenta achar no mapa, se não, usa fallback
        const mapData = INGREDIENT_ICONS[ingName] || { icon: "ph-fork-knife", color: "text-gray-400" };
        
        // Verificar estado (removido ou não)
        const isRemoved = removedIngredients.has(ingName);
        
        // Estilos dinâmicos
        const activeClasses = "glass-panel opacity-100 border-transparent";
        const removedClasses = "bg-white/5 opacity-50 grayscale border-red-500/30 line-through decoration-red-500 decoration-2";
        
        const card = document.createElement('button');
        card.className = `min-w-[70px] h-[90px] rounded-2xl flex flex-col items-center justify-center gap-2 p-2 border transition-all active:scale-95 ${isRemoved ? removedClasses : activeClasses}`;
        
        card.innerHTML = `
            <i class="ph-duotone ${mapData.icon} text-2xl ${isRemoved ? 'text-gray-500' : mapData.color} transition-colors"></i>
            <span class="text-xs font-medium text-white/80 ${isRemoved ? 'line-through' : ''}">${ingName}</span>
        `;

        card.onclick = () => toggleIngredient(ingName);
        
        container.appendChild(card);
    });
}

function toggleIngredient(name) {
    if (removedIngredients.has(name)) {
        removedIngredients.delete(name);
    } else {
        removedIngredients.add(name);
    }
    // Re-renderizar para atualizar visual
    // Usamos currentProduct.ingredientes pois é a fonte da verdade da ordem
    if (currentProduct && currentProduct.ingredientes) {
        renderIngredients(currentProduct.ingredientes);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    
    setTimeout(() => {
        if(window.updateFavoriteIcons) window.updateFavoriteIcons();
    }, 1000);
});
