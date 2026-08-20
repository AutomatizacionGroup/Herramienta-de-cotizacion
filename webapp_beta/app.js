try {
let zonas = [];
let pinesPlano = [];
let planos = [];
let currentPlanoId = null;
let currentProyectoId = null;
let pdfArrayBuffer = null;
let expandedZonaId = null;
let foldedCajaIds = new Set();

// Guardar referencia al alert nativo
window.originalAlert = window.alert;

// Sobrescribir el alert nativo por uno personalizado y estético
window.alert = function(mensaje) {
    const modal = document.getElementById('modal-custom-alert');
    const msgEl = document.getElementById('custom-alert-message');
    const btnOk = document.getElementById('btn-custom-alert-ok');
    
    if (modal && msgEl && btnOk) {
        msgEl.textContent = mensaje;
        modal.classList.remove('hidden');
        
        // Enfocar el botón Aceptar para que puedan dar Enter rápido
        setTimeout(() => btnOk.focus(), 100);
        
        return new Promise((resolve) => {
            const closeAlert = () => {
                modal.classList.add('hidden');
                btnOk.removeEventListener('click', closeAlert);
                document.removeEventListener('keydown', keyHandler);
                resolve();
            };
            
            const keyHandler = (e) => {
                if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
                    e.preventDefault();
                    closeAlert();
                }
            };
            
            btnOk.addEventListener('click', closeAlert);
            document.addEventListener('keydown', keyHandler);
        });
    } else {
        window.originalAlert(mensaje);
    }
};

function mostrarConfirmacionPersonalizada(mensaje) {
    return new Promise((resolve) => {
        const modalConfirm = document.getElementById('modal-custom-confirm');
        const confirmMsg = document.getElementById('custom-confirm-message');
        const btnOk = document.getElementById('btn-custom-confirm-ok');
        const btnCancel = document.getElementById('btn-custom-confirm-cancel');

        if (!modalConfirm || !confirmMsg || !btnOk || !btnCancel) {
            resolve(window.confirm(mensaje));
            return;
        }

        confirmMsg.textContent = mensaje;
        modalConfirm.classList.remove('hidden');
        
        setTimeout(() => btnOk.focus(), 100);

        const onOk = () => {
            cleanup();
            resolve(true);
        };

        const onCancel = () => {
            cleanup();
            resolve(false);
        };

        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onOk();
            }
        };

        const cleanup = () => {
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            document.removeEventListener('keydown', keyHandler);
            modalConfirm.classList.add('hidden');
        };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
        document.addEventListener('keydown', keyHandler);
    });
}

function mostrarPromptPersonalizado(mensaje, valorDefecto = "") {
    return new Promise((resolve) => {
        const modalPrompt = document.getElementById('modal-custom-prompt');
        const promptMsg = document.getElementById('custom-prompt-message');
        const promptInput = document.getElementById('custom-prompt-input');
        const btnOk = document.getElementById('btn-custom-prompt-ok');
        const btnCancel = document.getElementById('btn-custom-prompt-cancel');

        if (!modalPrompt || !promptMsg || !promptInput || !btnOk || !btnCancel) {
            resolve(window.prompt(mensaje, valorDefecto));
            return;
        }

        promptMsg.textContent = mensaje;
        promptInput.value = valorDefecto;
        modalPrompt.classList.remove('hidden');
        
        setTimeout(() => {
            promptInput.focus();
            promptInput.select();
        }, 100);

        const onOk = () => {
            const val = promptInput.value;
            cleanup();
            resolve(val);
        };

        const onCancel = () => {
            cleanup();
            resolve(null);
        };

        const keyHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                onOk();
            }
        };

        const cleanup = () => {
            btnOk.removeEventListener('click', onOk);
            btnCancel.removeEventListener('click', onCancel);
            document.removeEventListener('keydown', keyHandler);
            modalPrompt.classList.add('hidden');
        };

        btnOk.addEventListener('click', onOk);
        btnCancel.addEventListener('click', onCancel);
        document.addEventListener('keydown', keyHandler);
    });
}

function actualizarPlanoActivoEnArray() {
    if (currentPlanoId) {
        const idx = planos.findIndex(p => p.id === currentPlanoId);
        if (idx !== -1) {
            planos[idx].pdfData = pdfArrayBuffer;
            planos[idx].pdfRotation = pdfRotation;
            planos[idx].pinesPlano = JSON.parse(JSON.stringify(pinesPlano));
        }
    }
}

async function guardarDatos() {
    if(!currentProyectoId) return;
    
    actualizarPlanoActivoEnArray();
    
    // Capturar estado sincrónicamente para evitar Race Conditions
    const idToSave = currentProyectoId;
    const zonasToSave = JSON.parse(JSON.stringify(zonas));
    
    // Clonar planos sin romper los ArrayBuffers
    const planosToSave = planos.map(p => ({
        id: p.id,
        nombre: p.nombre,
        pdfData: p.pdfData,
        pdfRotation: p.pdfRotation || 0,
        pinesPlano: JSON.parse(JSON.stringify(p.pinesPlano || []))
    }));
    
    try {
        const proy = await DB.getProyecto(idToSave);
        if(proy) {
            proy.zonas = zonasToSave;
            proy.planos = planosToSave;
            
            // Retrocompatibilidad
            if (planosToSave.length > 0) {
                proy.pinesPlano = planosToSave[0].pinesPlano;
                proy.pdfRotation = planosToSave[0].pdfRotation;
                proy.pdfData = planosToSave[0].pdfData;
            }
            
            const notasPlanoEl = document.getElementById('notas-plano-textarea');
            if (notasPlanoEl) {
                proy.notasPlano = notasPlanoEl.value;
            }
            
            proy.fecha = new Date().toLocaleString();
            await DB.saveProyecto(proy);
        }
    } catch(e) {
        alert("Error guardando el proyecto en IndexedDB: " + e.message);
    }
}

function actualizarNotasPlano() {
    guardarDatos();
}

const contenedorZonas = document.getElementById('zonas-container');
const btnAddZona = document.getElementById('btn-add-zona');
const modalZona = document.getElementById('modal-zona');
const btnCancelarZona = document.getElementById('btn-cancelar-zona');
const btnGuardarZona = document.getElementById('btn-guardar-zona');
const inputZonaNombre = document.getElementById('input-zona-nombre');
const btnExportar = document.getElementById('btn-exportar');

btnAddZona.addEventListener('click', () => {
    inputZonaNombre.value = '';
    modalZona.classList.remove('hidden');
    inputZonaNombre.focus();
});
btnCancelarZona.addEventListener('click', () => { modalZona.classList.add('hidden'); });
btnGuardarZona.addEventListener('click', () => {
    const nombre = inputZonaNombre.value.trim();
    if (nombre) { crearZona(nombre); modalZona.classList.add('hidden'); }
});

function crearZona(nombre) {
    const nuevaZona = {
        id: 'zona_' + Date.now(),
        nombre: nombre,
        equipos: {},
        cajas: [],
        otros: '',
        notas: '',
        mueblesIluminacion: ''
    };
    TODOS_EQUIPOS.forEach(eq => { nuevaZona.equipos[eq.id] = 0; });
    zonas.push(nuevaZona);
    expandedZonaId = nuevaZona.id;
    
    // Ya no se crea caja automática para no encadenar prompts
    renderizarZonas();
}

