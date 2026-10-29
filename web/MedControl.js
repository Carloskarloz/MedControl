const DOM = {
    login: {
        screen: document.querySelector('#login-screen'),
        form: document.querySelector('#login-form'),
        email: document.querySelector('#login-email'),
        password: document.querySelector('#login-password'),
        error: document.querySelector('#login-error'),
        intro: document.querySelector('#login-intro'),
        registerToggle: document.querySelector('#show-register-button'),
        registerForm: document.querySelector('#register-form'),
        registerName: document.querySelector('#register-name'),
        registerEmail: document.querySelector('#register-email'),
        registerPhone: document.querySelector('#register-phone'),
        registerRut: document.querySelector('#register-rut'),
        registerPassword: document.querySelector('#register-password'),
        registerPasswordConfirm: document.querySelector('#register-password-confirm'),
        registerError: document.querySelector('#register-error'),
        loginToggle: document.querySelector('#show-login-button'),
        demoCredentials: document.querySelector('.demo-credentials'),
        logoutButton: document.querySelector('#logout-button'),
        profileAvatar: document.querySelector('#profile-avatar'),
        profileName: document.querySelector('#profile-name'),
        profileRole: document.querySelector('#profile-role'),
        adminNav: document.querySelector('.nav[data-role="admin"]'),
    },
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

let currentRole = null;
let currentView = 'Resumen';
const dailyDoses = {
    taken: 3,
    total: 4,
    metforminTaken: false
};
const alertState = {
    doseResolved: false,
    stockResolved: false
};
const pharmacyInventory = [
    { id: 'losartan', name: 'Losartán 50 mg', form: 'Comprimidos', stock: 24, minimum: 20, expiry: '15/10/2027' },
    { id: 'metformin', name: 'Metformina 850 mg', form: 'Comprimidos', stock: 12, minimum: 20, expiry: '15/11/2026' }
];
const pharmacyMovements = { received: 0, dispensed: 0 };
let pharmacyNotice = '';
let pharmacyNoticeType = 'success';

function renderRoleNotifications() {
    if (currentRole === 'usuario') {
        const notifications = [];
        if (!alertState.doseResolved) {
            notifications.push('<p><b>Dosis atrasada</b><br><small>Metformina · ayer a las 20:00</small></p>');
        }
        if (!alertState.stockResolved) {
            notifications.push('<p><b>Stock bajo</b><br><small>Losartán · quedan 12 días</small></p>');
        }

        return `<h3>Notificaciones</h3>${notifications.join('') || '<p><b>Todo resuelto</b><br><small>No tienes alertas pendientes.</small></p>'}`;
    }

    if (currentRole === 'farmacia') {
        const lowStock = pharmacyInventory.filter(item => item.stock <= item.minimum);
        return `
            <h3>Alertas de farmacia</h3>
            ${lowStock.length
                ? lowStock.map(item => `<p><b>Stock bajo</b><br><small>${item.name} · ${item.stock} unidades</small></p>`).join('')
                : '<p><b>Inventario al día</b><br><small>No hay medicamentos bajo el mínimo.</small></p>'}
        `;
    }

    return `
        <h3>Notificaciones administrativas</h3>
        <p><b>Alertas pendientes</b><br><small>12 avisos esperan revisión del equipo.</small></p>
        <p><b>Seguimiento de tratamientos</b><br><small>86 tratamientos activos en el sistema.</small></p>
    `;
}

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

/**
 * Titulos
 */
const VIEW_TITLES = {
    'Resumen': ['Buenos días, Juan.', 'Aquí tienes el estado de tus tratamientos.'],
    'Mis tratamientos': ['Tus tratamientos', 'Consulta tus medicamentos, horarios y duración.'],
    'Dosis': ['Seguimiento de dosis', 'Registra cada toma y mejora tu adherencia.'],
    'Medicamentos': ['Tus medicamentos', 'Consulta disponibilidad, stock y vencimientos.'],
    'Alertas': ['Alertas y recordatorios', 'Revisa los avisos importantes de tu tratamiento.'],
    'Administración': ['Panel de administración', 'Gestiona usuarios, tratamientos y alertas del sistema.'],
    'Farmacia': ['Resumen de farmacia', 'Supervisa existencias, vencimientos y movimientos.'],
    'Inventario': ['Inventario de medicamentos', 'Controla existencias, mínimos y fechas de vencimiento.'],
    'Dispensación': ['Registro de dispensación', 'Registra la salida de medicamentos del inventario.']
};

const ROLE_VIEWS = {
    usuario: ['Resumen', 'Mis tratamientos', 'Dosis', 'Medicamentos', 'Alertas'],
    administrador: ['Administración'],
    farmacia: ['Farmacia', 'Inventario', 'Dispensación']
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
        <div class="stat"><label>Dosis programadas</label><strong>${String(dailyDoses.total).padStart(2, '0')} <em>hoy</em></strong></div>
        <div class="stat"><label>Dosis tomadas</label><strong>${String(dailyDoses.taken).padStart(2, '0')} <em>correctas</em></strong></div>
        <div class="stat"><label>Dosis retrasadas</label><strong>${String(dailyDoses.total - dailyDoses.taken).padStart(2, '0')} <em style="color:var(--orange)">revisar</em></strong></div>
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
                    <div class="status ${dailyDoses.metforminTaken ? '' : 'warning'}" data-dose-status="Metformina">${dailyDoses.metforminTaken ? 'Tomada' : 'Pendiente'}</div>
                    <button class="primary" data-action="register-dose" ${dailyDoses.metforminTaken ? 'disabled' : ''}>${dailyDoses.metforminTaken ? '✓ Registrada' : 'Registrar'}</button>
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
            </div>
            <div class="treatment-list">
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon">L</span>Losartán · 50 mg</div>
                    <div class="dose">Comprimidos · stock 24</div>
                    <div class="status">Vence 15/10/2027</div>
                    <button class="link" data-detail="Losartán · 50 mg">Detalle</button>
                </div>
                <div class="treatment">
                    <div class="medicine"><span class="medicine-icon" style="background:#fff1d9;color:#be7a10">M</span>Metformina · 850 mg</div>
                    <div class="dose">Comprimidos · stock 12</div>
                    <div class="status warning">Vence 15/11/2026</div>
                    <button class="link" data-detail="Metformina · 850 mg">Detalle</button>
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
    const activeAlerts = Number(!alertState.doseResolved) + Number(!alertState.stockResolved);
    return `
        <div class="stat"><label>Alertas activas</label><strong>${String(activeAlerts).padStart(2, '0')} <em style="color:var(--orange)">pendientes</em></strong></div>
        <div class="stat"><label>Stock bajo</label><strong>${alertState.stockResolved ? '00' : '01'} <em>medicamento</em></strong></div>
        <div class="stat"><label>Dosis atrasadas</label><strong>${alertState.doseResolved ? '00' : '01'} <em style="color:var(--red)">revisar</em></strong></div>
        <div class="stat"><label>Todo en orden</label><strong>06 <em>reglas</em></strong></div>
    `.trim();
}

function generateAlertasContent() {
    const allResolved = alertState.doseResolved && alertState.stockResolved;
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Centro de alertas</h2><p>Avisos generados por tu seguimiento</p></div>
                <button class="link" data-action="resolve-all-alerts" ${allResolved ? 'disabled' : ''}>${allResolved ? '✓ Todas resueltas' : 'Marcar todas como leídas'}</button>
            </div>
            <div class="alert-list">
                <div class="alert ${alertState.doseResolved ? 'alert-resolved' : ''}" data-alert="dose"><i class="dot ${alertState.doseResolved ? 'green' : 'red'}"></i><div><b>Dosis atrasada</b><small>Metformina 850 mg · no registrada ayer a las 20:00</small></div><button class="link" data-action="resolve-alert" data-alert="dose" ${alertState.doseResolved ? 'disabled' : ''}>${alertState.doseResolved ? '✓ Resuelta' : 'Resolver'}</button></div>
                <div class="alert ${alertState.stockResolved ? 'alert-resolved' : ''}" data-alert="stock"><i class="dot ${alertState.stockResolved ? 'green' : ''}"></i><div><b>Stock bajo</b><small>Losartán 50 mg · quedan 12 días de tratamiento</small></div><button class="link" data-action="resolve-alert" data-alert="stock" ${alertState.stockResolved ? 'disabled' : ''}>${alertState.stockResolved ? '✓ Resuelta' : 'Revisar'}</button></div>
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

function generateAdminStats() {
    return `
        <div class="stat"><label>Usuarios registrados</label><strong>128 <em>en sistema</em></strong></div>
        <div class="stat"><label>Tratamientos activos</label><strong>86 <em>en seguimiento</em></strong></div>
        <div class="stat"><label>Alertas pendientes</label><strong>12 <em style="color:var(--orange)">revisar</em></strong></div>
        <div class="stat"><label>Administradores</label><strong>03 <em>autorizados</em></strong></div>
    `.trim();
}

function generateAdminContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Actividad del sistema</h2><p>Resumen de la plataforma · datos de demostración</p></div>
            </div>
            <div class="alert-list">
                <div class="alert"><i class="dot green"></i><div><b>Usuarios</b><small>128 cuentas registradas · 114 activas este mes</small></div></div>
                <div class="alert"><i class="dot"></i><div><b>Tratamientos</b><small>86 tratamientos activos requieren seguimiento</small></div></div>
                <div class="alert"><i class="dot red"></i><div><b>Alertas pendientes</b><small>12 avisos esperan revisión del equipo</small></div></div>
            </div>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Acceso administrativo</h2><p>Sesión activa</p></div></div>
                <div class="weeks">
                    <div class="week"><span>Rol</span><b>Administrador</b></div>
                    <div class="week"><span>Permisos</span><b style="color:var(--green)">Gestión completa</b></div>
                </div>
            </section>
        </div>
    `.trim();
}

function getPharmacyExpiryDays(item) {
    const [day, month, year] = item.expiry.split('/').map(Number);
    const expiryDate = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.ceil((expiryDate - today) / 86400000);
}

function getPharmacyLowStock() {
    return pharmacyInventory.filter(item => item.stock <= item.minimum);
}

function generatePharmacyStats() {
    const totalUnits = pharmacyInventory.reduce((total, item) => total + item.stock, 0);
    const lowStock = getPharmacyLowStock().length;
    const expiring = pharmacyInventory.filter(item => {
        const days = getPharmacyExpiryDays(item);
        return days >= 0 && days <= 30;
    }).length;

    return `
        <div class="stat"><label>Unidades disponibles</label><strong>${totalUnits} <em>en inventario</em></strong></div>
        <div class="stat"><label>Stock bajo</label><strong>${String(lowStock).padStart(2, '0')} <em style="color:var(--orange)">medicamentos</em></strong></div>
        <div class="stat"><label>Por vencer</label><strong>${String(expiring).padStart(2, '0')} <em style="color:var(--red)">en 30 días</em></strong></div>
        <div class="stat"><label>Movimientos hoy</label><strong>${pharmacyMovements.received + pharmacyMovements.dispensed} <em>registrados</em></strong></div>
    `.trim();
}

function generatePharmacyContent() {
    const lowStock = getPharmacyLowStock();
    const expiring = pharmacyInventory.filter(item => {
        const days = getPharmacyExpiryDays(item);
        return days >= 0 && days <= 30;
    });

    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Estado del inventario</h2><p>Revisión de existencias y vencimientos</p></div>
            </div>
            <div class="alert-list">
                ${lowStock.length
                    ? lowStock.map(item => `<div class="alert"><i class="dot red"></i><div><b>${item.name} · stock bajo</b><small>${item.stock} unidades disponibles · mínimo ${item.minimum}</small></div></div>`).join('')
                    : '<div class="alert"><i class="dot green"></i><div><b>Stock suficiente</b><small>No hay medicamentos bajo el mínimo.</small></div></div>'}
                ${expiring.length
                    ? expiring.map(item => `<div class="alert"><i class="dot"></i><div><b>${item.name} · próximo a vencer</b><small>Vence el ${item.expiry}</small></div></div>`).join('')
                    : '<div class="alert"><i class="dot green"></i><div><b>Vencimientos al día</b><small>No hay medicamentos por vencer en los próximos 30 días.</small></div></div>'}
            </div>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Operaciones</h2><p>Accesos rápidos de farmacia</p></div></div>
                <div class="actions pharmacy-actions">
                    <button class="primary" data-action="navigate" data-view="Inventario">Gestionar inventario</button>
                    <button class="link" data-action="navigate" data-view="Dispensación">Registrar dispensación</button>
                </div>
            </section>
            <section class="card">
                <div class="card-header"><div><h2>Movimientos de hoy</h2><p>Actividad de esta sesión de demostración</p></div></div>
                <div class="weeks">
                    <div class="week"><span>Entradas registradas</span><b>${pharmacyMovements.received} unidades</b></div>
                    <div class="week"><span>Unidades dispensadas</span><b>${pharmacyMovements.dispensed} unidades</b></div>
                </div>
            </section>
        </div>
    `.trim();
}

function generatePharmacyInventoryContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Existencias</h2><p>Registra entradas de medicamentos y revisa sus vencimientos</p></div>
            </div>
            <div class="treatment-list">
                ${pharmacyInventory.map(item => `
                    <div class="treatment pharmacy-inventory-row">
                        <div class="medicine"><span class="medicine-icon">${item.name.charAt(0)}</span>${item.name}</div>
                        <div class="dose">${item.form} · ${item.stock} unidades</div>
                        <div class="status ${item.stock <= item.minimum ? 'warning' : ''}">Vence ${item.expiry}</div>
                        <div class="pharmacy-restock">
                            <label>Entrada
                                <input class="field" type="number" min="1" step="1" value="10" aria-label="Unidades para reponer ${item.name}">
                            </label>
                            <button class="primary" data-action="restock" data-medication="${item.id}">Reponer</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <p class="pharmacy-feedback ${pharmacyNoticeType === 'error' ? 'error' : ''}" role="status" aria-live="polite">${pharmacyNotice}</p>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Mínimos de inventario</h2><p>Umbral para alertas de reposición</p></div></div>
                <div class="weeks">
                    ${pharmacyInventory.map(item => `<div class="week"><span>${item.name}</span><b>${item.minimum} unidades</b></div>`).join('')}
                </div>
            </section>
        </div>
    `.trim();
}

function generatePharmacyDispensingContent() {
    return `
        <section class="card">
            <div class="card-header">
                <div><h2>Nueva salida de inventario</h2><p>Selecciona el medicamento y registra las unidades dispensadas</p></div>
            </div>
            <form class="pharmacy-dispense-form" data-form="dispense">
                <label>Medicamento
                    <select class="field" id="pharmacy-medication" name="medication" required>
                        ${pharmacyInventory.map(item => `<option value="${item.id}" ${item.stock === 0 ? 'disabled' : ''}>${item.name} · ${item.stock} disponibles</option>`).join('')}
                    </select>
                </label>
                <label>Unidades a dispensar
                    <input class="field" id="pharmacy-quantity" name="quantity" type="number" min="1" max="${pharmacyInventory.find(item => item.stock > 0)?.stock || 0}" step="1" value="1" required>
                </label>
                <button class="primary" type="submit" ${pharmacyInventory.every(item => item.stock === 0) ? 'disabled' : ''}>Registrar salida</button>
                <p class="pharmacy-feedback ${pharmacyNoticeType === 'error' ? 'error' : ''}" id="pharmacy-feedback" role="status" aria-live="polite">${pharmacyNotice}</p>
            </form>
        </section>
        <div class="side">
            <section class="card">
                <div class="card-header"><div><h2>Resumen de movimientos</h2><p>Movimientos realizados en esta sesión</p></div></div>
                <div class="weeks">
                    <div class="week"><span>Entradas</span><b>${pharmacyMovements.received} unidades</b></div>
                    <div class="week"><span>Salidas dispensadas</span><b>${pharmacyMovements.dispensed} unidades</b></div>
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
    },
    'Administración': {
        stats: generateAdminStats(),
        content: generateAdminContent()
    },
    'Farmacia': {
        stats: generatePharmacyStats(),
        content: generatePharmacyContent()
    },
    'Inventario': {
        stats: generatePharmacyStats(),
        content: generatePharmacyInventoryContent()
    },
    'Dispensación': {
        stats: generatePharmacyStats(),
        content: generatePharmacyDispensingContent()
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
    if (!ROLE_VIEWS[currentRole]?.includes(viewName)) return false;

    currentView = viewName;
    DOM.content.grid.classList.toggle('pharmacy-inventory', viewName === 'Inventario');

    // Actualizar encabezado de navegación
    DOM.header.crumb.innerHTML = `MEDCONTROL / <strong>${viewName.toUpperCase()}</strong>`;
    
    // Actualizar títulos y descripciones
    DOM.welcome.title.textContent = VIEW_TITLES[viewName][0];
    DOM.welcome.text.textContent = VIEW_TITLES[viewName][1];
    
    // Actualizar contenido de la sección
    if (viewName === 'Resumen') {
        DOM.content.stats.innerHTML = ORIGINAL_STATE.stats;
        DOM.content.grid.innerHTML = ORIGINAL_STATE.content;
        updateSummaryDoseUI();
        updateSummaryAlertUI();
    } else if (viewName === 'Dosis') {
        DOM.content.stats.innerHTML = generateDosisStats();
        DOM.content.grid.innerHTML = generateDosisContent();
    } else if (viewName === 'Alertas') {
        DOM.content.stats.innerHTML = generateAlertasStats();
        DOM.content.grid.innerHTML = generateAlertasContent();
    } else if (viewName === 'Farmacia' || viewName === 'Inventario' || viewName === 'Dispensación') {
        DOM.content.stats.innerHTML = generatePharmacyStats();
        DOM.content.grid.innerHTML = viewName === 'Farmacia'
            ? generatePharmacyContent()
            : viewName === 'Inventario'
                ? generatePharmacyInventoryContent()
                : generatePharmacyDispensingContent();
    } else {
        DOM.content.stats.innerHTML = PANEL_CONTENT[viewName].stats;
        DOM.content.grid.innerHTML = PANEL_CONTENT[viewName].content;
    }

    setupAlertActions();
    return true;
}

function setupAlertActions() {
    const resolveAllButton = DOM.content.grid.querySelector('[data-action="resolve-all-alerts"]');
    if (resolveAllButton) {
        resolveAllButton.addEventListener('click', resolveAllAlerts);
    }

    DOM.content.grid.querySelectorAll('[data-action="resolve-alert"]').forEach(button => {
        button.addEventListener('click', () => resolveAlert(button.dataset.alert));
    });
}

function updateSummaryAlertUI() {
    const alertCount = document.querySelector('#summary-alert-count');
    if (alertCount) {
        const activeAlerts = Number(!alertState.doseResolved) + Number(!alertState.stockResolved);
        alertCount.innerHTML = `${String(activeAlerts).padStart(2, '0')} <em style="color:var(--orange)">${activeAlerts ? 'revisar' : 'resueltas'}</em>`;
    }

    [
        { id: 'dose', resolved: alertState.doseResolved },
        { id: 'stock', resolved: alertState.stockResolved }
    ].forEach(({ id, resolved }) => {
        const alert = document.querySelector(`[data-summary-alert="${id}"]`);
        if (!alert) return;

        alert.classList.toggle('alert-resolved', resolved);
        alert.querySelector('.dot').classList.toggle('green', resolved);
        alert.querySelector('.dot').classList.toggle('red', id === 'dose' && !resolved);
        alert.querySelector('b').textContent = id === 'dose' ? 'Dosis atrasada' : 'Stock bajo';
        alert.querySelector('small').textContent = resolved
            ? 'Alerta resuelta'
            : id === 'dose'
                ? 'Metformina · ayer a las 20:00'
                : 'Losartán · quedan 12 días';
        if (resolved) {
            alert.querySelector('b').textContent += ' · Resuelta';
        }
    });
}

function updateSummaryDoseUI() {
    const count = document.querySelector('#doses-today-count');
    if (count) {
        count.innerHTML = `${dailyDoses.taken} <em>de ${dailyDoses.total}</em>`;
    }

    const status = document.querySelector('.treatment [data-dose-status="Metformina"]');
    if (status) {
        status.textContent = dailyDoses.metforminTaken ? 'Tomada hoy' : 'Pendiente';
        status.classList.toggle('warning', !dailyDoses.metforminTaken);
    }

    const button = document.querySelector('#dose-button');
    if (button && dailyDoses.metforminTaken) {
        button.textContent = '✓ Dosis registrada';
        button.disabled = true;
    }
}

function registerScheduledDose() {
    if (currentRole !== 'usuario' || dailyDoses.metforminTaken || dailyDoses.taken >= dailyDoses.total) return;

    dailyDoses.metforminTaken = true;
    dailyDoses.taken += 1;
    updateView(currentView);
}

function resolveAlert(alertId) {
    if (alertId === 'dose') {
        alertState.doseResolved = true;
    } else if (alertId === 'stock') {
        alertState.stockResolved = true;
    }

    updateView(currentView);
    refreshNotificationPanel();
}

function resolveAllAlerts() {
    alertState.doseResolved = true;
    alertState.stockResolved = true;
    updateView(currentView);
    refreshNotificationPanel();
}

function refreshNotificationPanel() {
    const { utilityPanel } = DOM.header;
    if (!utilityPanel.hidden && utilityPanel.dataset.type === 'notifications') {
        utilityPanel.innerHTML = renderRoleNotifications();
    }
}

/**
 * Click en los botones de navegación
 */
function setupNavigation() {
    DOM.nav.items.forEach(item => {
        item.addEventListener('click', () => {
            const viewName = item.dataset.view;
            if (!updateView(viewName)) return;

            DOM.nav.items.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function showApplication(role, userName = null) {
    currentRole = role;
    DOM.header.utilityPanel.hidden = true;
    DOM.header.utilityPanel.replaceChildren();
    delete DOM.header.utilityPanel.dataset.type;
    DOM.login.screen.hidden = true;
    document.querySelector('#app').hidden = false;
    DOM.nav.items.forEach(item => {
        const itemRole = item.dataset.role;
        item.hidden = itemRole === 'admin'
            ? role !== 'administrador'
            : itemRole !== role;
    });
    const profileName = role === 'administrador'
        ? 'Administrador'
        : role === 'farmacia'
            ? 'Equipo de farmacia'
            : userName || 'Juan Carlos';
    DOM.login.profileAvatar.textContent = role === 'administrador'
        ? 'AD'
        : role === 'farmacia'
            ? 'FA'
            : profileName.split(/\s+/).slice(0, 2).map(part => part.charAt(0)).join('').toUpperCase();
    DOM.login.profileName.textContent = profileName;
    DOM.login.profileRole.textContent = role === 'administrador'
        ? 'Administrador'
        : role === 'farmacia'
            ? 'Farmacia'
            : 'Usuario';

    const initialView = ROLE_VIEWS[role]?.[0];
    const initialNav = document.querySelector(`.nav[data-view="${initialView}"]`);
    if (initialNav) {
        initialNav.click();
    }
}

function setupLogin() {
    const demoAccounts = {
        'usuario@medcontrol.demo': { password: 'usuario123', role: 'usuario', name: 'Juan Carlos' },
        'admin@medcontrol.demo': { password: 'admin123', role: 'administrador' },
        'farmacia@medcontrol.demo': { password: 'farmacia123', role: 'farmacia' }
    };

    const readRegisteredAccounts = () => {
        const savedAccounts = localStorage.getItem('medcontrol-users');
        if (!savedAccounts) return [];

        const accounts = JSON.parse(savedAccounts);
        if (!Array.isArray(accounts)) {
            throw new Error('El registro de usuarios guardado no tiene un formato válido.');
        }
        return accounts;
    };

    const showLoginError = (element, message) => {
        element.textContent = message;
        element.hidden = false;
    };

    const formatPhone = value => {
        let digits = value.replace(/\D/g, '');
        if (digits.startsWith('56') && digits.length === 11) {
            digits = digits.slice(2);
        }
        if (digits.length !== 9 || !digits.startsWith('9')) return null;
        return `${digits[0]} ${digits.slice(1, 5)} ${digits.slice(5)}`;
    };

    const formatRut = value => {
        const cleaned = value.replace(/[^0-9kK]/g, '').toUpperCase();
        if (cleaned.length < 2) return null;

        const body = cleaned.slice(0, -1);
        const verifier = cleaned.slice(-1);
        if (!/^\d{7,8}$/.test(body) || !/^[0-9K]$/.test(verifier)) return null;

        const groupedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `${groupedBody}-${verifier}`;
    };

    const showLoginForm = () => {
        DOM.login.intro.hidden = false;
        DOM.login.form.hidden = false;
        DOM.login.registerToggle.hidden = false;
        DOM.login.registerForm.hidden = true;
        DOM.login.demoCredentials.hidden = false;
        DOM.login.error.hidden = true;
        DOM.login.registerError.hidden = true;
    };

    DOM.login.registerToggle.addEventListener('click', () => {
        DOM.login.intro.hidden = true;
        DOM.login.form.hidden = true;
        DOM.login.registerToggle.hidden = true;
        DOM.login.registerForm.hidden = false;
        DOM.login.demoCredentials.hidden = true;
        DOM.login.registerError.hidden = true;
    });

    DOM.login.loginToggle.addEventListener('click', showLoginForm);
    DOM.login.registerPhone.addEventListener('blur', () => {
        const formattedPhone = formatPhone(DOM.login.registerPhone.value);
        if (formattedPhone) DOM.login.registerPhone.value = formattedPhone;
    });
    DOM.login.registerRut.addEventListener('blur', () => {
        const formattedRut = formatRut(DOM.login.registerRut.value);
        if (formattedRut) DOM.login.registerRut.value = formattedRut;
    });
    DOM.login.registerForm.addEventListener('input', () => {
        DOM.login.registerError.hidden = true;
    });

    DOM.login.form.addEventListener('submit', event => {
        event.preventDefault();

        const email = DOM.login.email.value.trim().toLowerCase();
        const password = DOM.login.password.value;
        let account = demoAccounts[email];

        try {
            const registeredAccount = readRegisteredAccounts().find(item => item.email === email);
            if (!account && registeredAccount) {
                account = { ...registeredAccount, role: 'usuario' };
            }
        } catch (error) {
            showLoginError(DOM.login.error, `No se pudieron leer las cuentas guardadas: ${error.message}`);
            return;
        }

        if (!account || account.password !== password) {
            showLoginError(DOM.login.error, 'El correo o la contraseña son incorrectos.');
            return;
        }

        DOM.login.error.hidden = true;
        DOM.login.password.value = '';
        showApplication(account.role, account.name);
    });

    DOM.login.registerForm.addEventListener('submit', event => {
        event.preventDefault();

        const name = DOM.login.registerName.value.trim();
        const email = DOM.login.registerEmail.value.trim().toLowerCase();
        const phone = formatPhone(DOM.login.registerPhone.value);
        const rut = formatRut(DOM.login.registerRut.value);
        const password = DOM.login.registerPassword.value;
        const passwordConfirm = DOM.login.registerPasswordConfirm.value;

        if (!name) {
            showLoginError(DOM.login.registerError, 'Ingresa tu nombre completo.');
            return;
        }

        if (!phone) {
            showLoginError(DOM.login.registerError, 'Ingresa un teléfono celular chileno válido, por ejemplo 9 7556 8821.');
            return;
        }

        if (!rut) {
            showLoginError(DOM.login.registerError, 'Ingresa un RUT válido en formato chileno, por ejemplo 12.893.969-K.');
            return;
        }

        if (password !== passwordConfirm) {
            showLoginError(DOM.login.registerError, 'Las contraseñas no coinciden.');
            return;
        }

        if (demoAccounts[email]) {
            showLoginError(DOM.login.registerError, 'Ese correo ya está reservado para una cuenta de demostración.');
            return;
        }

        try {
            const accounts = readRegisteredAccounts();
            if (accounts.some(account => account.email === email)) {
                showLoginError(DOM.login.registerError, 'Ya existe una cuenta registrada con ese correo.');
                return;
            }

            DOM.login.registerPhone.value = phone;
            DOM.login.registerRut.value = rut;
            accounts.push({ name, email, phone, rut, password });
            localStorage.setItem('medcontrol-users', JSON.stringify(accounts));
        } catch (error) {
            showLoginError(DOM.login.registerError, `No se pudo guardar la cuenta: ${error.message}`);
            return;
        }

        DOM.login.registerForm.reset();
        DOM.login.registerError.hidden = true;
        showApplication('usuario', name);
    });

    DOM.login.form.addEventListener('input', () => {
        DOM.login.error.hidden = true;
    });

    DOM.login.logoutButton.addEventListener('click', () => {
        currentRole = null;
        DOM.header.utilityPanel.hidden = true;
        DOM.header.utilityPanel.replaceChildren();
        delete DOM.header.utilityPanel.dataset.type;
        DOM.login.form.reset();
        DOM.login.registerForm.reset();
        showLoginForm();
        DOM.login.error.hidden = true;
        DOM.login.screen.hidden = false;
        document.querySelector('#app').hidden = true;
        DOM.login.adminNav.hidden = true;
    });
}

/**
 * Visibilidad del panel de utilidades
 * @param {string} type - Tipo de panel ('notifications' o 'settings')
 */
function toggleUtilityPanel(type) {
    const { utilityPanel } = DOM.header;
    
    if (!utilityPanel) return; // Salir si el panel no existe
    if (type === 'notifications' && currentRole !== 'usuario' && currentRole !== 'administrador' && currentRole !== 'farmacia') return;
    
    const isSamePanel = !utilityPanel.hidden && utilityPanel.dataset.type === type;
    
    if (isSamePanel) {
        utilityPanel.hidden = true;
        return;
    }

    utilityPanel.dataset.type = type;
    utilityPanel.innerHTML = type === 'notifications'
        ? renderRoleNotifications()
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

function renderMedicineDetail(detailName) {
    const details = {
        'Losartán · 50 mg': {
            title: 'Losartán 50 mg',
            lines: [
                '<b>Presentación</b><br><small>Comprimidos · 30 unidades</small>',
                '<b>Horario</b><br><small>08:00 · cada 24 h</small>',
                '<b>Stock</b><br><small>24 unidades · vence 15/10/2027</small>'
            ]
        },
        'Metformina · 850 mg': {
            title: 'Metformina 850 mg',
            lines: [
                '<b>Presentación</b><br><small>Comprimidos · 60 unidades</small>',
                '<b>Horario</b><br><small>20:00 · cada 24 h</small>',
                '<b>Stock</b><br><small>12 unidades · vence 15/11/2026</small>'
            ]
        },
    };

    const detail = details[detailName] || {
        title: detailName || 'Detalle',
        lines: ['<b>Información</b><br><small>Sin datos adicionales</small>']
    };

    return `
        <h3>${detail.title}</h3>
        ${detail.lines.map(item => `<p>${item}</p>`).join('')}
    `;
}

function handlePharmacyRestock(button) {
    if (currentRole !== 'farmacia') return;

    const item = pharmacyInventory.find(medicine => medicine.id === button.dataset.medication);
    const quantityInput = button.closest('.pharmacy-inventory-row')?.querySelector('input[type="number"]');
    const quantity = Number(quantityInput?.value);
    if (!item || !Number.isSafeInteger(quantity) || quantity <= 0) {
        pharmacyNotice = 'Ingresa una cantidad válida de unidades para reponer.';
        pharmacyNoticeType = 'error';
        updateView(currentView);
        return;
    }

    item.stock += quantity;
    pharmacyMovements.received += quantity;
    pharmacyNotice = `Entrada registrada: ${quantity} unidades de ${item.name}.`;
    pharmacyNoticeType = 'success';
    updateView(currentView);
}

function handlePharmacyDispensingSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || form.dataset.form !== 'dispense') return;
    event.preventDefault();
    if (currentRole !== 'farmacia') return;

    const item = pharmacyInventory.find(medicine => medicine.id === form.querySelector('#pharmacy-medication').value);
    const quantity = Number(form.querySelector('#pharmacy-quantity').value);
    if (!item || !Number.isSafeInteger(quantity) || quantity <= 0) {
        pharmacyNotice = 'Ingresa una cantidad válida para dispensar.';
        pharmacyNoticeType = 'error';
        updateView(currentView);
        return;
    }
    if (quantity > item.stock) {
        pharmacyNotice = `Stock insuficiente: quedan ${item.stock} unidades de ${item.name}.`;
        pharmacyNoticeType = 'error';
        const feedback = form.querySelector('#pharmacy-feedback');
        feedback.textContent = pharmacyNotice;
        feedback.classList.add('error');
        return;
    }

    item.stock -= quantity;
    pharmacyMovements.dispensed += quantity;
    pharmacyNotice = `Salida registrada: ${quantity} unidades de ${item.name}.`;
    pharmacyNoticeType = 'success';
    updateView(currentView);
}

function handlePharmacyMedicationChange(event) {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || select.id !== 'pharmacy-medication') return;

    const item = pharmacyInventory.find(medicine => medicine.id === select.value);
    const quantityInput = document.querySelector('#pharmacy-quantity');
    if (item && quantityInput) {
        quantityInput.max = String(item.stock);
        quantityInput.value = item.stock > 0 ? '1' : '0';
    }
}

function resolveDetailName(button) {
    if (button.dataset.detail) {
        return button.dataset.detail;
    }

    const medicineNode = button.closest('.treatment')?.querySelector('.medicine');
    if (medicineNode) {
        const value = medicineNode.textContent.replace(/\s+/g, ' ').trim();
        return value.replace(/^[A-Z]\s*/, '').trim();
    }

    return 'Losartán · 50 mg';
}

function handleActionButtonClick(event) {
    const button = event.target.closest('.link, .primary');
    if (!button) return;
    if (button.classList.contains('login-register-toggle')) return;

    if (button.dataset.action === 'restock') {
        handlePharmacyRestock(button);
        return;
    }
    if (button.dataset.action === 'navigate') {
        if (currentRole !== 'farmacia') return;
        const target = document.querySelector(`.nav[data-view="${button.dataset.view}"]`);
        if (target) target.click();
        return;
    }
    if (button.dataset.action === 'register-dose') {
        registerScheduledDose();
        return;
    }
    const label = button.textContent.trim().toLowerCase();

    if (label.includes('ver todas')) {
        const alertsButton = document.querySelector('.nav[data-view="Alertas"]');
        if (alertsButton) {
            alertsButton.click();
        }
        return;
    }

    if (label.includes('ver todos')) {
        const treatmentsButton = document.querySelector('.nav[data-view="Mis tratamientos"]');
        if (treatmentsButton) {
            treatmentsButton.click();
        }
        return;
    }

    if (label.includes('detalle') || label.includes('detalles')) {
        const panel = document.querySelector('#utility-panel');
        if (panel) {
            const detailName = resolveDetailName(button);
            panel.dataset.type = 'notifications';
            panel.innerHTML = renderMedicineDetail(detailName);
            panel.hidden = false;
        }
        return;
    }

    if (label.includes('nuevo tratamiento') || label.includes('registrar')) {
        button.textContent = '✓ Enviado';
        button.style.opacity = '0.9';
    }
}

let actionHandlersBound = false;

function handleTreatmentFilterChange(event) {
    const filter = event.target;
    if (!(filter instanceof HTMLSelectElement) || filter.id !== 'filter') return;

    const card = filter.closest('.card');
    const treatmentList = card?.querySelector('.treatment-list');
    if (!card || !treatmentList) return;

    const pendingOnly = filter.value === 'Pendiente';
    const treatments = treatmentList.querySelectorAll('.treatment');
    treatments.forEach(treatment => {
        const status = treatment.querySelector('.status')?.textContent.trim();
        treatment.hidden = pendingOnly && status !== 'Pendiente';
    });

    const cardTitle = card.querySelector('h2');
    if (cardTitle) {
        cardTitle.textContent = filter.value === 'Todos los tratamientos'
            ? 'Mis tratamientos'
            : filter.value;
    }
}

function setupSpecialButtons() {
    if (!actionHandlersBound) {
        document.addEventListener('click', handleActionButtonClick);
        document.addEventListener('change', handleTreatmentFilterChange);
        document.addEventListener('change', handlePharmacyMedicationChange);
        document.addEventListener('submit', handlePharmacyDispensingSubmit);
        actionHandlersBound = true;
    }
}

/**
 * Inicializa la aplicación
*/
function initializeApp() {
    updateTodayDate();
    setupLogin();
    setupNavigation();
    setupUtilityPanel();
    setupSpecialButtons();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}
