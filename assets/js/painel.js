/**
 * assets/js/painel.js
 * Painel Administrativo v2
 * Sidebar + 3 sub-tabs (Pratos, Insumos, Bebidas) + Cards clicáveis
 */

// ============================================================
// ESTADO GLOBAL
// ============================================================

let allInsumos = [];
let allPratos = [];
let insumosInativos = [];
let currentSection = 'produtos';
let currentSubtab = 'pratos';
let activePratosCategory = '';

const INSUMO_CATEGORIES = ['carnes', 'pescados', 'queijos', 'vegetais'];
const INSUMO_LABELS = { carnes: 'Carnes', pescados: 'Pescados', queijos: 'Queijos', vegetais: 'Vegetais' };

// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('[Painel] Inicializando v2...');
    setupSidebar();
    setupSubtabs();
    setupMobileSidebar();
    await loadData();
    renderCategoryPills();
    render();
    setupSearch();
    console.log('[Painel] Pronto.');
});

async function loadData() {
    showLoading(true);
    try {
        const [insumosRes, pratosRes] = await Promise.all([
            window.supabaseClient.from('insumos').select('*').order('categoria, nome'),
            window.supabaseClient.from('cardapio')
                .select('id, nome, valor, categoria, img_url, ativo, insumos_chave, override_insumo')
                .order('categoria, nome')
        ]);
        if (insumosRes.error) throw insumosRes.error;
        if (pratosRes.error) throw pratosRes.error;

        allInsumos = insumosRes.data || [];
        allPratos = pratosRes.data || [];
        insumosInativos = allInsumos.filter(i => !i.ativo).map(i => i.nome);
    } catch (error) {
        console.error('[Painel] Erro:', error);
        showToast('Erro ao carregar dados', 'error');
    }
    showLoading(false);
}

// ============================================================
// SIDEBAR
// ============================================================

function setupSidebar() {
    document.querySelectorAll('.sidebar__item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.dataset.section;
            if (section === currentSection) return;
            currentSection = section;

            document.querySelectorAll('.sidebar__item').forEach(i => i.classList.remove('sidebar__item--active'));
            item.classList.add('sidebar__item--active');

            document.querySelectorAll('.section').forEach(s => s.classList.remove('section--active'));
            document.getElementById(`section-${section}`)?.classList.add('section--active');

            document.getElementById('main-title').textContent = item.dataset.title || section;
            closeMobileSidebar();
        });
    });
}

// ============================================================
// SUB-TABS
// ============================================================

function setupSubtabs() {
    document.querySelectorAll('.subtab').forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.subtab;
            if (target === currentSubtab) return;
            currentSubtab = target;

            document.querySelectorAll('.subtab').forEach(t => t.classList.remove('subtab--active'));
            tab.classList.add('subtab--active');

            document.querySelectorAll('.subtab-content').forEach(c => c.classList.remove('subtab-content--active'));
            document.getElementById(`subtab-${target}`)?.classList.add('subtab-content--active');
        });
    });
}

// ============================================================
// CATEGORY PILLS (só para aba Pratos)
// ============================================================

function renderCategoryPills() {
    const container = document.getElementById('pratos-categories');
    container.innerHTML = '';

    // Categorias dos pratos (exclui bebidas)
    const cats = [...new Set(
        allPratos
            .filter(p => p.categoria !== 'bebidas')
            .map(p => p.categoria)
            .filter(Boolean)
    )].sort();

    container.appendChild(createPill('', 'Todos', activePratosCategory === ''));
    cats.forEach(cat => {
        container.appendChild(createPill(cat, cat.charAt(0).toUpperCase() + cat.slice(1), activePratosCategory === cat));
    });
}

function createPill(value, label, isActive) {
    const pill = document.createElement('button');
    pill.className = `pill${isActive ? ' pill--active' : ''}`;
    pill.textContent = label;
    pill.addEventListener('click', () => {
        activePratosCategory = value;
        renderCategoryPills();
        const search = document.getElementById('products-search');
        renderPratos(search?.value || '', activePratosCategory);
    });
    return pill;
}

// ============================================================
// RENDERIZAÇÃO PRINCIPAL
// ============================================================

function render() {
    renderStats();
    renderPratos('', activePratosCategory);
    renderInsumos();
    renderBebidas();
}

// ============================================================
// STATS
// ============================================================

function renderStats() {
    const visiveis = allPratos.filter(p => isPratoVisible(p)).length;
    const inativos = allPratos.length - visiveis;
    const overrides = allPratos.filter(p => p.override_insumo).length;
    const insumosAtivos = allInsumos.filter(i => i.ativo).length;

    document.getElementById('stat-ativos').textContent = visiveis;
    document.getElementById('stat-inativos').textContent = inativos;
    document.getElementById('stat-overrides').textContent = overrides;
    document.getElementById('stat-insumos').textContent = `${insumosAtivos}/${allInsumos.length}`;
}

// ============================================================
// ABA: PRATOS (exclui bebidas)
// ============================================================