// Modal dinámico para Cajas
const modalCajaHtml = `
<div id="modal-caja" class="modal-overlay hidden">
    <div class="modal-content glass">
        <h2 style="margin-bottom: 0.5rem; color: var(--primary);">Ubicación de la Caja</h2>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1rem;">Ej: Entrada principal, Lado cama derecho</p>
        <input type="text" id="input-caja-nombre" class="input-control" placeholder="Nombre de la caja" autocomplete="off" style="margin:0; width:100%;">
        <div class="modal-actions" style="margin-top: 1.5rem;">
            <button id="btn-cancelar-caja" class="btn-ghost">Cancelar</button>
            <button id="btn-guardar-caja" class="btn-primary">Añadir Caja</button>
        </div>
    </div>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalCajaHtml);

let zonaActualParaCaja = null;

function agregarCajaFisica(zonaId) {
    zonaActualParaCaja = zonaId;
    document.getElementById('input-caja-nombre').value = '';
    document.getElementById('modal-caja').classList.remove('hidden');
    document.getElementById('input-caja-nombre').focus();
}

function guardarCajaFisica() {
    const nombre = document.getElementById('input-caja-nombre').value.trim();
    if (nombre && zonaActualParaCaja) {
        const zIndex = zonas.findIndex(z => z.id === zonaActualParaCaja);
        if (zIndex !== -1) {
            zonas[zIndex].cajas.push({
                id: 'caja_' + Date.now(),
                nombre: nombre,
                equipoBase: '',
                gangs: '1 Gang',
                neutro: true,
                cableado: 'Simple',
                retornos: 1,
                equiposGangs: [''],
                cargas: [''],
                cargasDimer: ['No dimerizable'],
                cargasCantidad: [1],
                cargasTipo: ['Sin definir']
            });
            guardarDatos();
            renderizarZonas();
        }
        document.getElementById('modal-caja').classList.add('hidden');
    }
}

document.getElementById('btn-cancelar-caja').addEventListener('click', () => {
    document.getElementById('modal-caja').classList.add('hidden');
    zonaActualParaCaja = null;
});

document.getElementById('btn-guardar-caja').addEventListener('click', guardarCajaFisica);

function eliminarCajaFisica(zonaId, cajaId) {
    const zona = zonas.find(z => z.id === zonaId);
    if(zona) {
        zona.cajas = zona.cajas.filter(c => c.id !== cajaId);
        guardarDatos();
        renderizarZonas();
    }
}

function eliminarZona(id) {
    zonas = zonas.filter(z => z.id !== id);
    renderizarZonas();
}

function modificarCantidad(zonaId, equipoId, delta) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        let current = zona.equipos[equipoId] || 0;
        let nuevo = current + delta;
        if (nuevo < 0) nuevo = 0;
        zona.equipos[equipoId] = nuevo;
        document.getElementById(`${zonaId}-${equipoId}`).innerText = nuevo;
        guardarDatos();
    }
}

function toggleNeutroCaja(zonaId, cajaId) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja) {
            caja.neutro = !caja.neutro;
            renderizarZonas(); 
        }
    }
}

function actualizarCajaTexto(zonaId, cajaId, campo, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if (caja) {
            if (valor === 'true') caja[campo] = true;
            else if (valor === 'false') caja[campo] = false;
            else caja[campo] = valor;
            
            if (campo === 'gangs') {
                if (!caja.equiposGangs) caja.equiposGangs = [];
                const numGangs = obtenerGangsNum(valor);
                while (caja.equiposGangs.length < numGangs) {
                    caja.equiposGangs.push('');
                }
                if (caja.equiposGangs.length > numGangs) {
                    caja.equiposGangs = caja.equiposGangs.slice(0, numGangs);
                }
            }
            guardarDatos();
            renderizarZonas();
        }
    }
}

function actualizarRetornos(zonaId, cajaId, valor) {
    const zIndex = zonas.findIndex(z => z.id === zonaId);
    if (zIndex !== -1) {
        const cIndex = zonas[zIndex].cajas.findIndex(c => c.id === cajaId);
        if (cIndex !== -1) {
            const caja = zonas[zIndex].cajas[cIndex];
            let nuevosRetornos = parseInt(valor) || 1;
            caja.retornos = nuevosRetornos;
            
            // Ajustar arrays de cargas
            if(!caja.cargas) caja.cargas = [];
            if(!caja.cargasDimer) caja.cargasDimer = [];
            if(!caja.cargasCantidad) caja.cargasCantidad = [];
            if(!caja.cargasTipo) caja.cargasTipo = [];
            
            while(caja.cargas.length < nuevosRetornos) {
                caja.cargas.push('');
                caja.cargasDimer.push('No dimerizable');
                caja.cargasCantidad.push(1);
                caja.cargasTipo.push('Sin definir');
            }
            if(caja.cargas.length > nuevosRetornos) {
                caja.cargas = caja.cargas.slice(0, nuevosRetornos);
                caja.cargasDimer = caja.cargasDimer.slice(0, nuevosRetornos);
                caja.cargasCantidad = caja.cargasCantidad.slice(0, nuevosRetornos);
                caja.cargasTipo = caja.cargasTipo.slice(0, nuevosRetornos);
            }
            
            guardarDatos();
            renderizarZonas();
        }
    }
}

function actualizarCargaIndividual(zonaId, cajaId, index, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja) {
            caja.cargas[index] = valor;
            guardarDatos();
        }
    }
}

window.cambiarTipoCargaSelect = function(zonaId, cajaId, index, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja) {
            caja.cargas[index] = valor;
            renderizarZonas();
        }
    }
}

function actualizarDimerIndividual(zonaId, cajaId, index, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja && caja.cargasDimer) {
            caja.cargasDimer[index] = valor;
            guardarDatos();
        }
    }
}

function actualizarCargaDimer(zonaId, cajaId, idx, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if(zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja && caja.cargasDimer) {
            caja.cargasDimer[idx] = valor;
            guardarDatos();
        }
    }
}

function actualizarCargaCantidad(zonaId, cajaId, idx, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if(zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja && caja.cargasCantidad) {
            caja.cargasCantidad[idx] = parseInt(valor) || 1;
            guardarDatos();
        }
    }
}

function actualizarCargaTipo(zonaId, cajaId, idx, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if(zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja && caja.cargasTipo) {
            caja.cargasTipo[idx] = valor;
            guardarDatos();
        }
    }
}

const EQUIPOS_BASICOS = [
    { id: 'Keypad configurable', nombre: 'Keypad configurable' },
    { id: 'Switch', nombre: 'Switch' },
    { id: 'Dimmer', nombre: 'Dimmer' },
    { id: 'Keypad Dimmer', nombre: 'Keypad Dimmer' },
    { id: 'Auxiliar', nombre: 'Auxiliar' },
    { id: 'Sensor', nombre: 'Sensor' }
];

function obtenerGangsNum(gangsStr) {
    if (!gangsStr) return 1;
    const num = parseInt(gangsStr);
    return isNaN(num) ? 1 : num;
}

function actualizarCajaEquipoGang(zonaId, cajaId, gangIdx, newEquipoId) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if (caja) {
            if (!caja.equiposGangs) caja.equiposGangs = [];
            const numGangs = obtenerGangsNum(caja.gangs);
            while (caja.equiposGangs.length < numGangs) {
                caja.equiposGangs.push('');
            }
            caja.equiposGangs[gangIdx] = newEquipoId;
            guardarDatos();
            renderizarZonas();
        }
    }
}

function actualizarCampoTexto(zonaId, campo, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        zona[campo] = valor;
        guardarDatos();
    }
}

window.toggleAccordion = function(id) {
    const content = document.getElementById(id);
    const icon = document.getElementById('icon-' + id);
    if(content.classList.contains('hidden')) {
        content.classList.remove('hidden');
        if(icon) icon.style.transform = 'rotate(180deg)';
        
        if (id.startsWith('content-')) {
            foldedCajaIds.delete(id.replace('content-', ''));
        }
        
        // Si es una zona (empieza por 'zona-content-'), actualizamos expandedZonaId y plegamos las demás
        if (id.startsWith('zona-content-')) {
            expandedZonaId = id.replace('zona-content-', '');
            zonas.forEach(z => {
                const otherId = 'zona-content-' + z.id;
                if (otherId !== id) {
                    const otherContent = document.getElementById(otherId);
                    const otherIcon = document.getElementById('icon-' + otherId);
                    if (otherContent && !otherContent.classList.contains('hidden')) {
                        otherContent.classList.add('hidden');
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                }
            });
        }
    } else {
        content.classList.add('hidden');
        if(icon) icon.style.transform = 'rotate(0deg)';
        
        if (id.startsWith('content-')) {
            foldedCajaIds.add(id.replace('content-', ''));
        }
        
        if (id.startsWith('zona-content-')) {
            if (expandedZonaId === id.replace('zona-content-', '')) {
                expandedZonaId = null;
            }
        }
    }
}

window.filtrarEquipos = function(zonaId) {
    const searchVal = document.getElementById(`search-${zonaId}`).value.toLowerCase();
    const lineaVal = document.getElementById(`filter-linea-${zonaId}`).value;
    const tipoVal = document.getElementById(`filter-tipo-${zonaId}`).value;

    const cards = document.querySelectorAll(`.equipo-card-${zonaId}`);
    cards.forEach(card => {
        const nombre = card.getAttribute('data-nombre');
        const desc = card.getAttribute('data-desc');
        const linea = card.getAttribute('data-linea');
        const tipo = card.getAttribute('data-tipo');
        const pn = card.getAttribute('data-pn') || "";

        const matchSearch = nombre.includes(searchVal) || desc.includes(searchVal) || pn.includes(searchVal);
        const matchLinea = (lineaVal === 'ALL' || linea === lineaVal);
        const matchTipo = (tipoVal === 'ALL' || tipo === tipoVal);

        if (matchSearch && matchLinea && matchTipo) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function renderizarZonas() {
    contenedorZonas.innerHTML = '';
    
    if (zonas.length === 0) {
        contenedorZonas.innerHTML = '<div style="text-align:center; padding: 3rem; color: #94a3b8;">No has añadido ninguna habitación aún.<br>Usa el botón + para empezar.</div>';
        return;
    }

    zonas.forEach(zona => {
        const card = document.createElement('div');
        card.className = 'zona-card glass';
        const isExpanded = (expandedZonaId === zona.id);
        
        let html = `
            <div class="zona-header accordion-header" style="margin-top:0; margin-bottom:0; padding:0; background:transparent; border-radius:0;" onclick="toggleAccordion('zona-content-${zona.id}')">
                <h2 style="margin:0;">${zona.nombre}</h2>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <i class="ri-arrow-up-s-line" id="icon-zona-content-${zona.id}" style="font-size:1.5rem; color:var(--primary); transition: transform 0.3s; transform: ${isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};"></i>
                    <button class="btn-delete-zona" onclick="event.stopPropagation(); eliminarZona('${zona.id}')"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
            
            <div class="accordion-content ${isExpanded ? '' : 'hidden'}" id="zona-content-${zona.id}">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; margin-top:1rem; border-top:1px solid rgba(255,255,255,0.1); padding-top:1rem;">
                    <h3 style="margin:0; border:none; padding:0;">1. Cajas Físicas</h3>
                    <button class="btn-ghost" style="color:var(--primary); padding:0;" onclick="agregarCajaFisica('${zona.id}')">
                        <i class="ri-add-box-line"></i> Añadir Caja
                    </button>
                </div>
        `;
        
        if(zona.cajas.length === 0) {
            html += `<div style="font-size:0.8rem; color:var(--text-muted); margin-bottom:1rem;">No hay cajas añadidas.</div>`;
        }
        zona.cajas.forEach((caja, index) => {
            const numGangs = obtenerGangsNum(caja.gangs);
            if (!caja.equiposGangs) {
                caja.equiposGangs = Array(numGangs).fill('');
            }
            let gangsHtml = '';
            for (let g = 0; g < numGangs; g++) {
                gangsHtml += `
                    <div class="input-group" style="flex:1; min-width:180px; margin-bottom: 0.5rem;">
                        <label style="color:var(--text-muted); font-size:0.75rem;">Dispositivo Gang ${g + 1}</label>
                        <select class="input-control" onchange="actualizarCajaEquipoGang('${zona.id}', '${caja.id}', ${g}, this.value)">
                            <option value="">-- Sin dispositivo --</option>
                            ${EQUIPOS_BASICOS.map(eq => {
                                const isSelected = caja.equiposGangs[g] === eq.id ? 'selected' : '';
                                return `<option value="${eq.id}" ${isSelected}>${eq.nombre}</option>`;
                            }).join('')}
                        </select>
                    </div>
                `;
            }

            html += `
            <div class="caja-fisica" style="padding: 0.5rem 1rem 1rem 1rem;">
                <div class="accordion-header" style="margin-top: 0; margin-bottom: 0.5rem; padding: 0.5rem 0; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1); border-radius: 0;" onclick="toggleAccordion('content-${caja.id}')">
                    <span class="caja-title" style="font-size:1rem; color:white;"><i class="ri-map-pin-line" style="margin-right:0.4rem; color:var(--primary);"></i>${caja.nombre}</span>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <i class="ri-arrow-up-s-line" id="icon-content-${caja.id}" style="font-size:1.5rem; color:var(--primary); transition: transform 0.3s; transform: ${foldedCajaIds.has(caja.id) ? 'rotate(0deg)' : 'rotate(180deg)'};"></i>
                        <button class="btn-delete-caja" style="margin-left: 0.5rem;" onclick="event.stopPropagation(); eliminarCajaFisica('${zona.id}', '${caja.id}')"><i class="ri-close-line"></i></button>
                    </div>
                </div>
                
                <div class="accordion-content ${foldedCajaIds.has(caja.id) ? 'hidden' : ''}" id="content-${caja.id}">
                    <div class="tecnico-grid">
                        <div class="input-group">
                            <label>Tamaño (Gangs)</label>
                            <select class="input-control" onchange="actualizarCajaTexto('${zona.id}', '${caja.id}', 'gangs', this.value)">
                                <option value="1 Gang" ${caja.gangs === '1 Gang' ? 'selected' : ''}>1 Gang (Simple)</option>
                                <option value="2 Gangs" ${caja.gangs === '2 Gangs' ? 'selected' : ''}>2 Gangs (Doble)</option>
                                <option value="3 Gangs" ${caja.gangs === '3 Gangs' ? 'selected' : ''}>3 Gangs (Triple)</option>
                                <option value="4 Gangs" ${caja.gangs === '4 Gangs' ? 'selected' : ''}>4 Gangs (Cuádruple)</option>
                                <option value="5 Gangs" ${caja.gangs === '5 Gangs' ? 'selected' : ''}>5 Gangs (Quíntuple)</option>
                            </select>
                        </div>
                        <div class="toggle-row" style="margin-bottom:0; justify-content: flex-start; gap: 1rem;">
                            <div>
                                <div style="font-size:0.8rem; font-weight:600; color:var(--text-muted);">¿Tiene Neutro?</div>
                                <div style="font-size:0.75rem; color:var(--text-muted);">${caja.neutro !== false ? 'Sí, listo' : 'No (Adaptar)'}</div>
                            </div>
                            <div class="toggle-switch ${caja.neutro !== false ? 'active' : ''}" style="margin-top:0.4rem;" onclick="toggleNeutroCaja('${zona.id}', '${caja.id}')"></div>
                        </div>
                    </div>
                    
                    <div class="tecnico-grid">
                        <div class="input-group">
                            <label>Cableado</label>
                            <select class="input-control" onchange="actualizarCajaTexto('${zona.id}', '${caja.id}', 'cableado', this.value)">
                                <option value="Simple" ${caja.cableado === 'Simple' ? 'selected' : ''}>Simple</option>
                                <option value="Triway / Conmutador" ${caja.cableado === 'Triway / Conmutador' ? 'selected' : ''}>Triway / Conmutador</option>
                                <option value="BUS" ${caja.cableado === 'BUS' ? 'selected' : ''}>BUS</option>
                                <option value="Sin identificar" ${caja.cableado === 'Sin identificar' ? 'selected' : ''}>Sin identificar</option>
                                <option value="Sin definir" ${caja.cableado === 'Sin definir' ? 'selected' : ''}>Sin definir</option>
                            </select>
                        </div>
                        <div class="input-group">
                            <label>Cant. de Retornos</label>
                            <input type="number" class="input-control" min="1" max="10" value="${caja.retornos || 1}" onchange="actualizarRetornos('${zona.id}', '${caja.id}', this.value)">
                        </div>
                    </div>

                    <div style="display:flex; gap:0.8rem; flex-wrap:wrap; margin-top:0.5rem; margin-bottom:1rem; padding: 0.8rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                        <div style="width:100%; font-size:0.8rem; font-weight:600; color:var(--primary); margin-bottom:0.2rem;">Dispositivos Control4 (por Gang)</div>
                        ${gangsHtml}
                    </div>
            `;
            
            caja.cargas.forEach((cargaValue, idx) => {
                let currentDimer = (caja.cargasDimer && caja.cargasDimer[idx]) ? caja.cargasDimer[idx] : 'No dimerizable';
                const standardLoads = ['Sin definir', 'Spots / Empotrados', 'Cinta LED', 'Lámpara Colgante', 'Lámpara de Pared', 'Lámpara de Mesa/Pie', 'Exterior / Jardín', 'Ventilador', 'Extractor', 'Persianas / Cortinas', 'Tomacorriente Controlado', ''];
                let isCustom = !standardLoads.includes(cargaValue) || cargaValue === 'Otro';
                let selectValue = isCustom ? 'Otro' : (cargaValue || 'Sin definir');

                html += `
                    <div style="margin-bottom: 0.8rem; display:flex; flex-direction:row; gap:0.8rem; align-items:flex-end; flex-wrap:wrap; background:rgba(0,0,0,0.2); padding:1rem; border-radius:8px; width:100%;">
                        <div class="input-group" style="flex:2; min-width:180px; margin-bottom:0;">
                            <label style="color:var(--primary);">Carga ${idx + 1}</label>
                            <select class="input-control" onchange="cambiarTipoCargaSelect('${zona.id}', '${caja.id}', ${idx}, this.value)">
                                <option value="Sin definir" ${selectValue === 'Sin definir' ? 'selected' : ''}>-- Seleccionar --</option>
                                <option value="Spots / Empotrados" ${selectValue === 'Spots / Empotrados' ? 'selected' : ''}>Spots / Empotrados</option>
                                <option value="Cinta LED" ${selectValue === 'Cinta LED' ? 'selected' : ''}>Cinta LED</option>
                                <option value="Lámpara Colgante" ${selectValue === 'Lámpara Colgante' ? 'selected' : ''}>Lámpara Colgante</option>
                                <option value="Lámpara de Pared" ${selectValue === 'Lámpara de Pared' ? 'selected' : ''}>Lámpara de Pared (Arbotante)</option>
                                <option value="Lámpara de Mesa/Pie" ${selectValue === 'Lámpara de Mesa/Pie' ? 'selected' : ''}>Lámpara de Mesa/Pie</option>
                                <option value="Exterior / Jardín" ${selectValue === 'Exterior / Jardín' ? 'selected' : ''}>Exterior / Jardín</option>
                                <option value="Ventilador" ${selectValue === 'Ventilador' ? 'selected' : ''}>Ventilador</option>
                                <option value="Extractor" ${selectValue === 'Extractor' ? 'selected' : ''}>Extractor</option>
                                <option value="Persianas / Cortinas" ${selectValue === 'Persianas / Cortinas' ? 'selected' : ''}>Persianas / Cortinas</option>
                                <option value="Tomacorriente Controlado" ${selectValue === 'Tomacorriente Controlado' ? 'selected' : ''}>Tomacorriente Controlado</option>
                                <option value="Otro" ${selectValue === 'Otro' ? 'selected' : ''}>Otro...</option>
                            </select>
                            ${isCustom ? `<input type="text" class="input-control" style="margin-top:0.5rem;" value="${cargaValue === 'Otro' ? '' : cargaValue}" placeholder="Especificar carga..." onchange="actualizarCargaIndividual('${zona.id}', '${caja.id}', ${idx}, this.value)">` : ''}
                        </div>
                        <div class="input-group" style="width: 90px; margin-bottom:0;">
                            <label style="color:var(--text-muted); font-size:0.75rem;">Cant. Luces</label>
                            <input type="number" class="input-control" value="${(caja.cargasCantidad && caja.cargasCantidad[idx]) || 1}" min="1" max="100" onchange="actualizarCargaCantidad('${zona.id}', '${caja.id}', ${idx}, this.value)">
                        </div>
                        <div class="input-group" style="flex:1; min-width:140px; margin-bottom:0;">
                            <label style="color:var(--text-muted); font-size:0.75rem;">Cableado/Tipo</label>
                            <select class="input-control" onchange="actualizarCargaTipo('${zona.id}', '${caja.id}', ${idx}, this.value)">
                                ${['Sin definir', 'Sencillo', 'Triway (3-Vías)', '4-Vías', 'Ventilador', 'Tira LED', 'Motor/Persiana', 'Tomacorriente', 'Bus'].map(t => 
                                    `<option value="${t}" ${((caja.cargasTipo && caja.cargasTipo[idx]) || 'Sin definir') === t ? 'selected' : ''}>${t}</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="input-group" style="flex:1; min-width:140px; margin-bottom:0;">
                            <label style="color:var(--text-muted); font-size:0.75rem;">Atenuación</label>
                            <select class="input-control" onchange="actualizarDimerIndividual('${zona.id}', '${caja.id}', ${idx}, this.value)">
                                <option value="Dimerizable" ${currentDimer === 'Dimerizable' ? 'selected' : ''}>Dimerizable</option>
                                <option value="No dimerizable" ${currentDimer === 'No dimerizable' ? 'selected' : ''}>No dimerizable</option>
                                <option value="0-10V" ${currentDimer === '0-10V' ? 'selected' : ''}>0-10V</option>
                            </select>
                        </div>
                    </div>
            `;
            });
            html += `</div></div>`; 
        });
        
        html += `
            <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem; margin-top:1rem;">
                <div class="input-group" style="flex:1; min-width:250px;">
                    <label>Otros Requerimientos (Audio, Seguridad, Red)</label>
                    <input type="text" class="input-control" placeholder="Ej: Pantalla T4, Videoportero, Access Point" value="${zona.otros}" onchange="actualizarCampoTexto('${zona.id}', 'otros', this.value)">
                </div>
                <div class="input-group" style="flex:1; min-width:250px;">
                    <label>Ventilación (Ej. para Baños)</label>
                    <select class="input-control" onchange="actualizarCampoTexto('${zona.id}', 'ventilacion', this.value)">
                        <option value="" ${!zona.ventilacion ? 'selected' : ''}>-- No aplica / Sin definir --</option>
                        <option value="Corriente de aire (Natural)" ${zona.ventilacion === 'Corriente de aire (Natural)' ? 'selected' : ''}>Corriente de aire (Natural)</option>
                        <option value="Extractor" ${zona.ventilacion === 'Extractor' ? 'selected' : ''}>Extractor</option>
                        <option value="Sin ventilación" ${zona.ventilacion === 'Sin ventilación' ? 'selected' : ''}>Sin ventilación</option>
                    </select>
                </div>
                <div class="input-group" style="flex:1; min-width:250px;">
                    <label>Iluminación en Muebles</label>
                    <select class="input-control" onchange="actualizarCampoTexto('${zona.id}', 'mueblesIluminacion', this.value)">
                        <option value="" ${!zona.mueblesIluminacion ? 'selected' : ''}>-- No aplica / Sin definir --</option>
                        <option value="Tiene iluminación en muebles" ${zona.mueblesIluminacion === 'Tiene iluminación en muebles' ? 'selected' : ''}>Tiene iluminación en muebles</option>
                        <option value="Planeadas a futuro" ${zona.mueblesIluminacion === 'Planeadas a futuro' ? 'selected' : ''}>Planeadas a futuro</option>
                        <option value="No hay muebles" ${zona.mueblesIluminacion === 'No hay muebles' ? 'selected' : ''}>No hay muebles dentro de la habitación</option>
                    </select>
                </div>
            </div>
            
            <div class="accordion-header" onclick="toggleAccordion('equipos-${zona.id}')">
                <h3 style="margin:0; border:none; padding:0;">2. Equipos a Instalar</h3>
                <i class="ri-arrow-down-s-line" id="icon-equipos-${zona.id}" style="font-size:1.5rem; color:var(--text-muted); transition: transform 0.3s;"></i>
            </div>
            <div class="accordion-content hidden" id="equipos-${zona.id}">
                
                <div class="filtros-equipos" style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1rem; background:rgba(0,0,0,0.1); padding:0.5rem; border-radius:8px;">
                    <div style="position:relative;">
                        <i class="ri-search-line" style="position:absolute; left:0.8rem; top:0.8rem; color:var(--text-muted);"></i>
                        <input type="text" class="input-control" id="search-${zona.id}" placeholder="Buscar equipo..." oninput="filtrarEquipos('${zona.id}')" style="padding-left:2rem;">
                    </div>
                    <div style="display:flex; gap:0.5rem;">
                        <select class="input-control" id="filter-linea-${zona.id}" onchange="filtrarEquipos('${zona.id}')" style="flex:1;">
                            <option value="ALL">Todas las Líneas</option>
                            <option value="LUX">Línea LUX</option>
                            <option value="Contemporary">Línea Contemporary</option>
                            <option value="Tradicional">Línea Tradicional</option>
                            <option value="Essential">Línea Essential</option>
                            <option value="Faceplates">Faceplates (Tapas)</option>
                            <option value="Sensores">Sensores</option>
                        </select>
                        <select class="input-control" id="filter-tipo-${zona.id}" onchange="filtrarEquipos('${zona.id}')" style="flex:1;">
                            <option value="ALL">Todos los Tipos</option>
                            <option value="Keypad">Keypads</option>
                            <option value="Switch">Switches</option>
                            <option value="Dimmer">Dimmers</option>
                            <option value="Sensor">Sensores</option>
                        </select>
                    </div>
                </div>

                <div class="equipos-grid">
        `;
        
        TODOS_EQUIPOS.forEach(eq => {
            html += `
                    <div class="equipo-item equipo-card-${zona.id}" data-nombre="${eq.nombre.toLowerCase()}" data-desc="${eq.desc.toLowerCase()}" data-linea="${eq.linea}" data-tipo="${eq.tipo}" data-pn="${eq.partNumber.toLowerCase()}">
                        <i class="ri-information-line equipo-specs-icon" title="${eq.specs}"></i>
                        <img src="${eq.img}" alt="${eq.nombre}" class="equipo-img">
                        <div class="equipo-nombre">${eq.nombre}</div>
                        <div class="equipo-pn">${eq.partNumber}</div>
                        <div class="equipo-desc">${eq.desc}</div>
                        <div class="counter-controls">
                            <button class="btn-round" onclick="modificarCantidad('${zona.id}', '${eq.id}', -1)"><i class="ri-subtract-line"></i></button>
                            <span class="count-val" id="${zona.id}-${eq.id}">${zona.equipos[eq.id] || 0}</span>
                            <button class="btn-round" onclick="modificarCantidad('${zona.id}', '${eq.id}', 1)"><i class="ri-add-line"></i></button>
                        </div>
                    </div>
            `;
        });
        
        html += `
                </div>
            </div>
            
            <h3 style="margin-top: 1.5rem;">3. Notas Finales</h3>
            <div class="input-group">
                <textarea class="input-control" placeholder="Observaciones adicionales de la habitación..." onchange="actualizarCampoTexto('${zona.id}', 'notas', this.value)">${zona.notas}</textarea>
            </div>
            </div> <!-- Cierre del accordion-content de la zona -->
        `;
        
        card.innerHTML = html;
        contenedorZonas.appendChild(card);
    });
    
    // Auto-guardado
    guardarDatos();
}

