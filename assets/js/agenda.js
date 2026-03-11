/**
 * assets/js/agenda.js
 * Módulo de Agenda — Calendário + CRUD de Eventos + Upload/Crop de Atrações
 * v2: Timeline semanal com horas, miniatura, horário de término, time picker
 * Utiliza Cropper.js (CDN) para recorte de imagens em ratio 3:4
 */

// ============================================
// CONSTANTES E ESTADO
// ============================================

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const STORAGE_BUCKET = 'atracoes';
const DESC_MAX_LENGTH = 150;

// Faixa de horas exibidas na timeline semanal
const TIMELINE_START_HOUR = 16;
const TIMELINE_END_HOUR = 24; // 00:00 do dia seguinte

// Estado do módulo
let currentDate = new Date();
let currentView = 'week'; // 'week' | 'month'
let eventosCache = [];
let atracoesCache = [];
let cropper = null;
let editingEventId = null; // null = criando, number = editando
let selectedAtracao = null;

// ============================================
// INICIALIZAÇÃO
// ============================================

async function initAgenda() {
    console.log('[Agenda] Inicializando...');
    renderCalendarHeader();
    await loadAndRender();
}

async function loadAndRender() {
    const range = currentView === 'week' ? getWeekRange(currentDate) : getMonthRange(currentDate);
    await loadEventos(range.start, range.end);

    if (currentView === 'week') {
        renderWeekView();
    } else {
        renderMonthView();
    }
}

// ============================================
// CÁLCULOS DE DATA
// ============================================

