const DOM = {
    nav: {
        items: document.querySelectorAll('.nav'),
    },
    header: {
        crumb: document.querySelector('.crumb'),
        notificationsBtn: document.querySelector('#notifications-button'),
        settingsBtn: document.querySelector('#settings-button'),
        utilityPanel: document.querySelector('#utility-panel'),
    },
    welcome: {
        title: document.querySelector('.welcome h1'),
        text: document.querySelector('.welcome p'),
        date: document.querySelector('.date'),
    },
    content: {
        stats: document.querySelector('.stats'),
        grid: document.querySelector('.grid'),
    }
};

/**
 * @returns {string} Formato: "30 de agosto"
 */
function formatDateLabel() {
    const now = new Date();
    const day = now.getDate();
    const month = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now);
    return `${day} de ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}

/**
 * Actualiza la fecha en el encabezado
 */
function updateTodayDate() {
    if (DOM.welcome.date) {
        DOM.welcome.date.textContent = `${formatDateLabel()} · HOY`;
    }
}

const VIEW_TITLES = {
    'Resumen': ['Buenos días, Juan.', 'Aquí tienes el estado de tus tratamientos.'],
    'Mis tratamientos': ['Tus tratamientos', 'Consulta tus medicamentos, horarios y duración.'],
    'Dosis': ['Seguimiento de dosis', 'Registra cada toma y mejora tu adherencia.'],
    'Medicamentos': ['Tus medicamentos', 'Consulta disponibilidad, stock y vencimientos.'],
    'Alertas': ['Alertas y recordatorios', 'Revisa los avisos importantes de tu tratamiento.']
};

function generateTreatmentsStats() {
    return `
        <div class="stat"><label>Tratamientos activos</label><strong>02 <em>estables</em></strong></div>
        <div class="stat"><label>Dosis diarias</label><strong>04 <em>programadas</em></strong></div>
        <div class="stat"><label>Próximo término</label><strong>30 <em>SEP 2026</em></strong></div>
        <div class="stat"><label>Adherencia</label><strong>90% <em>+4.2%</em></strong></div>
    `.trim();
}

function generateTreatmentsContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Tratamientos activos</h2><p>Medicamentos asociados a tu plan actual</p></div>
                <button class="primary">+ Nuevo tratamiento</button>
            </div>
            <div class="treatment-list">
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon">L</span>Losartán 50 mg</div>
                    <div class="dose">1 comprimido · cada 24 h</div>
                    <div class="status">01/09 - 30/09</div>
                    <button class="link">Detalle</button>
                </div>
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon" style="background:#fff1d9;color:#be7a10">M</span>Metformina 850 mg</div>
                    <div class="dose">1 comprimido · cada 24 h</div>
                    <div class="status warning">01/09 - 30/09</div>
                    <button class="link">Detalle</button>
                </div>
            </div>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Próximas fechas</h2><p>Revisa la duración de tus tratamientos</p></div></div>
                <div class="alert-list">
                    <div class="alert"><i class="dot green"></i><div><b>Losartán</b><small>Termina en 36 días</small></div></div>
                    <div class="alert"><i class="dot"></i><div><b>Metformina</b><small>Termina en 36 días</small></div></div>
                </div>
            </section>
        </div>
    `.trim();
}

function generateDosisStats() {
    return `
        <div class="stat"><label>Dosis programadas</label><strong>04 <em>hoy</em></strong></div>
        <div class="stat"><label>Dosis tomadas</label><strong>03 <em>correctas</em></strong></div>
        <div class="stat"><label>Dosis retrasadas</label><strong>01 <em style="color:var(--orange)">revisar</em></strong></div>
        <div class="stat"><label>Dosis omitidas</label><strong>00 <em>excelente</em></strong></div>
    `.trim();
}

function generateDosisContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Registro de dosis · ${formatDateLabel()}</h2><p>Marca cada toma según el momento en que la realizaste</p></div>
            </div>
            <div class="treatment-list">
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon">L</span>Losartán 50 mg</div>
                    <div class="dose">08:00 · 1 comprimido</div>
                    <div class="status">Tomada</div>
                    <button class="link">Ver</button>
                </div>
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon" style="background:#fff1d9;color:#be7a10">M</span>Metformina 850 mg</div>
                    <div class="dose">20:00 · 1 comprimido</div>
                    <div class="status warning">Pendiente</div>
                    <button class="primary">Registrar</button>
                </div>
            </div>
        </section>
        <div class="side">
            <section class="card adherence">
                <div class="card-header"><div><h2>Historial reciente</h2><p>Estado de tus últimas dosis</p></div></div>
                <div class="weeks">
                    <div class="week"><span>Ayer</span><b style="color:var(--green)">4 de 4</b></div>
                    <div class="week"><span>23 AGO</span><b style="color:var(--green)">4 de 4</b></div>
                    <div class="week"><span>22 AGO</span><b style="color:var(--orange)">3 de 4</b></div>
                </div>
            </section>
        </div>
    `.trim();
}

function generateMedicamentosStats() {
    return `
        <div class="stat"><label>Medicamentos activos</label><strong>08 <em>en catálogo</em></strong></div>
        <div class="stat"><label>Stock disponible</label><strong>420 <em>unidades</em></strong></div>
        <div class="stat"><label>Stock bajo</label><strong>02 <em style="color:var(--orange)">alertas</em></strong></div>
        <div class="stat"><label>Por vencer</label><strong>01 <em style="color:var(--red)">en 30 días</em></strong></div>
    `.trim();
}

function generateMedicamentosContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Catálogo de medicamentos</h2><p>Existencias y fechas de vencimiento</p></div>
                <button class="primary">+ Añadir medicamento</button>
            </div>
            <div class="treatment-list">
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon">L</span>Losartán · 50 mg</div>
                    <div class="dose">Comprimidos · stock 24</div>
                    <div class="status">Vence 10/2027</div>
                    <button class="link">Detalle</button>
                </div>
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon" style="background:#fff1d9;color:#be7a10">M</span>Metformina · 850 mg</div>
                    <div class="dose">Comprimidos · stock 12</div>
                    <div class="status warning">Vence 11/2026</div>
                    <button class="link">Detalle</button>
                </div>
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon" style="background:#fde3df;color:#c95b4b">R</span>Rivaroxabán · 20 mg</div>
                    <div class="dose">Comprimidos · stock 06</div>
                    <div class="status warning">Vence 09/2026</div>
                    <button class="link">Detalle</button>
                </div>
            </div>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Estimación de stock</h2><p>Consumo previsto de tu tratamiento</p></div></div>
                <div class="alert-list">
                    <div class="alert"><i class="dot"></i><div><b>Losartán</b><small>24 unidades · 12 días estimados</small></div></div>
                    <div class="alert"><i class="dot red"></i><div><b>Metformina</b><small>12 unidades · 12 días estimados</small></div></div>
                </div>
            </section>
        </div>
    `.trim();
}

function generateAlertasStats() {
    return `
        <div class="stat"><label>Alertas activas</label><strong>02 <em style="color:var(--orange)">pendientes</em></strong></div>
        <div class="stat"><label>Stock bajo</label><strong>01 <em>medicamento</em></strong></div>
        <div class="stat"><label>Dosis atrasadas</label><strong>01 <em style="color:var(--red)">revisar</em></strong></div>
        <div class="stat"><label>Todo en orden</label><strong>06 <em>reglas</em></strong></div>
    `.trim();
}

function generateAlertasContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Centro de alertas</h2><p>Avisos generados por tu seguimiento</p></div>
                <button class="link">Marcar todas como leídas</button>
            </div>
            <div class="alert-list">
                <div class="alert"><i class="dot red"></i><div><b>Dosis atrasada</b><small>Metformina 850 mg · no registrada ayer a las 20:00</small></div><button class="link">Resolver</button></div>
                <div class="alert"><i class="dot"></i><div><b>Stock bajo</b><small>Losartán 50 mg · quedan 12 días de tratamiento</small></div><button class="link">Revisar</button></div>
                <div class="alert"><i class="dot green"></i><div><b>Sin nuevas incidencias</b><small>La sincronización se completó hace 2 horas</small></div></div>
            </div>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Reglas de alerta</h2><p>Configuración de avisos</p></div></div>
                <div class="weeks">
                    <div class="week"><span>Recordatorios</span><b style="color:var(--green)">Activos</b></div>
                    <div class="week"><span>Stock mínimo</span><b>14 días</b></div>
                    <div class="week"><span>Vencimiento</span><b>30 días</b></div>
                </div>
            </section>
        </div>
    `.trim();
}

const PANEL_CONTENT = {
    'Mis tratamientos': {
        stats: generateTreatmentsStats(),
        content: generateTreatmentsContent()
    },
    'Dosis': {
        stats: generateDosisStats(),
        content: generateDosisContent()
    },
    'Medicamentos': {
        stats: generateMedicamentosStats(),
        content: generateMedicamentosContent()
    },
    'Alertas': {
        stats: generateAlertasStats(),
        content: generateAlertasContent()
    }
};

// Guardar el estado original del resumen
const ORIGINAL_STATE = {
    stats: DOM.content.stats.innerHTML,
    content: DOM.content.grid.innerHTML
};

/**
 * Actualiza la vista cuando se selecciona una sección
 * @param {string} viewName - Nombre de la sección
 */
function updateView(viewName) {
    // Actualizar encabezado de navegación
    DOM.header.crumb.innerHTML = `MEDCONTROL / <strong>${viewName.toUpperCase()}</strong>`;
    
    // Actualizar títulos y descripciones
    DOM.welcome.title.textContent = VIEW_TITLES[viewName][0];
    DOM.welcome.text.textContent = VIEW_TITLES[viewName][1];
    
    // Actualizar contenido de la sección
    if (viewName === 'Resumen') {
        DOM.content.stats.innerHTML = ORIGINAL_STATE.stats;
        DOM.content.grid.innerHTML = ORIGINAL_STATE.content;
    } else {
        DOM.content.stats.innerHTML = PANEL_CONTENT[viewName].stats;
        DOM.content.grid.innerHTML = PANEL_CONTENT[viewName].content;
    }
}

/**
 * Click en los botones de navegación
 */
function setupNavigation() {
    DOM.nav.items.forEach(item => {
        item.addEventListener('click', () => {
            // Actualizar estado activo
            DOM.nav.items.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Actualizar vista
            const viewName = item.dataset.view;
            updateView(viewName);
        });
    });
}

/**
 * Visibilidad del panel de utilidades
 * @param {string} type - Tipo de panel ('notifications' o 'settings')
 */
function toggleUtilityPanel(type) {
    const { utilityPanel } = DOM.header;
    
    if (!utilityPanel) return; // Salir si el panel no existe
    
    const isSamePanel = !utilityPanel.hidden && utilityPanel.dataset.type === type;
    
    if (isSamePanel) {
        utilityPanel.hidden = true;
        return;
    }

    utilityPanel.dataset.type = type;
    utilityPanel.innerHTML = type === 'notifications'
        ? '<h3>Notificaciones</h3><p><b>Dosis atrasada</b><br><small>Metformina · ayer a las 20:00</small></p><p><b>Stock bajo</b><br><small>Losartán · quedan 12 días</small></p>'
        : '<h3>Configuración</h3><label><input type="checkbox" checked> Recordatorios de dosis</label><label><input type="checkbox" checked> Alertas de stock</label>';
    
    utilityPanel.hidden = false;
}

/**
 * Configura los eventos del panel de utilidades
 */
function setupUtilityPanel() {
    const { notificationsBtn, settingsBtn, utilityPanel } = DOM.header;
    
    if (notificationsBtn) {
        notificationsBtn.addEventListener('click', () => toggleUtilityPanel('notifications'));
    }
    
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => toggleUtilityPanel('settings'));
    }
    
    if (utilityPanel) {
        // Cerrar panel al hacer click fuera
        document.addEventListener('click', event => {
            if (!utilityPanel.hidden && !utilityPanel.contains(event.target) && !event.target.closest('.icon-button')) {
                utilityPanel.hidden = true;
            }
        });
    }
}

function setupSpecialButtons() {
    // Botón para registrar dosis
    const doseButton = document.querySelector('#dose-button');
    if (doseButton) {
        doseButton.addEventListener('click', event => {
            event.target.textContent = '✓ Dosis registrada';
            event.target.style.background = '#167d52';
        });
    }
    
    // Filtro de tratamientos
    const filter = document.querySelector('#filter');
    if (filter) {
        filter.addEventListener('change', event => {
            const cardTitle = document.querySelector('.card h2');
            if (cardTitle) {
                cardTitle.textContent = event.target.value === 'Todos los tratamientos' 
                    ? 'Mis tratamientos' 
                    : event.target.value;
            }
        });
    }
}

/**
 * Inicializa la aplicación
*/
function initializeApp() {
    updateTodayDate();
    setupNavigation();
    setupUtilityPanel();
    setupSpecialButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