function cargarDatos() {
    // Ya no se usa cargarDatos directamente. Ahora usamos initApp() para cargar proyectos.
    initApp();
}

async function initApp() {
    await renderDashboard();
}

// Variables globales para Modales
let pendingDeleteId = null;

const modalProyecto = document.getElementById('modal-proyecto');
const inputProyectoNombre = document.getElementById('input-proyecto-nombre');
const modalConfirm = document.getElementById('modal-confirm');

async function renderDashboard() {
    const mainEditor = document.getElementById('main-editor-view');
    const dashboardView = document.getElementById('dashboard-view');
    mainEditor.style.display = 'none';
    dashboardView.style.display = 'flex';
    
    const container = document.getElementById('lista-proyectos');
    container.innerHTML = '';
    
    const proyectos = await DB.getProyectosResumen();
    
    proyectos.forEach(p => {
        const card = document.createElement('div');
        card.className = 'proyecto-card';
        card.innerHTML = `
            <h3>${p.nombre}</h3>
            <span class="proyecto-meta">Modificado: ${p.fecha}</span>
            <span class="proyecto-meta">${p.numZonas} Zonas | ${p.numPines} Equipos en Plano</span>
            <button class="btn-delete-proy" data-id="${p.id}"><i class="ri-delete-bin-line"></i> Borrar</button>
        `;
        card.onclick = (e) => {
            if(e.target.closest('.btn-delete-proy')) return;
            abrirProyecto(p.id);
        };
        const btnDelete = card.querySelector('.btn-delete-proy');
        btnDelete.onclick = (e) => {
            e.stopPropagation();
            pendingDeleteId = p.id;
            document.getElementById('confirm-msg').innerText = `¿Seguro que deseas eliminar permanentemente el proyecto "${p.nombre}"?`;
            modalConfirm.classList.remove('hidden');
        };
        container.appendChild(card);
    });
}

// Lógica de Modales de Proyecto y Confirmación
document.getElementById('btn-cancelar-confirm').addEventListener('click', () => {
    modalConfirm.classList.add('hidden');
    pendingDeleteId = null;
});

document.getElementById('btn-aceptar-confirm').addEventListener('click', async () => {
    if(pendingDeleteId) {
        await DB.deleteProyecto(pendingDeleteId);
        modalConfirm.classList.add('hidden');
        pendingDeleteId = null;
        renderDashboard();
    }
});

document.getElementById('btn-nuevo-proyecto').addEventListener('click', () => {
    inputProyectoNombre.value = '';
    modalProyecto.classList.remove('hidden');
    setTimeout(() => inputProyectoNombre.focus(), 100);
});

document.getElementById('btn-cancelar-proyecto').addEventListener('click', () => {
    modalProyecto.classList.add('hidden');
});

document.getElementById('btn-guardar-proyecto').addEventListener('click', async () => {
    const nombre = inputProyectoNombre.value.trim();
    if(!nombre) return;
    modalProyecto.classList.remove('hidden');
    
    const nuevoProy = {
        id: Date.now(),
        nombre: nombre,
        fecha: new Date().toLocaleString(),
        zonas: [],
        pinesPlano: [],
        pdfData: null,
        pdfRotation: 0
    };
    await DB.saveProyecto(nuevoProy);
    abrirProyecto(nuevoProy.id);
});