function getWeekRange(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const start = new Date(d);
    start.setDate(d.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function getMonthRange(date) {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
}

function formatDateISO(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatWeekLabel(start, end) {
    const startDay = start.getDate();
    const endDay = end.getDate();
    const month = MONTHS_PT[end.getMonth()].substring(0, 3);
    const year = end.getFullYear();
    return `${startDay} - ${endDay} ${month} ${year}`;
}

function formatMonthLabel(date) {
    return `${MONTHS_PT[date.getMonth()]} ${date.getFullYear()}`;
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

/**
 * Converte string de hora "HH:MM" ou "HH:MM:SS" para fração de hora
 */
function timeToHour(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
}

// ============================================
// FETCH DE DADOS (SUPABASE)
// ============================================

async function loadEventos(startDate, endDate) {
    try {
        const { data, error } = await window.supabaseClient
            .from('eventos')
            .select('*, atracoes(id, nome, foto_url)')
            .gte('data', formatDateISO(startDate))
            .lte('data', formatDateISO(endDate))
            .eq('ativo', true)
            .order('data')
            .order('horario');

        if (error) throw error;
        eventosCache = data || [];
        console.log('[Agenda] Eventos carregados:', eventosCache.length);
    } catch (err) {
        console.error('[Agenda] Erro ao carregar eventos:', err);
        eventosCache = [];
    }
}

async function loadAtracoes() {
    try {
        const { data, error } = await window.supabaseClient
            .from('atracoes')
            .select('*')
            .order('nome');
        if (error) throw error;
        atracoesCache = data || [];
    } catch (err) {
        console.error('[Agenda] Erro ao carregar atrações:', err);
        atracoesCache = [];
    }
}

// ============================================
// CABEÇALHO DO CALENDÁRIO
// ============================================

function renderCalendarHeader() {
    const container = document.getElementById('agenda-calendar');
    if (!container) return;

    container.innerHTML = '';

    const header = document.createElement('div');
    header.className = 'calendar__header';
    header.innerHTML = `
        <div class="calendar__nav">
            <button class="calendar__nav-btn" id="cal-prev" aria-label="Anterior">◀</button>
            <span class="calendar__nav-label" id="cal-label"></span>
            <button class="calendar__nav-btn" id="cal-next" aria-label="Próximo">▶</button>
        </div>
        <div class="calendar__toggle">
            <button class="calendar__toggle-btn calendar__toggle-btn--active" data-view="week">Semana</button>
            <button class="calendar__toggle-btn" data-view="month">Mês</button>
        </div>
    `;

    const grid = document.createElement('div');
    grid.className = 'calendar__grid';
    grid.id = 'cal-grid';

    container.appendChild(header);
    container.appendChild(grid);

    document.getElementById('cal-prev').addEventListener('click', () => navigate(-1));
    document.getElementById('cal-next').addEventListener('click', () => navigate(1));

    header.querySelectorAll('.calendar__toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view === currentView) return;
            currentView = view;
            header.querySelectorAll('.calendar__toggle-btn').forEach(b =>
                b.classList.toggle('calendar__toggle-btn--active', b.dataset.view === view)
            );
            loadAndRender();
        });
    });

    updateCalendarLabel();
}

function updateCalendarLabel() {
    const label = document.getElementById('cal-label');
    if (!label) return;
    if (currentView === 'week') {
        const range = getWeekRange(currentDate);
        label.textContent = formatWeekLabel(range.start, range.end);
    } else {
        label.textContent = formatMonthLabel(currentDate);
    }
}

function navigate(delta) {
    if (currentView === 'week') {
        currentDate.setDate(currentDate.getDate() + (delta * 7));
    } else {
        currentDate.setMonth(currentDate.getMonth() + delta);
    }
    updateCalendarLabel();
    loadAndRender();
}

// ============================================
// VISÃO SEMANAL — TIMELINE COM HORAS
// ============================================

function renderWeekView() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.className = 'calendar__week-timeline';

    const range = getWeekRange(currentDate);
    const today = new Date();
    const totalHours = TIMELINE_END_HOUR - TIMELINE_START_HOUR;

    // === Cabeçalho: vazio + 7 dias ===
    const headerRow = document.createElement('div');
    headerRow.className = 'tl__header-row';

    // Célula vazia (coluna de horas)
    const cornerCell = document.createElement('div');
    cornerCell.className = 'tl__corner';
    headerRow.appendChild(cornerCell);

    // Cabeçalho de cada dia
    const daysHeader = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    for (let i = 0; i < 7; i++) {
        const dayDate = new Date(range.start);
        dayDate.setDate(range.start.getDate() + i);

        const cell = document.createElement('div');
        cell.className = 'tl__day-header';
        if (isSameDay(dayDate, today)) cell.classList.add('tl__day-header--today');

        cell.innerHTML = `
            <span class="tl__day-name">${daysHeader[i]}</span>
            <span class="tl__day-num">${dayDate.getDate()}</span>
        `;
        headerRow.appendChild(cell);
    }
    grid.appendChild(headerRow);

    // === Corpo: grade de horas x dias ===
    const body = document.createElement('div');
    body.className = 'tl__body';

    for (let h = TIMELINE_START_HOUR; h < TIMELINE_END_HOUR; h++) {
        const row = document.createElement('div');
        row.className = 'tl__row';

        // Coluna de hora
        const hourCell = document.createElement('div');
        hourCell.className = 'tl__hour-label';
        hourCell.textContent = `${String(h).padStart(2, '0')}:00`;
        row.appendChild(hourCell);

        // 7 dias
        for (let d = 0; d < 7; d++) {
            const dayDate = new Date(range.start);
            dayDate.setDate(range.start.getDate() + d);

            const cell = document.createElement('div');
            cell.className = 'tl__cell';
            if (isSameDay(dayDate, today)) cell.classList.add('tl__cell--today');

            // Clique na célula para criar evento com hora pré-preenchida
            const clickHour = h;
            cell.addEventListener('click', () => {
                openEventModal(dayDate, null, `${String(clickHour).padStart(2, '0')}:00`);
            });

            row.appendChild(cell);
        }

        body.appendChild(row);
    }

    // === Posiciona eventos como blocos flutuantes ===
    // Precisamos de um container relativo por dia
    const dayContainers = [];
    for (let d = 0; d < 7; d++) {
        const dayDate = new Date(range.start);
        dayDate.setDate(range.start.getDate() + d);
        const dayISO = formatDateISO(dayDate);
        const dayEvents = eventosCache.filter(e => e.data === dayISO);

        dayContainers.push({ dayDate, dayISO, events: dayEvents, colIndex: d });
    }

    grid.appendChild(body);

    // Renderiza eventos sobre a grade (após o body estar no DOM)
    requestAnimationFrame(() => {
        const bodyRect = body.getBoundingClientRect();
        const rowHeight = body.querySelector('.tl__row')?.offsetHeight || 50;

        dayContainers.forEach(({ dayDate, events, colIndex }) => {
            events.forEach(evento => {
                const startHour = timeToHour(evento.horario);
                const endHour = evento.horario_fim ? timeToHour(evento.horario_fim) : startHour + 1;

                // Posição e tamanho relativo à grade
                const topOffset = (startHour - TIMELINE_START_HOUR) * rowHeight;
                const height = Math.max((endHour - startHour) * rowHeight, rowHeight * 0.5);

                // Largura de cada coluna de dia
                const totalWidth = body.offsetWidth;
                const hourLabelWidth = body.querySelector('.tl__hour-label')?.offsetWidth || 50;
                const dayWidth = (totalWidth - hourLabelWidth) / 7;
                const leftOffset = hourLabelWidth + (colIndex * dayWidth);

                const block = document.createElement('div');
                block.className = 'tl__event-block';
                block.style.top = `${topOffset}px`;
                block.style.left = `${leftOffset}px`;
                block.style.width = `${dayWidth - 4}px`;
                block.style.height = `${height - 2}px`;

                const atracao = evento.atracoes || {};
                const startStr = evento.horario ? evento.horario.substring(0, 5) : '';
                const endStr = evento.horario_fim ? evento.horario_fim.substring(0, 5) : '';
                const timeRange = endStr ? `${startStr} - ${endStr}` : startStr;

                // Miniatura + info
                block.innerHTML = `
                    ${atracao.foto_url ? `<img class="tl__event-thumb" src="${atracao.foto_url}" alt="${atracao.nome}" onerror="this.style.display='none'">` : ''}
                    <div class="tl__event-info">
                        <span class="tl__event-name">${atracao.nome || 'Evento'}</span>
                        <span class="tl__event-time">${timeRange}</span>
                    </div>
                `;

                block.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEventModal(dayDate, evento);
                });

                body.appendChild(block);
            });
        });
    });
}