function renderPratos(filterText = '', filterCategory = '') {
    const container = document.getElementById('cardapio-container');
    container.innerHTML = '';

    // Filtra — exclui bebidas desta aba
    let pratos = allPratos.filter(p => p.categoria !== 'bebidas');

    if (filterText) {
        const s = filterText.toLowerCase();
        pratos = pratos.filter(p => p.nome.toLowerCase().includes(s));
    }
    if (filterCategory) {
        pratos = pratos.filter(p => p.categoria === filterCategory);
    }

    // Agrupa por categoria
    const grouped = {};
    pratos.forEach(p => {
        const cat = p.categoria || 'sem_categoria';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(p);
    });

    Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).forEach(([cat, items]) => {
        const group = document.createElement('div');
        group.className = 'category-group';

        const title = document.createElement('h3');
        title.className = 'category-group__title';
        title.textContent = cat.replace(/_/g, ' ');
        group.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'products-grid';
        items.forEach(prato => grid.appendChild(createProductCard(prato)));
        group.appendChild(grid);
        container.appendChild(group);
    });

    if (pratos.length === 0) {
        container.innerHTML = '<p style="color: var(--color-white-40); text-align: center; padding: 2rem;">Nenhum prato encontrado</p>';
    }
}

// ============================================================
// ABA: BEBIDAS
// ============================================================

function renderBebidas(filterText = '') {
    const container = document.getElementById('bebidas-container');
    container.innerHTML = '';

    let bebidas = allPratos.filter(p => p.categoria === 'bebidas');

    if (filterText) {
        const s = filterText.toLowerCase();
        bebidas = bebidas.filter(p => p.nome.toLowerCase().includes(s));
    }

    const grid = document.createElement('div');
    grid.className = 'products-grid';
    bebidas.forEach(b => grid.appendChild(createProductCard(b)));
    container.appendChild(grid);

    if (bebidas.length === 0) {
        container.innerHTML = '<p style="color: var(--color-white-40); text-align: center; padding: 2rem;">Nenhuma bebida encontrada</p>';
    }
}

// ============================================================
// CARD DE PRODUTO (compartilhado Pratos + Bebidas)
// ============================================================

function createProductCard(prato) {
    const status = getPratoStatus(prato);
    let extra = '';
    if (status.type === 'manual') extra = ' product-card-admin--inactive';
    else if (status.type === 'insumo') extra = ' product-card-admin--insumo';
    else if (status.type === 'override') extra = ' product-card-admin--override';

    const card = document.createElement('div');
    card.className = `product-card-admin${extra}`;
    card.addEventListener('click', () => handleProductClick(prato, status));

    let hintHTML = '';
    if (status.type === 'insumo') {
        const faltando = (prato.insumos_chave || []).filter(n => insumosInativos.includes(n));
        hintHTML = `<div class="product-card-admin__hint">${faltando.join(', ')}</div>`;
    }

    card.innerHTML = `
        <div class="product-card-admin__image" style="background-image: url('${prato.img_url || 'assets/img/placeholder_food.png'}')">
            <span class="product-card-admin__badge badge--${status.type}">${status.label}</span>
        </div>
        <div class="product-card-admin__body">
            <div class="product-card-admin__name" title="${prato.nome}">${prato.nome}</div>
            <div class="product-card-admin__price">R$ ${Number(prato.valor).toFixed(2).replace('.', ',')}</div>
            ${hintHTML}
        </div>
    `;
    return card;
}

async function handleProductClick(prato, status) {
    switch (status.type) {
        case 'ativo': await togglePrato(prato.id, false); break;
        case 'manual': await togglePrato(prato.id, true); break;
        case 'insumo': await overridePrato(prato.id); break;
        case 'override': await removeOverride(prato.id); break;
    }
}

// ============================================================
// ABA: INSUMOS (4 colunas fixas por categoria)
// ============================================================

function renderInsumos() {
    const container = document.getElementById('insumos-container');
    container.innerHTML = '';

    // Uma coluna por categoria
    INSUMO_CATEGORIES.forEach(cat => {
        const items = allInsumos.filter(i => i.categoria === cat);
        if (items.length === 0) return;

        const column = document.createElement('div');
        column.className = 'insumo-column';

        // Título da coluna
        const title = document.createElement('h3');
        title.className = 'insumo-column__title';
        title.textContent = INSUMO_LABELS[cat] || cat;
        column.appendChild(title);

        // Sub-grid de 2 colunas
        const grid = document.createElement('div');
        grid.className = 'insumo-column__grid';
        items.forEach(insumo => grid.appendChild(createInsumoCard(insumo)));
        column.appendChild(grid);

        container.appendChild(column);
    });

    renderAffected();
}

function createInsumoCard(insumo) {
    const count = allPratos.filter(p => (p.insumos_chave || []).includes(insumo.nome)).length;

    const card = document.createElement('div');
    card.className = `insumo-card ${insumo.ativo ? 'insumo-card--active' : 'insumo-card--inactive'}`;
    card.addEventListener('click', () => toggleInsumo(insumo.id, insumo.nome, !insumo.ativo));

    card.innerHTML = `
        <div class="insumo-card__header">
            <span class="insumo-card__name">${insumo.nome}</span>
            <span class="insumo-card__dot ${insumo.ativo ? 'insumo-card__dot--on' : 'insumo-card__dot--off'}"></span>
        </div>
        <span class="insumo-card__count">${count} prato${count !== 1 ? 's' : ''}</span>
    `;
    return card;
}