document.getElementById('btn-crear-piloto').addEventListener('click', async () => {
    // 1. Creación del Proyecto Piloto sin equipos (en base a lista de cajas)
    const pilotoProyLista = {
        id: Date.now(),
        nombre: "Proyecto Piloto - Demo Cajas (Sin Equipos)",
        fecha: new Date().toLocaleString(),
        pinesPlano: [],
        pdfData: null,
        pdfRotation: 0,
        zonas: [
            {
                id: 'z1_' + Date.now(),
                nombre: 'Acceso Principal / Fachada',
                ventilacion: 'No',
                mueblesIluminacion: 'No hay muebles',
                cajas: [
                    {
                        id: 'c1_1_' + Date.now(),
                        nombre: 'Caja Fachada',
                        gangs: '2 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 2,
                        equiposGangs: ['Keypad configurable', 'Dimmer'],
                        cargas: ['Arbotantes Entrada', 'Iluminación Camino'],
                        cargasDimer: ['Dimerizable', 'No dimerizable'],
                        cargasCantidad: [2, 5],
                        cargasTipo: ['Sencillo', 'Sencillo']
                    }
                ],
                equipos: {},
                otros: 'Prever alimentación para videoportero Chime.',
                notas: 'Los arbotantes son LED atenuables.'
            },
            {
                id: 'z2_' + Date.now(),
                nombre: 'Sala de Estar / Living Room',
                ventilacion: 'Preparación para AC',
                mueblesIluminacion: 'Tiene iluminación en muebles',
                cajas: [
                    {
                        id: 'c2_1_' + Date.now(),
                        nombre: 'Caja Sala Principal',
                        gangs: '3 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 3,
                        equiposGangs: ['Keypad configurable', 'Dimmer', 'Dimmer'],
                        cargas: ['Cajillo LED Cálido', 'Spots Centro Sala', 'Lámpara de Pie'],
                        cargasDimer: ['Dimerizable', 'Dimerizable', 'Dimerizable'],
                        cargasCantidad: [1, 6, 1],
                        cargasTipo: ['Sencillo', 'Sencillo', 'Tomacorriente']
                    }
                ],
                equipos: {},
                otros: 'La lámpara de pie se controlará con un dimmer de tomacorriente.',
                notas: 'Integrar con sistema de audio distribuido.'
            },
            {
                id: 'z3_' + Date.now(),
                nombre: 'Comedor / Dining Room',
                ventilacion: 'Extractor',
                mueblesIluminacion: 'Tiene iluminación en muebles',
                cajas: [
                    {
                        id: 'c3_1_' + Date.now(),
                        nombre: 'Caja Comedor',
                        gangs: '2 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 2,
                        equiposGangs: ['Keypad configurable', 'Keypad Dimmer'],
                        cargas: ['Lámpara Colgante Centro', 'Luz Indirecta Credenza'],
                        cargasDimer: ['Dimerizable', 'Dimerizable'],
                        cargasCantidad: [1, 3],
                        cargasTipo: ['Sencillo', 'Tira LED']
                    }
                ],
                equipos: {},
                otros: 'Lámpara colgante de diseño (requiere driver atenuable 0-10V).',
                notas: 'La tira LED es blanca cálida de 24V.'
            },
            {
                id: 'z4_' + Date.now(),
                nombre: 'Cocina / Kitchen',
                ventilacion: 'Extractor',
                mueblesIluminacion: 'Planeadas a futuro',
                cajas: [
                    {
                        id: 'c4_1_' + Date.now(),
                        nombre: 'Caja Cocina Principal',
                        gangs: '3 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 3,
                        equiposGangs: ['Keypad configurable', 'Dimmer', 'Switch'],
                        cargas: ['Spots Cocina', 'Iluminación Barra', 'Extractores de Olores'],
                        cargasDimer: ['Dimerizable', 'Dimerizable', 'No dimerizable'],
                        cargasCantidad: [8, 3, 1],
                        cargasTipo: ['Sencillo', 'Sencillo', 'Motor/Persiana']
                    },
                    {
                        id: 'c4_2_' + Date.now(),
                        nombre: 'Caja Alacena',
                        gangs: '1 Gang',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 1,
                        equiposGangs: ['Sensor'],
                        cargas: ['Luz Alacena'],
                        cargasDimer: ['No dimerizable'],
                        cargasCantidad: [2],
                        cargasTipo: ['Sencillo']
                    }
                ],
                equipos: {},
                otros: 'Sensor de movimiento en alacena para encendido automático.',
                notas: 'Prever canalización independiente para el sensor.'
            },
            {
                id: 'z5_' + Date.now(),
                nombre: 'Habitación Principal / Master Bedroom',
                ventilacion: 'Ventilador de Techo',
                mueblesIluminacion: 'Tiene iluminación en muebles',
                cajas: [
                    {
                        id: 'c5_1_' + Date.now(),
                        nombre: 'Caja Acceso Principal',
                        gangs: '3 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 2,
                        equiposGangs: ['Keypad configurable', 'Dimmer', 'Auxiliar'],
                        cargas: ['Luz General Habitación', 'Spots Vestíbulo'],
                        cargasDimer: ['Dimerizable', 'Dimerizable'],
                        cargasCantidad: [6, 3],
                        cargasTipo: ['Sencillo', 'Sencillo']
                    },
                    {
                        id: 'c5_2_' + Date.now(),
                        nombre: 'Caja Cabecera Izq',
                        gangs: '2 Gangs',
                        neutro: true,
                        cableado: 'Triway / Conmutador',
                        retornos: 1,
                        equiposGangs: ['Keypad configurable', 'Dimmer'],
                        cargas: ['Luz Lectura Izq'],
                        cargasDimer: ['Dimerizable'],
                        cargasCantidad: [1],
                        cargasTipo: ['Sencillo']
                    },
                    {
                        id: 'c5_3_' + Date.now(),
                        nombre: 'Caja Cabecera Der',
                        gangs: '2 Gangs',
                        neutro: true,
                        cableado: 'Triway / Conmutador',
                        retornos: 1,
                        equiposGangs: ['Keypad configurable', 'Dimmer'],
                        cargas: ['Luz Lectura Der'],
                        cargasDimer: ['Dimerizable'],
                        cargasCantidad: [1],
                        cargasTipo: ['Sencillo']
                    }
                ],
                equipos: {},
                otros: 'Ventilador se controlará desde el Keypad mediante escenas de Control4.',
                notas: 'El triway se comunicará por bus o inalámbrico.'
            },
            {
                id: 'z6_' + Date.now(),
                nombre: 'Baño Principal / Master Bathroom',
                ventilacion: 'Extractor',
                mueblesIluminacion: 'No hay muebles',
                cajas: [
                    {
                        id: 'c6_1_' + Date.now(),
                        nombre: 'Caja Acceso Baño',
                        gangs: '3 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 3,
                        equiposGangs: ['Keypad configurable', 'Dimmer', 'Switch'],
                        cargas: ['Spots Baño', 'Cinta LED Espejo', 'Extractor Baño'],
                        cargasDimer: ['Dimerizable', 'Dimerizable', 'No dimerizable'],
                        cargasCantidad: [4, 2, 1],
                        cargasTipo: ['Sencillo', 'Tira LED', 'Extractor']
                    }
                ],
                equipos: {},
                otros: 'Extractor programado para apagarse 10 minutos después del sensor.',
                notas: 'El espejo lleva retroiluminación LED.'
            },
            {
                id: 'z7_' + Date.now(),
                nombre: 'Terraza / Terrace',
                ventilacion: 'Ventilador de Techo',
                mueblesIluminacion: 'Planeadas a futuro',
                cajas: [
                    {
                        id: 'c7_1_' + Date.now(),
                        nombre: 'Caja Terraza',
                        gangs: '2 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 2,
                        equiposGangs: ['Keypad configurable', 'Dimmer'],
                        cargas: ['Spots Exterior', 'Luz Ambiente Barra Terraza'],
                        cargasDimer: ['Dimerizable', 'Dimerizable'],
                        cargasCantidad: [6, 3],
                        cargasTipo: ['Sencillo', 'Cinta LED']
                    }
                ],
                equipos: {},
                otros: 'Equipos exteriores deben llevar empaques IP65 en faceplates.',
                notas: 'Luz ambiental resistente a la intemperie.'
            },
            {
                id: 'z8_' + Date.now(),
                nombre: 'Home Theater / Cuarto de TV',
                ventilacion: 'Preparación para AC',
                mueblesIluminacion: 'Tiene iluminación en muebles',
                cajas: [
                    {
                        id: 'c8_1_' + Date.now(),
                        nombre: 'Caja Acceso Teatro',
                        gangs: '3 Gangs',
                        neutro: true,
                        cableado: 'Simple',
                        retornos: 2,
                        equiposGangs: ['Keypad configurable', 'Dimmer', 'Dimmer'],
                        cargas: ['Spots Generales', 'Luz LED de Paso (Zoclo)'],
                        cargasDimer: ['Dimerizable', 'Dimerizable'],
                        cargasCantidad: [6, 10],
                        cargasTipo: ['Sencillo', 'Tira LED']
                    }
                ],
                equipos: {},
                otros: 'Integrar con controlador Control4 Core para automatización de luces con el proyector.',
                notas: 'Prever iluminación para racks de equipos AV.'
            }
        ]
    };

    pilotoProyLista.zonas.forEach(z => {
        TODOS_EQUIPOS.forEach(eq => {
            z.equipos[eq.id] = 0;
        });
    });

    await DB.saveProyecto(pilotoProyLista);

    // 2. Creación del Proyecto Piloto CON equipos distribuidos en la Vista de Plano
    // Para esta propuesta, creamos un plano con 8 pines de equipos C4 colocados
    const pinesDemo = [
        { id: 'p1', x: 25, y: 30, equipoId: 'c4_lux_udim', config: { zona: 'Cocina', fusion: 'tapa_1', nota: 'Atenuación Spots Entrada.' } },
        { id: 'p2', x: 26, y: 30, equipoId: 'c4_lux_kc', config: { zona: 'Cocina', fusion: 'tapa_1', nota: 'Keypad Control de Escenas.' } },
        { id: 'p3', x: 50, y: 40, equipoId: 'c4_lux_sw', config: { zona: 'Sala de Estar', fusion: 'tapa_2', nota: 'Encendido Candil Central.' } },
        { id: 'p4', x: 51, y: 40, equipoId: 'c4_lux_ka', config: { zona: 'Sala de Estar', fusion: 'tapa_2', nota: 'Auxiliar Conmutación.' } },
        { id: 'p5', x: 52, y: 40, equipoId: 'c4_lux_4sf', config: { zona: 'Sala de Estar', fusion: 'tapa_2', nota: 'Control de Velocidad Ventilador.' } },
        { id: 'p6', x: 75, y: 55, equipoId: 'c4_sensor_mot', config: { zona: 'Pasillo Principal', fusion: '', nota: 'Sensor Encendido Automático.' } },
        { id: 'p7', x: 20, y: 45, equipoId: 'c4_lux_kds', config: { zona: 'Terraza Exterior', fusion: 'tapa_3', nota: 'Botonera con Dimmer Integrado.' } },
        { id: 'p8', x: 21, y: 45, equipoId: 'c4_lux_tv', config: { zona: 'Terraza Exterior', fusion: 'tapa_3', nota: 'Dimmer 0-10V Iluminación Ambiental.' } }
    ];

    pinesDemo.forEach(p => {
        p.equipoInfo = TODOS_EQUIPOS.find(eq => eq.id === p.equipoId);
    });

    const pilotoProyPlano = {
        id: Date.now() + 10,
        nombre: "Proyecto Piloto - Demo Vista de Plano (Con Equipos)",
        fecha: new Date().toLocaleString(),
        pdfData: null,
        pdfRotation: 0,
        planos: [
            {
                id: 'plano_piloto_' + Date.now(),
                nombre: 'Planta Piloto',
                pdfData: null,
                pdfRotation: 0,
                pinesPlano: pinesDemo
            }
        ],
        zonas: [
            {
                id: 'zp1_' + Date.now(),
                nombre: 'Habitaciones con Equipos Mapeados',
                ventilacion: 'N/A',
                mueblesIluminacion: 'No hay muebles dentro de la habitación',
                cajas: [],
                equipos: {},
                otros: 'Ver plano visual para el detalle de colocación de los 8 dispositivos.',
                notas: 'En la exportación a Excel, aparecerá la sección especial de Plano con sus columnas dinámicas para cada componente.'
            }
        ]
    };

    pilotoProyPlano.zonas.forEach(z => {
        TODOS_EQUIPOS.forEach(eq => {
            z.equipos[eq.id] = 0;
        });
    });

    await DB.saveProyecto(pilotoProyPlano);

    // Refrescar y abrir la propuesta de la vista de plano por defecto
    await renderDashboard();
    abrirProyecto(pilotoProyPlano.id);
});

document.getElementById('btn-volver-dashboard').addEventListener('click', async () => {
    await guardarDatos();
    renderDashboard();
});

async function abrirProyecto(id) {
    const proy = await DB.getProyecto(id);
    if(!proy) return;
    
    currentProyectoId = proy.id;
    zonas = proy.zonas || [];
    
    // Carga de múltiples planos con retrocompatibilidad
    planos = proy.planos || [];
    if (planos.length === 0) {
        if (proy.pdfData) {
            planos = [{
                id: 'plano_default_' + Date.now(),
                nombre: 'Plano Principal',
                pdfData: proy.pdfData,
                pdfRotation: proy.pdfRotation || 0,
                pinesPlano: proy.pinesPlano || []
            }];
        }
    }
    
    if (planos.length > 0) {
        currentPlanoId = planos[0].id;
    } else {
        currentPlanoId = null;
    }
    
    const notasPlanoEl = document.getElementById('notas-plano-textarea');
    if (notasPlanoEl) {
        notasPlanoEl.value = proy.notasPlano || '';
    }
    
    currentZoom = 1.0;
    updateZoom();
    foldedCajaIds.clear();

    cargarPlanoActivoState();

    if(zonas.length === 0) {
        crearZona('Habitación Principal');
    } else {
        expandedZonaId = zonas[0].id;
        renderizarZonas();
    }
    
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('main-editor-view').style.display = 'block';
    document.getElementById('tab-lista').click();
}