// ============================================
// VISÃO MENSAL (sem alterações significativas)
// ============================================

function renderMonthView() {
    const grid = document.getElementById('cal-grid');
    if (!grid) return;

    grid.innerHTML = '';
    grid.className = 'calendar__grid calendar__grid--month';

    const today = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysHeader = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    daysHeader.forEach(dayName => {
        const headerCell = document.createElement('div');
        headerCell.className = 'calendar__day-header';
        headerCell.textContent = dayName;
        grid.appendChild(headerCell);
    });

    const firstDay = new Date(year, month, 1);
    let startDay = firstDay.getDay();
    startDay = startDay === 0 ? 6 : startDay - 1;
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'calendar__day calendar__day--empty';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= lastDay; day++) {
        const dayDate = new Date(year, month, day);
        const cell = document.createElement('div');
        cell.className = 'calendar__day';

        if (isSameDay(dayDate, today)) cell.classList.add('calendar__day--today');

        const dayNum = document.createElement('span');
        dayNum.className = 'calendar__day-num';
        dayNum.textContent = day;
        cell.appendChild(dayNum);

        const dayISO = formatDateISO(dayDate);
        const dayEvents = eventosCache.filter(e => e.data === dayISO);

        if (dayEvents.length > 0) {
            cell.classList.add('calendar__day--has-event');
            const badge = document.createElement('div');
            badge.className = 'calendar__event-dot';
            badge.textContent = dayEvents.length > 1 ? dayEvents.length : '';
            const firstName = dayEvents[0].atracoes ? dayEvents[0].atracoes.nome : 'Evento';
            badge.title = dayEvents.length === 1 ? firstName : `${dayEvents.length} eventos`;
            cell.appendChild(badge);
        }

        cell.addEventListener('click', () => {
            if (dayEvents.length === 1) {
                openEventModal(dayDate, dayEvents[0]);
            } else if (dayEvents.length > 1) {
                showDayEvents(dayDate, dayEvents);
            } else {
                openEventModal(dayDate, null);
            }
        });

        grid.appendChild(cell);
    }
}

