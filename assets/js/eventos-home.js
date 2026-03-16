/**
 * assets/js/eventos-home.js
 * Renderização dinâmica de eventos na landing page (index.html)
 * Busca eventos do Supabase e exibe em tabs por semana com cards 3:4
 */

// ============================================
// CONSTANTES
// ============================================

const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const MAX_WEEKS = 4; // Máximo de semanas exibidas

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Aguarda o Supabase estar disponível
    if (!window.supabaseClient) {
        console.warn('[Eventos Home] supabaseClient não disponível');
        return;
    }
    await loadAndRenderEventos();
});

// ============================================
// FETCH DE DADOS
// ============================================

/**
 * Busca eventos futuros com JOIN em atrações
 */
async function fetchEventosProximos() {
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
        const { data, error } = await window.supabaseClient
            .from('eventos')
            .select('*, atracoes(id, nome, foto_url)')
            .gte('data', todayISO)
            .eq('ativo', true)
            .order('data')
            .order('horario');

        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('[Eventos Home] Erro ao buscar eventos:', err);
        return [];
    }
}

// ============================================
// AGRUPAMENTO POR SEMANA
// ============================================

/**
 * Agrupa eventos por semana (segunda a domingo)
 * Retorna array de { label, startDate, endDate, eventos }
 */
function groupByWeek(eventos) {
    if (eventos.length === 0) return [];

    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    eventos.forEach(evento => {
        const eventDate = new Date(evento.data + 'T00:00:00');

        // Calcula início da semana (segunda) para este evento
        const day = eventDate.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        const weekStart = new Date(eventDate);
        weekStart.setDate(eventDate.getDate() + diffToMonday);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Procura semana existente
        const weekKey = weekStart.toISOString().split('T')[0];
        let week = weeks.find(w => w.key === weekKey);

        if (!week) {
            week = {
                key: weekKey,
                startDate: new Date(weekStart),
                endDate: new Date(weekEnd),
                label: getWeekLabel(weekStart, weekEnd, today),
                eventos: []
            };
            weeks.push(week);
        }

        week.eventos.push(evento);
    });

    // Ordena e limita
    weeks.sort((a, b) => a.startDate - b.startDate);
    return weeks.slice(0, MAX_WEEKS);
}

/**
 * Gera label legível para a tab da semana
 */
function getWeekLabel(start, end, today) {
    // Verifica se é "esta semana"
    const todayDay = today.getDay();
    const diffToMonday = todayDay === 0 ? -6 : 1 - todayDay;
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() + diffToMonday);
    thisWeekStart.setHours(0, 0, 0, 0);

    if (start.getTime() === thisWeekStart.getTime()) {
        return 'Esta Semana';
    }

    // Formata como "17-23 Mar"
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = MONTHS_SHORT[end.getMonth()];

    if (start.getMonth() === end.getMonth()) {
        return `${startDay}-${endDay} ${month}`;
    }
    // Semana cruza meses
    return `${startDay} ${MONTHS_SHORT[start.getMonth()]} - ${endDay} ${month}`;
}

// ============================================
// RENDERIZAÇÃO
// ============================================

async function loadAndRenderEventos() {
    const eventos = await fetchEventosProximos();

    const tabsContainer = document.getElementById('events-tabs');
    const cardsContainer = document.getElementById('events-cards-grid');

    if (!cardsContainer) return;

    if (eventos.length === 0) {
        // Sem eventos: esconde a seção inteira
        const section = document.getElementById('events');
        if (section) section.style.display = 'none';
        return;
    }

    // Remove container de tabs se existir (não será mais usado)
    if (tabsContainer) tabsContainer.style.display = 'none';

    // Renderiza todos os eventos em sequência
    renderCards(cardsContainer, eventos);
}

/**
 * Renderiza cards de eventos + card "Ver Tudo" se necessário
 */
function renderCards(container, eventos) {
    container.innerHTML = '';

    // Renderiza cada evento
    eventos.forEach(evento => {
        const card = createEventCard(evento);
        container.appendChild(card);
    });

    // Se houver mais de 5 eventos, adiciona o card "Ver Tudo"
    if (eventos.length > 5) {
        const moreCard = document.createElement('div');
        moreCard.className = 'event-card-more';
        moreCard.innerHTML = `
            <i class="fas fa-arrow-right"></i>
            <span>Ver Agenda Completa</span>
        `;
        moreCard.addEventListener('click', () => {
             // Redireciona ou abre modal com a agenda (podemos usar o link do painel se for público ou só uma âncora)
             window.open('https://www.instagram.com/barloshermanosgv', '_blank');
        });
        container.appendChild(moreCard);
    }
}

/**
 * Cria card individual de evento
 */
function createEventCard(evento) {
    const atracao = evento.atracoes || {};
    const card = document.createElement('div');
    card.className = 'event-card-new';

    // Formata data e horário
    const eventDate = new Date(evento.data + 'T00:00:00');
    const dayName = DAYS_SHORT[eventDate.getDay()];
    const dayNum = eventDate.getDate();
    const month = MONTHS_SHORT[eventDate.getMonth()];
    const startStr = evento.horario ? evento.horario.substring(0, 5) : '';
    const endStr = evento.horario_fim ? evento.horario_fim.substring(0, 5) : '';
    const timeDisplay = endStr ? `${startStr} - ${endStr}` : startStr;

    card.innerHTML = `
        <div class="event-card-new__image">
            <img src="${atracao.foto_url || 'assets/img/menu/comida_01.jpg'}"
                 alt="${atracao.nome || 'Evento'}"
                 loading="lazy"
                 onerror="this.src='assets/img/menu/comida_01.jpg'">
        </div>
        <div class="event-card-new__info">
            <h3 class="event-card-new__name">${atracao.nome || 'Evento'}</h3>
            ${evento.descricao ? `<p class="event-card-new__desc">${evento.descricao}</p>` : ''}
            <div class="event-card-new__meta">
                <span class="event-card-new__time"><i class="fas fa-clock"></i> ${timeDisplay}</span>
                <span class="event-card-new__date">${dayName}, ${dayNum} ${month}</span>
            </div>
        </div>
    `;

    return card;
}