cargarDatos();

// Exportación
btnExportar.addEventListener('click', async () => {
    if (zonas.length === 0 && pinesPlano.length === 0) {
        alert("Agrega al menos una zona o coloca equipos en el plano antes de exportar.");
        return;
    }
    
    // Crear una copia temporal de las zonas para inyectar los equipos del plano
    let zonasExportar = JSON.parse(JSON.stringify(zonas));
    
    // Sincronizar el plano activo actual
    actualizarPlanoActivoEnArray();
    
    // Recorrer todos los planos y agregarlos a zonasExportar agrupados por Ubicación/Habitación
    planos.forEach(plano => {
        if (plano.pinesPlano && plano.pinesPlano.length > 0) {
            // Agrupar los pines de este plano por página y por Habitación/Zona
            let gruposPines = {};
            plano.pinesPlano.forEach(pin => {
                const pag = pin.pagina || 1;
                const zona = (pin.config && pin.config.zona) ? pin.config.zona.trim() : 'Sin ubicación';
                const key = `${pag}_${zona}`;
                if (!gruposPines[key]) {
                    gruposPines[key] = {
                        pagina: pag,
                        zona: zona,
                        pines: []
                    };
                }
                gruposPines[key].pines.push(pin);
            });

            const keysGrupos = Object.keys(gruposPines);

            keysGrupos.forEach(key => {
                const grupo = gruposPines[key];
                const pagNum = grupo.pagina;
                const zonaName = grupo.zona;
                const pinesDeEstaZona = grupo.pines;
                
                // Obtener cuántas páginas con pines hay en total para este plano
                let totalPaginasConPines = [...new Set(plano.pinesPlano.map(p => p.pagina || 1))].length;
                const sufijoPag = totalPaginasConPines > 1 ? ` - Pág ${pagNum}` : '';
                
                const notasPlanoVal = document.getElementById('notas-plano-textarea') ? document.getElementById('notas-plano-textarea').value : '';

                // Recopilar notas por equipo/pin para esta zona específica
                let notasEquiposArr = [];
                pinesDeEstaZona.forEach(pin => {
                    if (pin.config && pin.config.nota && pin.config.nota.trim() !== '') {
                        const info = pin.equipoInfo || TODOS_EQUIPOS.find(eq => eq.id === pin.equipoId);
                        const eqNombre = info ? info.nombre : 'Equipo';
                        const pn = info ? info.partNumber : '';
                        
                        // Identificador de fusion/tapa
                        let placaStr = 'Placa Individual';
                        if (pin.config.fusion) {
                            const numPlaca = pin.config.fusion.replace('tapa_', '');
                            placaStr = `Placa Fusionada #${numPlaca}`;
                        }
                        
                        // Nota detallada
                        notasEquiposArr.push(`- ${eqNombre} (${pn}) [${placaStr}]: ${pin.config.nota.trim()}`);
                    }
                });
                
                let notasFinalesStr = notasPlanoVal;
                if (notasEquiposArr.length > 0) {
                    if (notasFinalesStr) {
                        notasFinalesStr += '\n\nNotas de Equipos:\n' + notasEquiposArr.join('\n');
                    } else {
                        notasFinalesStr = 'Notas de Equipos:\n' + notasEquiposArr.join('\n');
                    }
                }

                let zonaVisual = {
                    id: 'z_visual_' + plano.id + '_p' + pagNum + '_' + encodeURIComponent(zonaName),
                    // Esto va en la columna "Habitación / Zona": Ej. "Cocina (Planta Baja)"
                    nombre: `${zonaName} (${plano.nombre}${sufijoPag})`,
                    ventilacion: 'N/A',
                    mueblesIluminacion: 'N/A',
                    cajas: [],
                    equipos: {},
                    otros: `Equipos distribuidos en el plano ${plano.nombre}, ubicación: ${zonaName}.`,
                    notes: '', // Legacy back-compatibility
                    notas: notasFinalesStr
                };
                TODOS_EQUIPOS.forEach(eq => { zonaVisual.equipos[eq.id] = 0; });
                
                // Sumar cantidades de los equipos base de esta ubicación
                pinesDeEstaZona.forEach(pin => {
                    if(zonaVisual.equipos[pin.equipoId] !== undefined) {
                        zonaVisual.equipos[pin.equipoId]++;
                    }
                });

                // Calcular Faceplates automáticamente según fusiones de esta ubicación
                let gruposTapas = {};
                let individualesCount = 0;
                
                pinesDeEstaZona.forEach(pin => {
                    const fusion = pin.config && pin.config.fusion;
                    if (fusion) {
                        if (!gruposTapas[fusion]) {
                            gruposTapas[fusion] = 0;
                        }
                        gruposTapas[fusion]++;
                    } else {
                        individualesCount++;
                    }
                });

                // Sumar faceplates por grupo
                Object.keys(gruposTapas).forEach(grupoId => {
                    let size = gruposTapas[grupoId];
                    if (size > 5) size = 5; // Límite físico de fusión
                    if (size > 0) {
                        let fpId = `c4_fp${size}`;
                        if (zonaVisual.equipos[fpId] !== undefined) {
                            zonaVisual.equipos[fpId]++;
                        }
                    }
                });

                // Sumar faceplates individuales
                if (individualesCount > 0) {
                    if (zonaVisual.equipos['c4_fp1'] !== undefined) {
                        zonaVisual.equipos['c4_fp1'] += individualesCount;
                    }
                }

                zonasExportar.push(zonaVisual);
            });
        }
    });

    // Identificar qué equipos se usaron realmente en todo el proyecto
    let equiposUsados = [];
    TODOS_EQUIPOS.forEach(eq => {
        let totalQty = 0;
        zonasExportar.forEach(z => { totalQty += (z.equipos[eq.id] || 0); });
        if(totalQty > 0) {
            equiposUsados.push(eq);
        }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Levantamiento Total');

    // Configurar columnas base
    let columnsConfig = [
        { header: 'Área / Zona', key: 'area', width: 25 },
        { header: 'Ventilación', key: 'ventilacion', width: 20 },
        { header: 'Iluminación Muebles', key: 'muebles', width: 25 },
        { header: 'Total Cajas Físicas', key: 'totalCajas', width: 18 },
        { header: 'Detalle de Cajas', key: 'detalleCajas', width: 70 },
        { header: 'Otros Reqs', key: 'otros', width: 30 }
    ];

    // Columnas dinámicas de equipos usados
    equiposUsados.forEach(eq => {
        columnsConfig.push({
            header: `[${eq.linea}] ${eq.partNumber}`,
            key: eq.id,
            width: 18
        });
    });

    // Columna de notas
    columnsConfig.push({ header: 'Notas / Observaciones', key: 'notas', width: 40 });

    worksheet.columns = columnsConfig;

    // Estilo de la fila de encabezado
    const headerRow = worksheet.getRow(1);
    headerRow.height = 30;
    headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFF' } };
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'C32032' } // Control4 Red
        };
        const alignH = colNumber <= 6 || colNumber === columnsConfig.length ? 'left' : 'center';
        cell.alignment = { vertical: 'middle', horizontal: alignH, wrapText: true };
        cell.border = {
            top: { style: 'thin', color: { argb: '444444' } },
            left: { style: 'thin', color: { argb: '444444' } },
            bottom: { style: 'medium', color: { argb: '000000' } },
            right: { style: 'thin', color: { argb: '444444' } }
        };
    });

    // Cargar filas de datos
    zonasExportar.forEach((z, rIdx) => {
        let cajasDesc = z.cajas.map((c, idx) => {
            let n = c.neutro ? "Con Neutro" : "Sin Neutro";
            let eqGangsStr = '';
            if (c.equiposGangs && c.equiposGangs.length > 0) {
                let eqNames = c.equiposGangs.map((eqId, gIdx) => {
                    if (!eqId) return `G${gIdx+1}: Vacío`;
                    return `G${gIdx+1}: ${eqId}`;
                }).join(", ");
                eqGangsStr = ` | Equipos: [${eqNames}]`;
            }
            
            let descCargas = c.cargas.map((carga, i) => {
                let dimer = (c.cargasDimer && c.cargasDimer[i]) ? c.cargasDimer[i] : 'No dimerizable';
                let cant = (c.cargasCantidad && c.cargasCantidad[i]) ? c.cargasCantidad[i] : 1;
                let tipo = (c.cargasTipo && c.cargasTipo[i]) ? c.cargasTipo[i] : 'Sin definir';
                return `R${i+1}: ${carga || 'N/A'} [${cant} luces, ${tipo}] (${dimer})`;
            }).join(" | ");
            return `Caja "${c.nombre}": [${c.gangs}${eqGangsStr} | ${n} | ${c.cableado}] -> ${descCargas}`;
        }).join("\n");

        let rowData = {
            area: z.nombre,
            ventilacion: z.ventilacion || "N/A",
            muebles: z.mueblesIluminacion || "N/A",
            totalCajas: z.cajas.length,
            detalleCajas: cajasDesc,
            otros: z.otros,
            notas: z.notas || ""
        };

        equiposUsados.forEach(eq => {
            rowData[eq.id] = z.equipos[eq.id] > 0 ? z.equipos[eq.id] : '';
        });

        const row = worksheet.addRow(rowData);
        
        // Estilo de celda individual (Zebra striping + bordes + fuentes limpias)
        const bgHex = rIdx % 2 === 0 ? 'FFFFFF' : 'F9F9F9';
        
        row.eachCell((cell, colNumber) => {
            cell.font = { name: 'Segoe UI', size: 10, color: { argb: '333333' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: bgHex }
            };
            const alignH = colNumber === 4 || (colNumber > 6 && colNumber < columnsConfig.length) ? 'center' : 'left';
            cell.alignment = { vertical: 'top', horizontal: alignH, wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'E5E7EB' } },
                left: { style: 'thin', color: { argb: 'E5E7EB' } },
                bottom: { style: 'thin', color: { argb: 'E5E7EB' } },
                right: { style: 'thin', color: { argb: 'E5E7EB' } }
            };
        });
    });

    // Guardar el archivo Excel
    let fileName = "Levantamiento_Completo_C4.xlsx";
    if(currentProyectoId) {
        const proy = await DB.getProyecto(currentProyectoId);
        if(proy && proy.nombre) {
            let safeName = proy.nombre.replace(/[^a-z0-9]/gi, '_');
            fileName = `Levantamiento_${safeName}.xlsx`;
        }
    }

    workbook.xlsx.writeBuffer().then(async function(buffer) {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        // Detectar si está corriendo en ambiente nativo móvil (Capacitor)
        if (window.Capacitor && window.Capacitor.getPlatform() !== 'web') {
            try {
                // Convertir el blob a base64
                let base64 = await new Promise((resolve) => {
                    let reader = new FileReader();
                    reader.onloadend = () => {
                        let dataUrl = reader.result;
                        let base64Data = dataUrl.split(',')[1];
                        resolve(base64Data);
                    };
                    reader.readAsDataURL(blob);
                });

                // Guardar y compartir archivo mediante Capacitor Plugins
                const { Filesystem } = Capacitor.Plugins;
                const { Share } = Capacitor.Plugins;
                
                const writeResult = await Filesystem.writeFile({
                    path: fileName,
                    data: base64,
                    directory: 'CACHE'
                });
                
                await Share.share({
                    title: 'Compartir Levantamiento',
                    text: 'Aquí está tu archivo de levantamiento Control4',
                    url: writeResult.uri,
                    dialogTitle: 'Compartir levantamiento'
                });
            } catch (err) {
                alert("Error al guardar/compartir en celular: " + err.message);
            }
        } else {
            // Comportamiento clásico en Navegador / PC
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
    });
});

/* =========================================================================
   LOGICA: VISTA DE PLANO VISUAL (BETA)
   ========================================================================= */

// Referencias del DOM
const tabLista = document.getElementById('tab-lista');
const tabPlano = document.getElementById('tab-plano');
const vistaLista = document.getElementById('vista-lista');
const vistaPlano = document.getElementById('vista-plano');
const inputPlanoFile = document.getElementById('input-plano-file');
const uploadPrompt = document.getElementById('upload-plano-prompt');
const planoInteractivo = document.getElementById('plano-interactivo');
const planoImagen = document.getElementById('plano-imagen');
const dropZone = document.getElementById('drop-zone');
const catalogoLateral = document.getElementById('draggable-items-container');
const appContent = document.querySelector('#main-editor-view .app-content');

// UI de Leyenda y Modal de Pin
const btnToggleLeyenda = document.getElementById('btn-toggle-leyenda');
const leyendaContent = document.getElementById('leyenda-content');
const modalPinConfig = document.getElementById('modal-pin-config');
const btnPinLock = document.getElementById('btn-pin-lock');
const btnPinDelete = document.getElementById('btn-pin-delete');
const btnPinClose = document.getElementById('btn-pin-close');
const pinConfigTitle = document.getElementById('pin-config-title');
const pinConfigSubtitle = document.getElementById('pin-config-subtitle');
let pinSeleccionadoParaConfig = null;