function showDayEvents(date, events) {
    const dayStr = `${date.getDate()} de ${MONTHS_PT[date.getMonth()]}`;

    let listHTML = events.map(e => {
        const time = e.horario ? e.horario.substring(0, 5) : '';
        const name = e.atracoes ? e.atracoes.nome : 'Evento';
        return `<div class="day-events__item" data-event-id="${e.id}">
            <span class="day-events__time">${time}</span>
            <span class="day-events__name">${name}</span>
        </div>`;
    }).join('');

    listHTML += `<div class="day-events__item day-events__item--new" data-action="new">
        <span>+ Novo Evento</span>
    </div>`;

    const modal = document.getElementById('modal-day-events');
    modal.querySelector('.day-events__title').textContent = dayStr;
    modal.querySelector('.day-events__list').innerHTML = listHTML;
    modal.classList.add('active');

    modal.querySelectorAll('.day-events__item[data-event-id]').forEach(item => {
        item.addEventListener('click', () => {
            const evtId = parseInt(item.dataset.eventId);
            const evento = events.find(e => e.id === evtId);
            modal.classList.remove('active');
            if (evento) openEventModal(date, evento);
        });
    });

    const newBtn = modal.querySelector('[data-action="new"]');
    if (newBtn) {
        newBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            openEventModal(date, null);
        });
    }

    modal.querySelector('.day-events__close').addEventListener('click', () => {
        modal.classList.remove('active');
    });
}

// ============================================
// TIME PICKER CUSTOMIZADO
// ============================================

/**
 * Cria e exibe um seletor de hora rápido junto ao input alvo
 */
function openTimePicker(inputElement) {
    // Remove picker existente
    closeAllTimePickers();

    const picker = document.createElement('div');
    picker.className = 'time-picker';

    // Grid de horas (16h - 23h)
    const hoursGrid = document.createElement('div');
    hoursGrid.className = 'time-picker__section';
    hoursGrid.innerHTML = '<span class="time-picker__label">Hora</span>';
    const hoursWrap = document.createElement('div');
    hoursWrap.className = 'time-picker__grid';

    for (let h = 16; h <= 23; h++) {
        const btn = document.createElement('button');
        btn.className = 'time-picker__btn';
        btn.textContent = String(h).padStart(2, '0');
        btn.dataset.hour = h;
        btn.addEventListener('click', () => {
            hoursWrap.querySelectorAll('.time-picker__btn').forEach(b => b.classList.remove('time-picker__btn--active'));
            btn.classList.add('time-picker__btn--active');
            updateTimeFromPicker(picker, inputElement);
        });
        hoursWrap.appendChild(btn);
    }
    hoursGrid.appendChild(hoursWrap);

    // Grid de minutos (00, 15, 30, 45)
    const minsGrid = document.createElement('div');
    minsGrid.className = 'time-picker__section';
    minsGrid.innerHTML = '<span class="time-picker__label">Minuto</span>';
    const minsWrap = document.createElement('div');
    minsWrap.className = 'time-picker__grid';

    [0, 15, 30, 45].forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'time-picker__btn';
        btn.textContent = String(m).padStart(2, '0');
        btn.dataset.minute = m;
        if (m === 0) btn.classList.add('time-picker__btn--active'); // Padrão 00min
        btn.addEventListener('click', () => {
            minsWrap.querySelectorAll('.time-picker__btn').forEach(b => b.classList.remove('time-picker__btn--active'));
            btn.classList.add('time-picker__btn--active');
            updateTimeFromPicker(picker, inputElement);
        });
        minsWrap.appendChild(btn);
    });
    minsGrid.appendChild(minsWrap);

    picker.appendChild(hoursGrid);
    picker.appendChild(minsGrid);

    // Pré-seleciona valores atuais do input
    const currentVal = inputElement.value;
    if (currentVal) {
        const [ch, cm] = currentVal.split(':').map(Number);
        const hourBtn = hoursWrap.querySelector(`[data-hour="${ch}"]`);
        if (hourBtn) {
            hoursWrap.querySelectorAll('.time-picker__btn').forEach(b => b.classList.remove('time-picker__btn--active'));
            hourBtn.classList.add('time-picker__btn--active');
        }
        // Seleciona o minuto mais próximo
        const closestMin = [0, 15, 30, 45].reduce((a, b) => Math.abs(b - cm) < Math.abs(a - cm) ? b : a);
        const minBtn = minsWrap.querySelector(`[data-minute="${closestMin}"]`);
        if (minBtn) {
            minsWrap.querySelectorAll('.time-picker__btn').forEach(b => b.classList.remove('time-picker__btn--active'));
            minBtn.classList.add('time-picker__btn--active');
        }
    }

    // Posiciona o picker abaixo do input
    inputElement.parentElement.style.position = 'relative';
    inputElement.parentElement.appendChild(picker);

    // Fecha ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', handlePickerOutsideClick);
    }, 50);
}

