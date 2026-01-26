
// details-view.js - Lógica da Página de Detalhes

// Helper de Formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Carregar Detalhes
async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        alert('Produto não encontrado!');
        window.location.href = 'orders.html';
        return;
    }

    // Elements
    const imgEl = document.querySelector('.bg-cover'); 
    const titleEl = document.querySelector('h1');
    const priceEl = document.querySelector('.text-3xl.font-bold.text-primary');
    const descEl = document.querySelector('p.text-white\\/70');
    const ratingEl = document.querySelector('.text-white.font-semibold'); // Mock Rating
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
        titleEl.innerText = 'Item Indisponível';
        return;
    }

    // Update UI
    document.title = `Bar Los Hermanos - ${item.nome}`;
    
    // Background Image
    if(imgEl) {
        imgEl.style.backgroundImage = `url('${item.img_url || 'assets/img/placeholder_food.png'}')`;
    }

    // Texts
    if(titleEl) titleEl.innerText = item.nome;
    if(priceEl) priceEl.innerText = formatCurrency(item.valor);
    if(descEl) descEl.innerText = item.descricao || 'Sem descrição.';
    if(ratingEl) ratingEl.innerText = '5.0'; // Mock

    // Update Favorite Button Logic
    if (favBtn) {
        // Safe strings for inline onclick (if we were using it, but let's use event listener)
        favBtn.setAttribute('data-favorite-name', item.nome);
        favBtn.onclick = (e) => {
            e.stopPropagation();
            window.toggleFavorite(item.nome, item.valor, item.img_url);
        };

        // Check initial state
        // Precisamos esperar o orders.js carregar os favoritos do banco primeiro ou checar aqui
        // Como loadProductDetails roda no DOMContentLoaded, se orders.js também roda, pode ter race condition.
        // Vamos checar intervalado ou esperar signal?
        // Simples: chamamos updateFavoriteIcons() aqui, ela vai olhar o array global currentUserFavs.
        // Se orders.js ainda não carregou, vai estar vazio.
        // Melhor disparar um check após loadFavorites terminar.
        // Por hora, deixamos o orders.js cuidar disso via updateFavoriteIcons global.
    }

    // Update Cart Button Logic
    if (cartBtn) {
        // Atualiza UI do botão
        const spanPrice = document.getElementById('btn-price-display');
        if (spanPrice) spanPrice.innerText = formatCurrency(item.valor);

        cartBtn.onclick = () => {
            window.addToCart(item.nome, item.valor, item.img_url || 'assets/img/placeholder_food.png');
        };
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
    
    // Pequeno delay para garantir que orders.js carregou favoritos
    setTimeout(() => {
        if(window.updateFavoriteIcons) window.updateFavoriteIcons();
    }, 1000);
});