function guardarConfiguracionPin(pin) {
    if (!pin) return false;
    if (!pin.config) pin.config = {};

    const selectFusion = document.getElementById('select-pin-fusion');
    const fusionVal = selectFusion ? selectFusion.value : '';

    if (fusionVal) {
        const count = pinesPlano.filter(p => p.id !== pin.id && p.config && p.config.fusion === fusionVal).length;
        if (count >= 5) {
            alert(`No se pueden fusionar más de 5 dispositivos bajo una misma placa (Tapa Compartida #${fusionVal.replace('tapa_', '')} ya tiene 5 equipos).`);
            return false;
        }
    }

    const inputNota = document.getElementById('input-pin-nota');
    if (inputNota) pin.config.nota = inputNota.value;

    const inputZona = document.getElementById('input-pin-zona');
    if (inputZona) {
        const nuevaZona = inputZona.value.trim();
        if (!nuevaZona) {
            alert("La ubicación (Habitación / Zona) es obligatoria.");
            setTimeout(() => inputZona.focus(), 100);
            return false;
        }
        pin.config.zona = nuevaZona;
        
        // Propagar zona si está fusionado
        const grupo = fusionVal || (pin.config && pin.config.fusion);
        if (grupo) {
            pinesPlano.forEach(p => {
                if (p.config && p.config.fusion === grupo) {
                    p.config.zona = nuevaZona;
                }
            });
        }
    }

    if (selectFusion) {
        const prevFusion = pin.config.fusion;
        if (fusionVal && fusionVal !== prevFusion) {
            const pinExistente = pinesPlano.find(p => p.id !== pin.id && p.config && p.config.fusion === fusionVal);
            if (pinExistente) {
                pin.x = pinExistente.x;
                pin.y = pinExistente.y;
                if (pinExistente.config.zona) {
                    pin.config.zona = pinExistente.config.zona;
                    if (inputZona) inputZona.value = pinExistente.config.zona;
                }
            }
        }
        pin.config.fusion = fusionVal;
    }

    return true;
}

function cargarDatosPinEnModal(pin) {
    pinSeleccionadoParaConfig = pin;
    
    const pinConfigTitle = document.getElementById('pin-config-title');
    const pinConfigSubtitle = document.getElementById('pin-config-subtitle');
    const inputNota = document.getElementById('input-pin-nota');
    const inputZona = document.getElementById('input-pin-zona');
    const selectFusion = document.getElementById('select-pin-fusion');
    const btnPinLock = document.getElementById('btn-pin-lock');
    
    if (pinConfigTitle) pinConfigTitle.textContent = pin.equipoInfo.nombre;
    if (pinConfigSubtitle) pinConfigSubtitle.textContent = pin.equipoInfo.partNumber;
    
    if (inputNota) {
        inputNota.value = (pin.config && pin.config.nota) || '';
    }
    if (inputZona) {
        inputZona.value = (pin.config && pin.config.zona) || '';
    }
    if (selectFusion) {
        selectFusion.innerHTML = '<option value="">Ninguna (Tapa Individual 1-Gang)</option>';
        for (let i = 1; i <= 50; i++) {
            const opt = document.createElement('option');
            opt.value = `tapa_${i}`;
            opt.textContent = `Tapa Compartida #${i}`;
            selectFusion.appendChild(opt);
        }
        selectFusion.value = (pin.config && pin.config.fusion) || '';
        
        selectFusion.onchange = (e) => {
            const selectedGroup = e.target.value;
            if (selectedGroup) {
                const pinConZona = pinesPlano.find(p => p.config && p.config.fusion === selectedGroup && p.config.zona && p.config.zona.trim() !== '');
                if (pinConZona && inputZona) {
                    inputZona.value = pinConZona.config.zona;
                }
            }
        };
    }
    
    if (btnPinLock) {
        if(pin.isLocked) {
            btnPinLock.innerHTML = '<i class="ri-lock-unlock-line"></i> Desbloquear';
        } else {
            btnPinLock.innerHTML = '<i class="ri-lock-2-line"></i> Bloquear / Anclar';
        }
    }

    // Cargar selector de grupo si hay más de 1 equipo en la tapa
    const containerSelector = document.getElementById('container-pin-grupo-selector');
    const selectActivo = document.getElementById('select-pin-grupo-activo');
    const fusionGrupo = pin.config && pin.config.fusion;
    
    if (fusionGrupo && containerSelector && selectActivo) {
        const pinesDelGrupo = pinesPlano.filter(p => p.config && p.config.fusion === fusionGrupo);
        if (pinesDelGrupo.length > 1) {
            containerSelector.style.display = 'block';
            selectActivo.innerHTML = '';
            pinesDelGrupo.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = `${p.equipoInfo.nombre} (${p.equipoInfo.partNumber})`;
                if (p.id === pin.id) {
                    opt.selected = true;
                }
                selectActivo.appendChild(opt);
            });
            
            selectActivo.onchange = (ev) => {
                if (pinSeleccionadoParaConfig) {
                    if (!guardarConfiguracionPin(pinSeleccionadoParaConfig)) {
                        ev.target.value = pinSeleccionadoParaConfig.id;
                        return;
                    }
                }
                const nuevoPinId = ev.target.value;
                const nuevoPin = pinesPlano.find(p => p.id === nuevoPinId);
                if (nuevoPin) {
                    cargarDatosPinEnModal(nuevoPin);
                }
            };
        } else {
            containerSelector.style.display = 'none';
        }
    } else {
        if (containerSelector) containerSelector.style.display = 'none';
    }
}

function renderizarSelectorPlanos() {
    const select = document.getElementById('select-plano-activo');
    if (!select) return;
    
    select.innerHTML = '';
    planos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nombre + ` (${p.pinesPlano ? p.pinesPlano.length : 0} eq.)`;
        if (p.id === currentPlanoId) {
            opt.selected = true;
        }
        select.appendChild(opt);
    });
}

function base64ToUint8Array(base64String) {
    const base64Data = base64String.includes(';base64,') 
        ? base64String.split(';base64,')[1] 
        : base64String;
        
    const raw = window.atob(base64Data);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for(let i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    return array;
}

function cargarPlanoActivoState() {
    const plano = planos.find(p => p.id === currentPlanoId);
    
    const uploadPrompt = document.getElementById('upload-plano-prompt');
    const planoInteractivo = document.getElementById('plano-interactivo');
    const planoImagen = document.getElementById('plano-imagen');
    const pdfCanvas = document.getElementById('pdf-canvas');
    const pdfControls = document.getElementById('pdf-controls');
    const planosSelectorBar = document.getElementById('planos-selector-bar');
    const btnNextPage = document.getElementById('btn-next-page');
    const btnPrevPage = document.getElementById('btn-prev-page');
    
    if (plano) {
        pdfArrayBuffer = plano.pdfData;
        pdfRotation = plano.pdfRotation || 0;
        pinesPlano = JSON.parse(JSON.stringify(plano.pinesPlano || []));
        
        renderizarSelectorPlanos();
        
        if (pdfArrayBuffer) {
            if (typeof pdfArrayBuffer === 'string' && !pdfArrayBuffer.startsWith('data:image/')) {
                // Es un PDF en formato Base64 Data URL (Formato Unificado)
                let typedarray = base64ToUint8Array(pdfArrayBuffer);
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    pdfDoc = pdf;
                    pageNum = 1;
                    if (uploadPrompt) uploadPrompt.style.display = 'none';
                    if (planoInteractivo) planoInteractivo.style.display = 'block';
                    if (planoImagen) planoImagen.style.display = 'none';
                    if (pdfCanvas) pdfCanvas.style.display = 'block';
                    if (pdfControls) pdfControls.style.display = 'flex';
                    if (planosSelectorBar) planosSelectorBar.style.display = 'flex';
                    
                    if (btnNextPage && btnPrevPage) {
                        if(pdf.numPages > 1) {
                            btnNextPage.style.display = 'inline-block';
                            btnPrevPage.style.display = 'inline-block';
                        } else {
                            btnNextPage.style.display = 'none';
                            btnPrevPage.style.display = 'none';
                        }
                    }
                    renderPDFPage(pageNum);
                }).catch(err => {
                    console.error("Error al cargar PDF:", err);
                    alert("Error al abrir el archivo PDF del plano.");
                });
            } else if (typeof pdfArrayBuffer === 'string') {
                // Es una imagen (Base64)
                pdfDoc = null;
                if (uploadPrompt) uploadPrompt.style.display = 'none';
                if (planoInteractivo) planoInteractivo.style.display = 'block';
                if (planoImagen) {
                    planoImagen.src = pdfArrayBuffer;
                    planoImagen.style.display = 'block';
                }
                if (pdfCanvas) pdfCanvas.style.display = 'none';
                if (pdfControls) pdfControls.style.display = 'none';
                if (planosSelectorBar) planosSelectorBar.style.display = 'flex';
                renderizarPines();
            } else {
                // Es un PDF legado (ArrayBuffer)
                let typedarray = new Uint8Array(pdfArrayBuffer.slice(0));
                pdfjsLib.getDocument(typedarray).promise.then(pdf => {
                    pdfDoc = pdf;
                    pageNum = 1;
                    if (uploadPrompt) uploadPrompt.style.display = 'none';
                    if (planoInteractivo) planoInteractivo.style.display = 'block';
                    if (planoImagen) planoImagen.style.display = 'none';
                    if (pdfCanvas) pdfCanvas.style.display = 'block';
                    if (pdfControls) pdfControls.style.display = 'flex';
                    if (planosSelectorBar) planosSelectorBar.style.display = 'flex';
                    
                    if (btnNextPage && btnPrevPage) {
                        if(pdf.numPages > 1) {
                            btnNextPage.style.display = 'inline-block';
                            btnPrevPage.style.display = 'inline-block';
                        } else {
                            btnNextPage.style.display = 'none';
                            btnPrevPage.style.display = 'none';
                        }
                    }
                    renderPDFPage(pageNum);
                }).catch(err => {
                    console.error("Error al cargar PDF:", err);
                    alert("Error al abrir el archivo PDF del plano.");
                });
            }
        } else {
            pdfDoc = null;
            if (uploadPrompt) uploadPrompt.style.display = 'block';
            if (planoInteractivo) planoInteractivo.style.display = 'none';
            if (pdfControls) pdfControls.style.display = 'none';
            if (planosSelectorBar) planosSelectorBar.style.display = 'flex';
            renderizarPines();
        }
    } else {
        pdfArrayBuffer = null;
        pdfRotation = 0;
        pinesPlano = [];
        pdfDoc = null;
        if (uploadPrompt) uploadPrompt.style.display = 'block';
        if (planoInteractivo) planoInteractivo.style.display = 'none';
        if (pdfControls) pdfControls.style.display = 'none';
        if (planosSelectorBar) planosSelectorBar.style.display = 'none';
        renderizarPines();
    }
}

// Inicializar Listeners para gestión de múltiples planos
document.addEventListener('DOMContentLoaded', () => {
    const selectPlanoActivo = document.getElementById('select-plano-activo');
    const btnPlanoAdd = document.getElementById('btn-plano-add');
    const btnPlanoRename = document.getElementById('btn-plano-rename');
    const btnPlanoDelete = document.getElementById('btn-plano-delete');
    
    if (selectPlanoActivo) {
        selectPlanoActivo.addEventListener('change', (e) => {
            actualizarPlanoActivoEnArray();
            currentPlanoId = e.target.value;
            cargarPlanoActivoState();
            guardarDatos();
        });
    }
    
    if (btnPlanoAdd) {
        btnPlanoAdd.addEventListener('click', async () => {
            const nombrePiso = await mostrarPromptPersonalizado("Introduce el nombre para el nuevo Piso / Área (Ej. Planta Alta, Terraza):", `Planta ${planos.length + 1}`);
            if (!nombrePiso) return;
            
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*,application/pdf';
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if(!file) return;
                
                const reader = new FileReader();
                reader.onload = async (event) => {
                    actualizarPlanoActivoEnArray();
                    
                    const nuevoPlano = {
                        id: 'plano_' + Date.now(),
                        nombre: nombrePiso,
                        pdfData: event.target.result,
                        pdfRotation: 0,
                        pinesPlano: []
                    };
                    planos.push(nuevoPlano);
                    currentPlanoId = nuevoPlano.id;
                    
                    cargarPlanoActivoState();
                    guardarDatos();
                };
                
                reader.readAsDataURL(file);
            };
            fileInput.click();
        });
    }
    
    if (btnPlanoRename) {
        btnPlanoRename.addEventListener('click', async () => {
            const plano = planos.find(p => p.id === currentPlanoId);
            if (!plano) return;
            
            const nuevoNombre = await mostrarPromptPersonalizado("Modificar nombre del Piso / Vista:", plano.nombre);
            if (nuevoNombre && nuevoNombre.trim() !== '') {
                plano.nombre = nuevoNombre.trim();
                renderizarSelectorPlanos();
                guardarDatos();
            }
        });
    }
    
    if (btnPlanoDelete) {
        btnPlanoDelete.addEventListener('click', () => {
            const plano = planos.find(p => p.id === currentPlanoId);
            if (!plano) return;
            
            if (confirm(`¿Estás seguro de que deseas eliminar por completo el piso "${plano.nombre}" y todos sus equipos colocados? Esta acción no se puede deshacer.`)) {
                planos = planos.filter(p => p.id !== currentPlanoId);
                if (planos.length > 0) {
                    currentPlanoId = planos[0].id;
                } else {
                    currentPlanoId = null;
                }
                cargarPlanoActivoState();
                guardarDatos();
            }
        });
    }
});