function handlePickerOutsideClick(e) {
    if (!e.target.closest('.time-picker') && !e.target.closest('.time-input-wrap')) {
        closeAllTimePickers();
    }
}

function closeAllTimePickers() {
    document.querySelectorAll('.time-picker').forEach(p => p.remove());
    document.removeEventListener('click', handlePickerOutsideClick);
}

function updateTimeFromPicker(picker, inputElement) {
    const activeHour = picker.querySelector('.time-picker__section:first-child .time-picker__btn--active');
    const activeMin = picker.querySelector('.time-picker__section:last-child .time-picker__btn--active');

    if (activeHour) {
        const h = String(activeHour.dataset.hour).padStart(2, '0');
        const m = activeMin ? String(activeMin.dataset.minute).padStart(2, '0') : '00';
        inputElement.value = `${h}:${m}`;
    }
}

// ============================================
// MODAL DE EVENTO (Criar / Editar)
// ============================================

function openEventModal(date, evento, prefilledTime) {
    editingEventId = evento ? evento.id : null;
    selectedAtracao = evento && evento.atracoes ? evento.atracoes : null;

    const modal = document.getElementById('modal-evento');
    const form = modal.querySelector('.modal-evento__form');

    // Título com data por extenso
    const dayNum = date.getDate();
    const monthName = MONTHS_PT[date.getMonth()];
    const year = date.getFullYear();
    const dateLabel = `${dayNum} de ${monthName} de ${year}`;
    const prefix = editingEventId ? 'Editar Evento' : 'Novo Evento';
    modal.querySelector('.modal-evento__title').textContent = `${prefix} — ${dateLabel}`;

    // Data no input hidden
    form.querySelector('#evento-data').value = formatDateISO(date);

    if (evento) {
        form.querySelector('#evento-horario').value = evento.horario ? evento.horario.substring(0, 5) : '';
        form.querySelector('#evento-horario-fim').value = evento.horario_fim ? evento.horario_fim.substring(0, 5) : '';
        form.querySelector('#evento-descricao').value = evento.descricao || '';
    } else {
        form.querySelector('#evento-horario').value = prefilledTime || '';
        form.querySelector('#evento-horario-fim').value = '';
        form.querySelector('#evento-descricao').value = '';
    }

    updateAtracaoPreview();

    const btnDelete = modal.querySelector('#btn-delete-evento');
    if (btnDelete) btnDelete.style.display = editingEventId ? 'block' : 'none';

    modal.classList.add('active');
}