function renderAffected() {
    const container = document.getElementById('affected-dishes');
    const affected = allPratos.filter(p => {
        if (!p.ativo || p.override_insumo) return false;
        return (p.insumos_chave || []).some(n => insumosInativos.includes(n));
    });

    if (affected.length === 0) {
        container.innerHTML = '';
        container.classList.add('affected-panel--empty');
        return;
    }
    container.classList.remove('affected-panel--empty');
    container.innerHTML = `
        <div class="affected-panel__title">${affected.length} prato${affected.length !== 1 ? 's' : ''} afetado${affected.length !== 1 ? 's' : ''}</div>
        <div class="affected-panel__list">
            ${affected.map(p => `<span class="affected-panel__chip">${p.nome}</span>`).join('')}
        </div>
    `;
}

// ============================================================
// LÓGICA DE STATUS
// ============================================================

function getPratoStatus(prato) {
    if (!prato.ativo) return { type: 'manual', label: 'Desativado' };
    if (prato.override_insumo) return { type: 'override', label: 'Override' };
    const chaves = prato.insumos_chave || [];
    if (chaves.some(n => insumosInativos.includes(n))) return { type: 'insumo', label: 'Insumo' };
    return { type: 'ativo', label: 'Ativo' };
}

function isPratoVisible(prato) {
    const s = getPratoStatus(prato);
    return s.type === 'ativo' || s.type === 'override';
}

// ============================================================
// AÇÕES
// ============================================================

async function toggleInsumo(id, nome, novoEstado) {
    try {
        const { error } = await window.supabaseClient
            .from('insumos').update({ ativo: novoEstado }).eq('id', id);
        if (error) throw error;

        if (novoEstado) {
            await window.supabaseClient
                .from('cardapio')
                .update({ override_insumo: false })
                .contains('insumos_chave', JSON.stringify([nome]));
        }
        await loadData();
        render();
        showToast(`${nome} ${novoEstado ? 'reativado' : 'desativado'}`, 'success');
    } catch (err) {
        console.error('[Painel] Erro:', err);
        showToast('Erro ao atualizar insumo', 'error');
        await loadData();
        render();
    }
}

async function togglePrato(id, novoEstado) {
    try {
        const { error } = await window.supabaseClient
            .from('cardapio').update({ ativo: novoEstado }).eq('id', id);
        if (error) throw error;
        await loadData();
        render();
        const p = allPratos.find(x => x.id === id);
        showToast(`${p?.nome || 'Prato'} ${novoEstado ? 'reativado' : 'desativado'}`, 'success');
    } catch (err) {
        console.error('[Painel] Erro:', err);
        showToast('Erro ao atualizar prato', 'error');
    }
}

async function overridePrato(id) {
    try {
        const { error } = await window.supabaseClient
            .from('cardapio').update({ override_insumo: true }).eq('id', id);
        if (error) throw error;
        await loadData();
        render();
        showToast('Override ativado', 'info');
    } catch (err) {
        console.error('[Painel] Erro:', err);
        showToast('Erro ao aplicar override', 'error');
    }
}

async function removeOverride(id) {
    try {
        const { error } = await window.supabaseClient
            .from('cardapio').update({ override_insumo: false }).eq('id', id);
        if (error) throw error;
        await loadData();
        render();
        showToast('Override removido', 'success');
    } catch (err) {
        console.error('[Painel] Erro:', err);
        showToast('Erro ao remover override', 'error');
    }
}

// ============================================================
// BUSCA
// ============================================================

function setupSearch() {
    const pratosSearch = document.getElementById('products-search');
    if (pratosSearch) {
        let t;
        pratosSearch.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(() => renderPratos(pratosSearch.value, activePratosCategory), 300);
        });
    }

    const bebidasSearch = document.getElementById('bebidas-search');
    if (bebidasSearch) {
        let t2;
        bebidasSearch.addEventListener('input', () => {
            clearTimeout(t2);
            t2 = setTimeout(() => renderBebidas(bebidasSearch.value), 300);
        });
    }
}

// ============================================================
// MOBILE SIDEBAR
// ============================================================

function setupMobileSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.getElementById('sidebar-overlay');
    if (toggle) toggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('sidebar--open');
        overlay.classList.toggle('sidebar-overlay--visible');
    });
    if (overlay) overlay.addEventListener('click', closeMobileSidebar);
}

function closeMobileSidebar() {
    document.getElementById('sidebar')?.classList.remove('sidebar--open');
    document.getElementById('sidebar-overlay')?.classList.remove('sidebar-overlay--visible');
}

// ============================================================
// UI HELPERS
// ============================================================

function showLoading(show) {
    const loader = document.getElementById('painel-loading');
    const content = document.getElementById('painel-content');
    if (loader) loader.style.display = show ? 'flex' : 'none';
    if (content) content.style.display = show ? 'none' : 'block';
}

function showToast(message, type = 'success') {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
        toast.classList.remove('toast--visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