btnToggleLeyenda.addEventListener('click', () => {
    if(leyendaContent.style.display === 'none') {
        leyendaContent.style.display = 'flex';
        btnToggleLeyenda.innerHTML = '<i class="ri-subtract-line"></i>';
    } else {
        leyendaContent.style.display = 'none';
        btnToggleLeyenda.innerHTML = '<i class="ri-add-line"></i>';
    }
});

btnPinClose.addEventListener('click', () => {
    if (pinSeleccionadoParaConfig) {
        if (!guardarConfiguracionPin(pinSeleccionadoParaConfig)) {
            return;
        }
        renderizarPines();
        guardarDatos();
    }
    modalPinConfig.classList.add('hidden');
    pinSeleccionadoParaConfig = null;
});

btnPinDelete.addEventListener('click', () => {
    if(!pinSeleccionadoParaConfig) return;
    pinesPlano = pinesPlano.filter(p => p.id !== pinSeleccionadoParaConfig.id);
    modalPinConfig.classList.add('hidden');
    renderizarPines();
    guardarDatos();
});

btnPinLock.addEventListener('click', () => {
    if(!pinSeleccionadoParaConfig) return;
    if (!guardarConfiguracionPin(pinSeleccionadoParaConfig)) {
        return;
    }
    pinSeleccionadoParaConfig.isLocked = !pinSeleccionadoParaConfig.isLocked;
    modalPinConfig.classList.add('hidden');
    renderizarPines();
    guardarDatos();
});

// Navegación por Pestañas
tabLista.addEventListener('click', () => {
    tabLista.style.borderBottomColor = 'var(--primary-color)';
    tabLista.style.color = '#fff';
    tabPlano.style.borderBottomColor = 'transparent';
    tabPlano.style.color = 'var(--text-muted)';
    vistaLista.style.display = 'block';
    vistaPlano.style.display = 'none';
    appContent.classList.remove('full-width');
    document.getElementById('btn-add-zona').style.display = 'flex';
});

tabPlano.addEventListener('click', () => {
    tabPlano.style.borderBottomColor = 'var(--primary-color)';
    tabPlano.style.color = '#fff';
    tabLista.style.borderBottomColor = 'transparent';
    tabLista.style.color = 'var(--text-muted)';
    vistaLista.style.display = 'none';
    vistaPlano.style.display = 'flex';
    appContent.classList.add('full-width');
    document.getElementById('btn-add-zona').style.display = 'none';
    // Si no tiene hijos elemento (solo texto/comentarios), renderizamos
    if(catalogoLateral.children.length === 0) {
        renderizarCatalogoDraggable();
    }
});

let pdfDoc = null;
let pageNum = 1;
let pdfRotation = 0; // Estado de rotación (0, 90, 180, 270)
let currentZoom = 1.0;
const pdfCanvas = document.getElementById('pdf-canvas');
const pdfCtx = pdfCanvas.getContext('2d');
const pdfControls = document.getElementById('pdf-controls');
const btnPrevPage = document.getElementById('btn-prev-page');
const btnNextPage = document.getElementById('btn-next-page');
const btnRotatePdf = document.getElementById('btn-rotate-pdf');
const btnZoomIn = document.getElementById('btn-zoom-in');
const btnZoomOut = document.getElementById('btn-zoom-out');
const pdfPageInfo = document.getElementById('pdf-page-info');
const pdfZoomInfo = document.getElementById('pdf-zoom-info');
const zoomContainer = document.getElementById('zoom-container');

function updateZoom() {
    zoomContainer.style.width = (currentZoom * 100) + '%';
    pdfZoomInfo.textContent = Math.round(currentZoom * 100) + '%';
}

// Carga de la imagen o PDF del Plano
inputPlanoFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;

    let nombrePiso = "Planta Baja";
    if (planos.length === 0) {
        nombrePiso = await mostrarPromptPersonalizado("Introduce el nombre de este Piso / Vista (Ej. Planta Baja, Planta Alta):", "Planta Baja");
        if (!nombrePiso) return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        const fileData = event.target.result;
        
        if (currentPlanoId) {
            const idx = planos.findIndex(p => p.id === currentPlanoId);
            if (idx !== -1) {
                planos[idx].pdfData = fileData;
                planos[idx].pdfRotation = 0;
            }
        } else {
            const nuevoPlano = {
                id: 'plano_' + Date.now(),
                nombre: nombrePiso,
                pdfData: fileData,
                pdfRotation: 0,
                pinesPlano: []
            };
            planos = [nuevoPlano];
            currentPlanoId = nuevoPlano.id;
        }
        
        cargarPlanoActivoState();
        guardarDatos();
    };

    reader.readAsDataURL(file);
});

function renderPDFPage(num) {
    pdfDoc.getPage(num).then(page => {
        // Escalar el PDF dinámicamente según si es PC o dispositivo móvil
        const baseViewport = page.getViewport({ scale: 1.0 });
        const maxDim = Math.max(baseViewport.width, baseViewport.height);
        
        const dpr = window.devicePixelRatio || 1;
        const isMobile = (window.Capacitor && window.Capacitor.getPlatform() !== 'web') || 
                         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Asignar límites de tamaño: PC admite resoluciones gigantescas (hasta 9000px físicos)
        const targetLogicalSize = isMobile ? 2500 : 4500;
        const maxPhysicalLimit = isMobile ? 5000 : 9000;
        
        let targetScale = (targetLogicalSize * dpr) / maxDim;
        // Limitar la escala base entre 1.5 y 8.0
        targetScale = Math.max(1.5, Math.min(8.0, targetScale));

        // Limitar resolución máxima para evitar sobrecarga de GPU / memoria
        const tempViewport = page.getViewport({ scale: targetScale, rotation: pdfRotation });
        const tempMax = Math.max(tempViewport.width, tempViewport.height);
        if (tempMax > maxPhysicalLimit) {
            targetScale = targetScale * (maxPhysicalLimit / tempMax);
        }

        const viewport = page.getViewport({ scale: targetScale, rotation: pdfRotation });
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;
        
        console.log(`[PDF Render] Pág: ${num} | DPR: ${dpr} | Escala final: ${targetScale.toFixed(2)} | Res: ${pdfCanvas.width}x${pdfCanvas.height}`);

        // Limitar tamaño en pantalla para que no se desborde usando CSS
        pdfCanvas.style.width = '100%';
        pdfCanvas.style.height = 'auto';

        const renderContext = {
            canvasContext: pdfCtx,
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            // Forzar renderizado de pines una vez que el canvas tiene sus dimensiones finales
            pdfPageInfo.textContent = `Pág ${num} / ${pdfDoc.numPages}`;
            renderizarPines();
        });
    });
}

btnPrevPage.addEventListener('click', () => {
    if (pageNum <= 1) return;
    pageNum--;
    renderPDFPage(pageNum);
});

btnNextPage.addEventListener('click', () => {
    if (pageNum >= pdfDoc.numPages) return;
    pageNum++;
    renderPDFPage(pageNum);
});

btnRotatePdf.addEventListener('click', () => {
    if (!pdfDoc) return;
    pdfRotation = (pdfRotation + 90) % 360;
    renderPDFPage(pageNum);
    guardarDatos();
});

btnZoomIn.addEventListener('click', () => {
    if (currentZoom >= 5.0) return;
    currentZoom += 0.25;
    updateZoom();
});

btnZoomOut.addEventListener('click', () => {
    if (currentZoom <= 0.25) return;
    currentZoom -= 0.25;
    updateZoom();
});

// Renderizar el catálogo lateral para Drag & Drop (Custom Mouse Drag + Click-to-Place)
function renderizarCatalogoDraggable() {
    let html = '';
    TODOS_EQUIPOS.forEach(eq => {
        // Ignoramos faceplates puros para el plano por ahora
        if(eq.tipo === 'Faceplate') return;
        
        let icon = eq.tipo === 'Dimmer' ? 'ri-lightbulb-flash-line' : 
                   eq.tipo === 'Keypad' ? 'ri-grid-fill' : 
                   eq.tipo === 'Switch' ? 'ri-toggle-fill' : 'ri-sensor-line';

        html += `
            <div class="draggable-item" draggable="false" data-equipo-id="${eq.id}">
                <img src="${eq.img}" alt="${eq.nombre}" draggable="false" onerror="this.src='https://placehold.co/40x40?text=C4'">
                <div style="display:flex; flex-direction:column; pointer-events:none;">
                    <span>${eq.nombre}</span>
                    <small style="color:var(--text-muted); font-size:0.7rem;">${eq.partNumber}</small>
                </div>
                <i class="${icon}" style="margin-left:auto; color:var(--text-muted); pointer-events:none;"></i>
            </div>
        `;
    });
    catalogoLateral.innerHTML = html;

    const items = document.querySelectorAll('.draggable-item');
    items.forEach(item => {
        const equipoId = item.getAttribute('data-equipo-id');
        const equipoInfo = TODOS_EQUIPOS.find(eq => eq.id === equipoId);

        // Arrastre personalizado con eventos de Mouse (evita por completo el HTML5 drag nativo de Chrome)
        item.addEventListener('mousedown', (e) => {
            if (e.button !== 0 || !equipoInfo) return;

            let isDragging = false;
            let dragEl = null;

            const startX = e.clientX;
            const startY = e.clientY;

            const onMouseMove = (ev) => {
                // Iniciar arrastre si se mueve más de 5px
                if (!isDragging && (Math.abs(ev.clientX - startX) > 5 || Math.abs(ev.clientY - startY) > 5)) {
                    isDragging = true;
                    
                    dragEl = document.createElement('div');
                    const tipoClass = equipoInfo.tipo.toLowerCase();
                    let shapeClass = 'shape-lux';
                    if(equipoInfo.linea === 'Essential') shapeClass = 'shape-essential';
                    else if(equipoInfo.linea === 'Contemporary') shapeClass = 'shape-contemporary';
                    else if(equipoInfo.linea === 'Tradicional') shapeClass = 'shape-tradicional';
                    
                    dragEl.className = `plano-pin ${tipoClass} ${shapeClass}`;
                    dragEl.style.position = 'fixed';
                    dragEl.style.pointerEvents = 'none';
                    dragEl.style.zIndex = '9999';
                    dragEl.style.opacity = '0.8';
                    document.body.appendChild(dragEl);
                }

                if (isDragging && dragEl) {
                    dragEl.style.left = (ev.clientX - 6) + 'px';
                    dragEl.style.top = (ev.clientY - 6) + 'px';
                }
            };

            const onMouseUp = async (ev) => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);

                if (isDragging) {
                    if (dragEl) dragEl.remove();

                    // Verificar si se soltó en la Drop Zone
                    const rect = dropZone.getBoundingClientRect();
                    if (
                        ev.clientX >= rect.left &&
                        ev.clientX <= rect.right &&
                        ev.clientY >= rect.top &&
                        ev.clientY <= rect.bottom
                    ) {
                        const x = ((ev.clientX - rect.left) / rect.width) * 100;
                        const y = ((ev.clientY - rect.top) / rect.height) * 100;

                        const nuevoPin = {
                            id: 'pin_' + Date.now(),
                            x: x,
                            y: y,
                            equipoId: equipoId,
                            equipoInfo: equipoInfo,
                            pagina: pageNum || 1,
                            config: {}
                        };
                        pinesPlano.push(nuevoPin);

                        renderizarPines();
                        guardarDatos();
                        
                        await verificarFusionPorSuperposicion(nuevoPin, x, y);
                        
                        // Abrir modal de configuración de pin automáticamente
                        cargarDatosPinEnModal(nuevoPin);
                        modalPinConfig.classList.remove('hidden');
                    }
                }
            };

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        // Alternativa de click para colocar en dispositivos touch y móviles (o clics rápidos)
        item.addEventListener('click', () => {
            const selected = item.classList.contains('selected-active');
            document.querySelectorAll('.draggable-item').forEach(el => el.classList.remove('selected-active'));
            
            const toast = document.getElementById('colocacion-toast');
            const toastText = document.getElementById('colocacion-toast-text');
            
            if (!selected) {
                item.classList.add('selected-active');
                if (toast && toastText) {
                    const eqName = item.querySelector('span').textContent;
                    toastText.textContent = `Modo Colocación: Haz clic en el plano para colocar ${eqName} (o haz clic en el menú para cancelar)`;
                    toast.style.display = 'flex';
                }
            } else {
                if (toast) toast.style.display = 'none';
            }
        });
    });
}