function closeEventModal() {
    closeAllTimePickers();
    const modal = document.getElementById('modal-evento');
    modal.classList.remove('active');
    editingEventId = null;
    selectedAtracao = null;

    const form = modal.querySelector('.modal-evento__form');
    form.querySelector('#evento-horario').value = '';
    form.querySelector('#evento-horario-fim').value = '';
    form.querySelector('#evento-descricao').value = '';
}

function updateAtracaoPreview() {
    const preview = document.getElementById('atracao-preview');
    if (!preview) return;

    if (selectedAtracao) {
        preview.innerHTML = `
            <div class="atracao-preview__card">
                <img src="${selectedAtracao.foto_url || ''}" alt="${selectedAtracao.nome}" class="atracao-preview__img" onerror="this.style.display='none'">
                <span class="atracao-preview__nome">${selectedAtracao.nome}</span>
                <button type="button" class="atracao-preview__change" id="btn-change-atracao">Alterar</button>
            </div>
        `;
        document.getElementById('btn-change-atracao').addEventListener('click', () => {
            selectedAtracao = null;
            updateAtracaoPreview();
        });
    } else {
        preview.innerHTML = `
            <div class="atracao-preview__actions">
                <button type="button" class="atracao-preview__btn" id="btn-galeria-atracao">
                    Selecionar Atração Existente
                </button>
                <button type="button" class="atracao-preview__btn atracao-preview__btn--new" id="btn-nova-atracao">
                    + Nova Atração
                </button>
            </div>
        `;
        document.getElementById('btn-galeria-atracao').addEventListener('click', openGaleriaModal);
        document.getElementById('btn-nova-atracao').addEventListener('click', openNovaAtracaoModal);
    }
}

// ============================================
// GALERIA DE ATRAÇÕES
// ============================================

async function openGaleriaModal() {
    await loadAtracoes();
    const modal = document.getElementById('modal-galeria');
    renderGaleria(atracoesCache);
    modal.classList.add('active');

    const searchInput = modal.querySelector('#galeria-search');
    searchInput.value = '';
    searchInput.focus();
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const filtered = atracoesCache.filter(a => a.nome.toLowerCase().includes(query));
        renderGaleria(filtered);
    });
}

function renderGaleria(atracoes) {
    const container = document.getElementById('galeria-grid');
    if (!container) return;

    if (atracoes.length === 0) {
        container.innerHTML = '<p class="galeria__empty">Nenhuma atração cadastrada</p>';
        return;
    }

    container.innerHTML = atracoes.map(a => `
        <div class="galeria__card" data-atracao-id="${a.id}">
            <div class="galeria__card-img-wrap">
                <img src="${a.foto_url || ''}" alt="${a.nome}" loading="lazy" onerror="this.parentElement.classList.add('no-img')">
            </div>
            <span class="galeria__card-nome">${a.nome}</span>
        </div>
    `).join('');

    container.querySelectorAll('.galeria__card').forEach(card => {
        card.addEventListener('click', () => {
            const id = parseInt(card.dataset.atracaoId);
            const atracao = atracoesCache.find(a => a.id === id);
            if (atracao) {
                selectedAtracao = atracao;
                updateAtracaoPreview();
                document.getElementById('modal-galeria').classList.remove('active');
            }
        });
    });
}

function closeGaleriaModal() {
    document.getElementById('modal-galeria').classList.remove('active');
}

// ============================================
// NOVA ATRAÇÃO (Upload + Crop)
// ============================================

function openNovaAtracaoModal() {
    const modal = document.getElementById('modal-nova-atracao');
    modal.classList.add('active');
    modal.querySelector('#nova-atracao-nome').value = '';
    modal.querySelector('#crop-container').innerHTML = '<p class="crop__placeholder">Selecione uma foto</p>';
    modal.querySelector('#nova-atracao-foto').value = '';
    if (cropper) { cropper.destroy(); cropper = null; }
}

function closeNovaAtracaoModal() {
    if (cropper) { cropper.destroy(); cropper = null; }
    document.getElementById('modal-nova-atracao').classList.remove('active');
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { alert('Formato inválido. Use JPEG, PNG ou WebP.'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('Imagem muito grande. Máximo: 5MB.'); return; }

    const reader = new FileReader();
    reader.onload = function (event) {
        const container = document.getElementById('crop-container');
        container.innerHTML = '';
        const img = document.createElement('img');
        img.id = 'crop-image';
        img.src = event.target.result;
        img.style.maxWidth = '100%';
        container.appendChild(img);

        if (cropper) cropper.destroy();
        cropper = new Cropper(img, {
            aspectRatio: 3 / 4,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 1,
            restore: false,
            guides: true,
            center: true,
            highlight: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
            toggleDragModeOnDblclick: false,
        });
    };
    reader.readAsDataURL(file);
}

async function cropAndSaveAtracao() {
    const nomeInput = document.getElementById('nova-atracao-nome');
    const nome = nomeInput.value.trim();
    if (!nome) { alert('Preencha o nome da atração.'); nomeInput.focus(); return; }
    if (!cropper) { alert('Selecione uma foto para recortar.'); return; }

    const btnSave = document.getElementById('btn-save-atracao');
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Salvando...';
    btnSave.disabled = true;

    try {
        const canvas = cropper.getCroppedCanvas({ width: 600, height: 800, imageSmoothingEnabled: true, imageSmoothingQuality: 'high' });
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.85));

        const timestamp = Date.now();
        const fileName = `${nome.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.webp`;

        const { error: uploadError } = await window.supabaseClient.storage
            .from(STORAGE_BUCKET).upload(fileName, blob, { contentType: 'image/webp', upsert: false });
        if (uploadError) throw uploadError;

        const { data: urlData } = window.supabaseClient.storage.from(STORAGE_BUCKET).getPublicUrl(fileName);
        const fotoUrl = urlData.publicUrl;

        const { data: atracaoData, error: atracaoError } = await window.supabaseClient
            .from('atracoes').insert([{ nome, foto_url: fotoUrl }]).select().single();
        if (atracaoError) throw atracaoError;

        console.log('[Agenda] Nova atração criada:', atracaoData);
        selectedAtracao = atracaoData;
        updateAtracaoPreview();
        closeNovaAtracaoModal();
    } catch (err) {
        console.error('[Agenda] Erro ao salvar atração:', err);
        alert('Erro ao salvar atração: ' + (err.message || err));
    } finally {
        btnSave.textContent = originalText;
        btnSave.disabled = false;
    }
}

// ============================================
// CRUD DE EVENTOS
// ============================================

async function saveEvento() {
    const form = document.querySelector('.modal-evento__form');
    const data = form.querySelector('#evento-data').value;
    const horario = form.querySelector('#evento-horario').value;
    const horarioFim = form.querySelector('#evento-horario-fim').value;
    const descricao = form.querySelector('#evento-descricao').value.trim();

    if (!selectedAtracao) { alert('Selecione ou cadastre uma atração.'); return; }
    if (!data) { alert('Preencha a data.'); return; }
    if (!horario) { alert('Preencha o horário de início.'); return; }
    if (descricao.length > DESC_MAX_LENGTH) { alert(`Descrição muito longa. Máximo: ${DESC_MAX_LENGTH} caracteres.`); return; }

    const btnSave = document.getElementById('btn-save-evento');
    const originalText = btnSave.textContent;
    btnSave.textContent = 'Salvando...';
    btnSave.disabled = true;

    try {
        const payload = {
            atracao_id: selectedAtracao.id,
            data,
            horario,
            horario_fim: horarioFim || null,
            descricao: descricao || null,
            ativo: true
        };

        if (editingEventId) {
            const { error } = await window.supabaseClient.from('eventos').update(payload).eq('id', editingEventId);
            if (error) throw error;
            console.log('[Agenda] Evento atualizado:', editingEventId);
        } else {
            const { error } = await window.supabaseClient.from('eventos').insert([payload]);
            if (error) throw error;
            console.log('[Agenda] Novo evento criado');
        }

        closeEventModal();
        await loadAndRender();
    } catch (err) {
        console.error('[Agenda] Erro ao salvar evento:', err);
        alert('Erro ao salvar evento: ' + (err.message || err));
    } finally {
        btnSave.textContent = originalText;
        btnSave.disabled = false;
    }
}