// Configurar el Área de caída (Drop Zone)
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault(); // Necesario para permitir soltar
    e.dataTransfer.dropEffect = 'copy';
});

// Click en el lienzo para colocar equipo seleccionado (móvil y alternativa fácil de escritorio)
dropZone.addEventListener('click', async (e) => {
    if (e.target.closest('.plano-pin') || e.target.closest('.pin-config-btn')) return;

    const selectedItem = document.querySelector('.draggable-item.selected-active');
    if (selectedItem) {
        const equipoId = selectedItem.getAttribute('data-equipo-id');
        const equipoInfo = TODOS_EQUIPOS.find(eq => eq.id === equipoId);
        if (!equipoInfo) return;

        const rect = dropZone.getBoundingClientRect();
        if(rect.width === 0 || rect.height === 0) return;

        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const nuevoPin = {
            id: 'pin_' + Date.now(),
            x: x,
            y: y,
            equipoId: equipoId,
            equipoInfo: equipoInfo,
            pagina: pageNum || 1,
            config: {}
        };
        pinesPlano.push(nuevoPin);

        renderizarPines();
        guardarDatos();

        selectedItem.classList.remove('selected-active');
        
        const toast = document.getElementById('colocacion-toast');
        if (toast) toast.style.display = 'none';

        await verificarFusionPorSuperposicion(nuevoPin, x, y);
        
        // Abrir modal de configuración de pin automáticamente
        cargarDatosPinEnModal(nuevoPin);
        modalPinConfig.classList.remove('hidden');
    }
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    
    // Calcular posición X, Y relativa a la imagen
    const rect = dropZone.getBoundingClientRect();
    if(rect.width === 0 || rect.height === 0) {
        alert("Error: El contenedor del plano no tiene tamaño definido.");
        return;
    }

    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const dragPinId = e.dataTransfer.getData('pinId');
    if(dragPinId) {
        // Ya no usamos HTML5 drag para pines internos
        return;
    }

    const equipoId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('equipoId');
    if(!equipoId) {
        alert("Error: No se detectó el ID del equipo arrastrado.");
        return;
    }

    const equipoInfo = TODOS_EQUIPOS.find(eq => eq.id === equipoId);
    if(!equipoInfo) {
        alert("Error: Equipo no encontrado en el catálogo.");
        return;
    }
    
    // Crear el Pin en el DOM
    const pinId = 'pin_' + Date.now();
    const nuevoPin = {
        id: pinId,
        x: x,
        y: y,
        equipoId: equipoId,
        equipoInfo: equipoInfo,
        pagina: pageNum || 1,
        config: {}
    };
    pinesPlano.push(nuevoPin);

    renderizarPines();
    guardarDatos();

    // Verificar si se sobrepone a otro
    await verificarFusionPorSuperposicion(nuevoPin, x, y);
    
    // Abrir modal de configuración de pin automáticamente
    cargarDatosPinEnModal(nuevoPin);
    modalPinConfig.classList.remove('hidden');
});

function obtenerPinCercano(x, y, excluyendoPinId = null) {
    const umbralPorcentaje = 4.0; // Umbral de cercanía en porcentaje
    let pinMasCercano = null;
    let distanciaMinima = Infinity;

    pinesPlano.forEach(p => {
        if (excluyendoPinId && p.id === excluyendoPinId) return;
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < umbralPorcentaje && dist < distanciaMinima) {
            distanciaMinima = dist;
            pinMasCercano = p;
        }
    });

    return pinMasCercano;
}

async function verificarFusionPorSuperposicion(pin, x, y) {
    const pinCercano = obtenerPinCercano(x, y, pin.id);
    if (!pinCercano) return;

    const fusionGrupoDestino = pinCercano.config && pinCercano.config.fusion;
    
    // Si ya pertenecen al mismo grupo de fusión, no hay nada que hacer ni validar
    if (fusionGrupoDestino && pin.config && pin.config.fusion === fusionGrupoDestino) {
        return;
    }

    if (fusionGrupoDestino) {
        const count = pinesPlano.filter(p => p.config && p.config.fusion === fusionGrupoDestino).length;
        if (count >= 5) {
            alert(`No se pueden fusionar más de 5 dispositivos bajo una misma placa (Tapa Compartida #${fusionGrupoDestino.replace('tapa_', '')} ya tiene 5 equipos).`);
            return;
        }
    }

    const nombrePinNuevo = pin.equipoInfo.nombre;
    const nombrePinExistente = pinCercano.equipoInfo.nombre;
    const mensaje = `¿Deseas fusionar "${nombrePinNuevo}" con "${nombrePinExistente}" bajo la misma placa/tapa compartida?`;
    const confirmar = await mostrarConfirmacionPersonalizada(mensaje);
    
    if (confirmar) {
        if (!pin.config) pin.config = {};
        if (!pinCercano.config) pinCercano.config = {};
        
        let grupoAsignado = fusionGrupoDestino;
        if (!grupoAsignado) {
            for (let i = 1; i <= 50; i++) {
                const tempGrupo = 'tapa_' + i;
                const count = pinesPlano.filter(p => p.config && p.config.fusion === tempGrupo).length;
                if (count === 0) {
                    grupoAsignado = tempGrupo;
                    break;
                }
            }
            if (!grupoAsignado) {
                grupoAsignado = 'tapa_1';
            }
            pinCercano.config.fusion = grupoAsignado;
        }

        pin.config.fusion = grupoAsignado;
        
        if (pinCercano.config.zona) {
            pin.config.zona = pinCercano.config.zona;
        }

        pin.x = pinCercano.x;
        pin.y = pinCercano.y;
        
        renderizarPines();
        guardarDatos();
    }
}

function renderizarPines() {
    dropZone.innerHTML = '';
    pinesPlano.forEach(pin => {
        // Filtrar por página actual si es un documento PDF
        const pinPage = pin.pagina || 1;
        const currentPage = pageNum || 1;
        if (pdfDoc && pinPage !== currentPage) {
            return;
        }
        const pinEl = document.createElement('div');
        pinEl.id = pin.id;
        
        // Determinar color por tipo
        const tipoClass = pin.equipoInfo.tipo.toLowerCase();
        
        // Determinar forma geométrica por línea de producto
        let shapeClass = 'shape-lux'; // default
        if(pin.equipoInfo.linea === 'Essential') shapeClass = 'shape-essential';
        else if(pin.equipoInfo.linea === 'Contemporary') shapeClass = 'shape-contemporary';
        else if(pin.equipoInfo.linea === 'Tradicional') shapeClass = 'shape-tradicional';

        pinEl.className = `plano-pin ${tipoClass} ${shapeClass}`;
        pinEl.style.left = pin.x + '%';
        pinEl.style.top = pin.y + '%';
        pinEl.title = pin.equipoInfo.nombre + ' (' + pin.equipoInfo.partNumber + ')' + 
                      (pin.config && pin.config.zona ? ' - Habitación: ' + pin.config.zona : '') +
                      (pin.config && pin.config.fusion ? ' - Tapa: ' + pin.config.fusion.replace('tapa_', '#') : '');

        // Agregar badge de fusión si está agrupado
        if (pin.config && pin.config.fusion) {
            const num = pin.config.fusion.replace('tapa_', '');
            const badge = document.createElement('span');
            badge.className = 'pin-group-badge';
            badge.textContent = 'T' + num;
            pinEl.appendChild(badge);
        }

        // Lógica de Movimiento Fluido con el Ratón (Evita bloqueos HTML5)
        if (pin.isLocked) {
            pinEl.classList.add('locked');
        }

        let hasDragged = false;

        pinEl.onmousedown = (e) => {
            if (e.button !== 0) return; // SOLO actuar con click izquierdo
            e.preventDefault(); // Previene selección de texto o HTML5 drag
            e.stopPropagation();
            hasDragged = false;
            if(pin.isLocked) return; // Si está bloqueado, no se puede arrastrar

            const moveHandler = (ev) => {
                hasDragged = true;
                const rect = dropZone.getBoundingClientRect();
                let newX = ((ev.clientX - rect.left) / rect.width) * 100;
                let newY = ((ev.clientY - rect.top) / rect.height) * 100;

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                const fusionGrupo = pin.config && pin.config.fusion;
                if (fusionGrupo) {
                    pinesPlano.forEach(p => {
                        if (p.config && p.config.fusion === fusionGrupo) {
                            p.x = newX;
                            p.y = newY;
                            const el = document.getElementById(p.id);
                            if (el) {
                                el.style.left = newX + '%';
                                el.style.top = newY + '%';
                            }
                        }
                    });
                } else {
                    pinEl.style.left = newX + '%';
                    pinEl.style.top = newY + '%';
                    pin.x = newX;
                    pin.y = newY;
                }
            };

            const upHandler = () => {
                document.removeEventListener('mousemove', moveHandler);
                document.removeEventListener('mouseup', upHandler);
                guardarDatos();
                if (hasDragged) {
                    verificarFusionPorSuperposicion(pin, pin.x, pin.y);
                }
            };

            document.addEventListener('mousemove', moveHandler);
            document.addEventListener('mouseup', upHandler);
        };

        // Soporte de touch/móvil para arrastrar pines
        pinEl.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            hasDragged = false;
            if(pin.isLocked) return;

            const touchMoveHandler = (ev) => {
                hasDragged = true;
                const touch = ev.touches[0];
                const rect = dropZone.getBoundingClientRect();
                let newX = ((touch.clientX - rect.left) / rect.width) * 100;
                let newY = ((touch.clientY - rect.top) / rect.height) * 100;

                newX = Math.max(0, Math.min(100, newX));
                newY = Math.max(0, Math.min(100, newY));

                const fusionGrupo = pin.config && pin.config.fusion;
                if (fusionGrupo) {
                    pinesPlano.forEach(p => {
                        if (p.config && p.config.fusion === fusionGrupo) {
                            p.x = newX;
                            p.y = newY;
                            const el = document.getElementById(p.id);
                            if (el) {
                                el.style.left = newX + '%';
                                el.style.top = newY + '%';
                            }
                        }
                    });
                } else {
                    pinEl.style.left = newX + '%';
                    pinEl.style.top = newY + '%';
                    pin.x = newX;
                    pin.y = newY;
                }
            };

            const touchEndHandler = () => {
                document.removeEventListener('touchmove', touchMoveHandler);
                document.removeEventListener('touchend', touchEndHandler);
                guardarDatos();
                if (hasDragged) {
                    verificarFusionPorSuperposicion(pin, pin.x, pin.y);
                }
            };

            document.addEventListener('touchmove', touchMoveHandler, { passive: false });
            document.addEventListener('touchend', touchEndHandler);
        });

        // Configuración por clic/tap rápido (ideal para móvil/tablet y muy cómodo en PC)
        pinEl.onclick = (e) => {
            e.stopPropagation();
            if (hasDragged) return; // Si se arrastró el pin, no abrir la configuración
            
            cargarDatosPinEnModal(pin);
            modalPinConfig.classList.remove('hidden');
        };

        // Doble click como alternativa heredada en PC
        pinEl.ondblclick = (e) => {
            e.stopPropagation();
            cargarDatosPinEnModal(pin);
            modalPinConfig.classList.remove('hidden');
        };

        // Atajo PC: Clic derecho para borrar rápido
        pinEl.oncontextmenu = (e) => {
            e.preventDefault();
            e.stopPropagation();
            pinesPlano = pinesPlano.filter(p => p.id !== pin.id);
            renderizarPines();
            guardarDatos();
        };

        dropZone.appendChild(pinEl);
    });
}

// Filtro de Búsqueda para el Catálogo Lateral
function filtrarCatalogoDraggable() {
    const term = document.getElementById('search-plano-catalogo').value.toLowerCase();
    const items = document.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        // En el HTML, el texto está dentro de los span y small del div flex interior
        const texto = item.innerText.toLowerCase();
        if(texto.includes(term)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Lógica para alternar Pantalla Completa en el editor de planos
const btnFullscreenLienzo = document.getElementById('btn-fullscreen-lienzo');
if (btnFullscreenLienzo) {
    btnFullscreenLienzo.addEventListener('click', () => {
        const vistaPlano = document.getElementById('vista-plano');
        if (!document.fullscreenElement) {
            vistaPlano.requestFullscreen().then(() => {
                btnFullscreenLienzo.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
                btnFullscreenLienzo.title = "Salir de Pantalla Completa";
            }).catch(err => {
                alert(`Error al activar pantalla completa: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    });
}

document.addEventListener('fullscreenchange', () => {
    const btnFullscreenLienzo = document.getElementById('btn-fullscreen-lienzo');
    if (btnFullscreenLienzo) {
        if (document.fullscreenElement) {
            btnFullscreenLienzo.innerHTML = '<i class="ri-fullscreen-exit-line"></i>';
            btnFullscreenLienzo.title = "Salir de Pantalla Completa";
        } else {
            btnFullscreenLienzo.innerHTML = '<i class="ri-fullscreen-line"></i>';
            btnFullscreenLienzo.title = "Pantalla Completa";
        }
    }
});

} catch(e) { alert('Runtime Error: ' + e.message + ' ' + e.stack); }