async function deleteEvento() {
    if (!editingEventId) return;
    if (!confirm('Excluir este evento?')) return;

    try {
        const { error } = await window.supabaseClient.from('eventos').delete().eq('id', editingEventId);
        if (error) throw error;
        console.log('[Agenda] Evento excluído:', editingEventId);
        closeEventModal();
        await loadAndRender();
    } catch (err) {
        console.error('[Agenda] Erro ao excluir evento:', err);
        alert('Erro ao excluir: ' + (err.message || err));
    }
}

// ============================================
// SETUP DE EVENT LISTENERS (MODAIS)
// ============================================

function setupAgendaListeners() {
    // Modal Evento
    const modalEvento = document.getElementById('modal-evento');
    if (modalEvento) {
        modalEvento.querySelector('.modal-evento__close').addEventListener('click', closeEventModal);
        modalEvento.addEventListener('click', (e) => { if (e.target === modalEvento) closeEventModal(); });
        document.getElementById('btn-save-evento').addEventListener('click', saveEvento);
        const btnDelete = document.getElementById('btn-delete-evento');
        if (btnDelete) btnDelete.addEventListener('click', deleteEvento);

        // Contador de caracteres
        const descInput = modalEvento.querySelector('#evento-descricao');
        const descCounter = modalEvento.querySelector('#desc-counter');
        if (descInput && descCounter) {
            descInput.addEventListener('input', () => {
                const len = descInput.value.length;
                descCounter.textContent = `${len}/${DESC_MAX_LENGTH}`;
                descCounter.classList.toggle('over-limit', len > DESC_MAX_LENGTH);
            });
        }

        // Time Picker para horário de início e término
        const horarioInput = document.getElementById('evento-horario');
        const horarioFimInput = document.getElementById('evento-horario-fim');

        if (horarioInput) {
            horarioInput.addEventListener('click', (e) => {
                e.stopPropagation();
                openTimePicker(horarioInput);
            });
        }
        if (horarioFimInput) {
            horarioFimInput.addEventListener('click', (e) => {
                e.stopPropagation();
                openTimePicker(horarioFimInput);
            });
        }
    }

    // Modal Galeria
    const modalGaleria = document.getElementById('modal-galeria');
    if (modalGaleria) {
        modalGaleria.querySelector('.modal-galeria__close').addEventListener('click', closeGaleriaModal);
        modalGaleria.addEventListener('click', (e) => { if (e.target === modalGaleria) closeGaleriaModal(); });
    }

    // Modal Nova Atração
    const modalNovaAtracao = document.getElementById('modal-nova-atracao');
    if (modalNovaAtracao) {
        modalNovaAtracao.querySelector('.modal-nova-atracao__close').addEventListener('click', closeNovaAtracaoModal);
        modalNovaAtracao.addEventListener('click', (e) => { if (e.target === modalNovaAtracao) closeNovaAtracaoModal(); });
        document.getElementById('nova-atracao-foto')?.addEventListener('change', handleFileSelect);
        document.getElementById('btn-save-atracao').addEventListener('click', cropAndSaveAtracao);
    }

    // Modal Dia
    const modalDayEvents = document.getElementById('modal-day-events');
    if (modalDayEvents) {
        modalDayEvents.addEventListener('click', (e) => { if (e.target === modalDayEvents) modalDayEvents.classList.remove('active'); });
    }
}

// ============================================
// EXPOSIÇÃO GLOBAL
// ============================================

window.initAgenda = initAgenda;
window.setupAgendaListeners = setupAgendaListeners;
