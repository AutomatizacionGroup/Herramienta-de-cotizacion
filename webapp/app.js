const TODOS_EQUIPOS = [
    // LUX
    { id: 'kds', nombre: 'KDS', desc: 'Keypad Dimmer', img: 'keypad.png', linea: 'LUX', tipo: 'Keypad' },
    { id: 'sw', nombre: 'SW', desc: 'Switch', img: 'switch.png', linea: 'LUX', tipo: 'Switch' },
    { id: 'ckd', nombre: 'CKD', desc: 'Keypad Config.', img: 'keypad.png', linea: 'LUX', tipo: 'Keypad' },
    { id: 'kds_dual', nombre: 'KD/S Dual', desc: 'Keypad/Switch', img: 'keypad.png', linea: 'LUX', tipo: 'Keypad' },
    { id: 'udm', nombre: 'UDM', desc: 'Univ. Dimmer', img: 'switch.png', linea: 'LUX', tipo: 'Dimmer' },
    { id: 'dm_motion', nombre: 'DM/S/Mot', desc: 'Dim/Sw/Mot', img: 'sensor.png', linea: 'LUX', tipo: 'Sensor' },
    { id: 'auxk', nombre: 'AUXK', desc: 'Aux Keypad', img: 'keypad.png', linea: 'LUX', tipo: 'Keypad' },
    { id: 'mecanico', nombre: 'Mecánico', desc: 'Sw Mecánico', img: 'switch.png', linea: 'LUX', tipo: 'Switch' },
    { id: 'fp1', nombre: 'FP1', desc: '1-Gang', img: 'faceplate.png', linea: 'LUX', tipo: 'Faceplate' },
    { id: 'fp2', nombre: 'FP2', desc: '2-Gang', img: 'faceplate.png', linea: 'LUX', tipo: 'Faceplate' },
    { id: 'fp3', nombre: 'FP3', desc: '3-Gang', img: 'faceplate.png', linea: 'LUX', tipo: 'Faceplate' },
    { id: 'fp4', nombre: 'FP4', desc: '4-Gang', img: 'faceplate.png', linea: 'LUX', tipo: 'Faceplate' },
    
    // TRADICIONAL
    { id: 't_kds', nombre: 'T-KDS', desc: 'Keypad Dimmer', img: 'keypad.png', linea: 'Tradicional', tipo: 'Keypad' },
    { id: 't_sw', nombre: 'T-SW', desc: 'Switch', img: 'switch.png', linea: 'Tradicional', tipo: 'Switch' },
    { id: 't_ckd', nombre: 'T-CKD', desc: 'Keypad Config.', img: 'keypad.png', linea: 'Tradicional', tipo: 'Keypad' },
    { id: 't_ess_fwd', nombre: 'T-ESS FWD', desc: 'Essential Forward', img: 'switch.png', linea: 'Essential', tipo: 'Dimmer' },
    { id: 't_auxk', nombre: 'T-AUXK', desc: 'Aux Keypad', img: 'keypad.png', linea: 'Tradicional', tipo: 'Keypad' }
];

let zonas = [];

function guardarDatos() {
    localStorage.setItem('c4_cotizador_data', JSON.stringify(zonas));
}

const contenedorZonas = document.getElementById('zonas-container');
const btnAddZona = document.getElementById('btn-add-zona');
const modalZona = document.getElementById('modal-zona');
const btnCancelarZona = document.getElementById('btn-cancelar-zona');
const btnGuardarZona = document.getElementById('btn-guardar-zona');
const inputZonaNombre = document.getElementById('input-zona-nombre');
const btnExportar = document.getElementById('btn-exportar');
const btnReiniciar = document.getElementById('btn-reiniciar');

btnReiniciar.addEventListener('click', () => {
    if (confirm("¿Estás seguro de que quieres volver a comenzar? Se borrarán todas las habitaciones y no se puede deshacer.")) {
        zonas = [];
        guardarDatos();
        crearZona('Habitación Principal');
    }
});

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
        notas: ''
    };
    TODOS_EQUIPOS.forEach(eq => { nuevaZona.equipos[eq.id] = 0; });
    zonas.push(nuevaZona);
    
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

document.getElementById('btn-cancelar-caja').addEventListener('click', () => {
    document.getElementById('modal-caja').classList.add('hidden');
    zonaActualParaCaja = null;
});

document.getElementById('btn-guardar-caja').addEventListener('click', () => {
    const nombreCaja = document.getElementById('input-caja-nombre').value.trim();
    if (!nombreCaja) {
        alert("Debes ingresar la ubicación de la caja para continuar.");
        return;
    }
    
    const zona = zonas.find(z => z.id === zonaActualParaCaja);
    if(zona) {
        zona.cajas.push({
            id: 'caja_' + Date.now(),
            nombre: nombreCaja,
            gangs: '1 Gang',
            neutro: true,
            cableado: 'Simple',
            retornos: 1,
            cargas: [''],
            cargasDimer: ['No dimerizable']
        });
        renderizarZonas();
    }
    
    document.getElementById('modal-caja').classList.add('hidden');
    zonaActualParaCaja = null;
});

function eliminarCajaFisica(zonaId, cajaId) {
    const zona = zonas.find(z => z.id === zonaId);
    if(zona) {
        zona.cajas = zona.cajas.filter(c => c.id !== cajaId);
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
            guardarDatos();
        }
    }
}

function actualizarRetornos(zonaId, cajaId, valor) {
    const zona = zonas.find(z => z.id === zonaId);
    if (zona) {
        const caja = zona.cajas.find(c => c.id === cajaId);
        if(caja) {
            let nuevosRetornos = parseInt(valor) || 1;
            caja.retornos = nuevosRetornos;
            
            if(!caja.cargasDimer) caja.cargasDimer = []; // Fix for backwards compatibility

            while(caja.cargas.length < nuevosRetornos) {
                caja.cargas.push('');
                caja.cargasDimer.push('No dimerizable');
            }
            if(caja.cargas.length > nuevosRetornos) {
                caja.cargas = caja.cargas.slice(0, nuevosRetornos);
                caja.cargasDimer = caja.cargasDimer.slice(0, nuevosRetornos);
            }
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
    } else {
        content.classList.add('hidden');
        if(icon) icon.style.transform = 'rotate(0deg)';
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

        const matchSearch = nombre.includes(searchVal) || desc.includes(searchVal);
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
        
        let html = `
            <div class="zona-header accordion-header" style="margin-top:0; margin-bottom:0; padding:0; background:transparent; border-radius:0;" onclick="toggleAccordion('zona-content-${zona.id}')">
                <h2 style="margin:0;">${zona.nombre}</h2>
                <div style="display:flex; gap:0.5rem; align-items:center;">
                    <i class="ri-arrow-up-s-line" id="icon-zona-content-${zona.id}" style="font-size:1.5rem; color:var(--primary); transition: transform 0.3s;"></i>
                    <button class="btn-delete-zona" onclick="event.stopPropagation(); eliminarZona('${zona.id}')"><i class="ri-delete-bin-line"></i></button>
                </div>
            </div>
            
            <div class="accordion-content" id="zona-content-${zona.id}">
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
            html += `
            <div class="caja-fisica" style="padding: 0.5rem 1rem 1rem 1rem;">
                <div class="accordion-header" style="margin-top: 0; margin-bottom: 0.5rem; padding: 0.5rem 0; background: transparent; border-bottom: 1px solid rgba(255,255,255,0.1); border-radius: 0;" onclick="toggleAccordion('content-${caja.id}')">
                    <span class="caja-title" style="font-size:1rem; color:white;"><i class="ri-map-pin-line" style="margin-right:0.4rem; color:var(--primary);"></i>${caja.nombre}</span>
                    <div style="display:flex; gap:0.5rem; align-items:center;">
                        <i class="ri-arrow-up-s-line" id="icon-content-${caja.id}" style="font-size:1.5rem; color:var(--primary); transition: transform 0.3s;"></i>
                        <button class="btn-delete-caja" style="margin-left: 0.5rem;" onclick="event.stopPropagation(); eliminarCajaFisica('${zona.id}', '${caja.id}')"><i class="ri-close-line"></i></button>
                    </div>
                </div>
                
                <div class="accordion-content" id="content-${caja.id}">
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
                                <div style="font-size:0.75rem; color:var(--text-muted);">${caja.neutro ? 'Sí, listo' : 'No (Adaptar)'}</div>
                            </div>
                            <div class="toggle-switch ${caja.neutro ? 'active' : ''}" style="margin-top:0.4rem;" onclick="toggleNeutroCaja('${zona.id}', '${caja.id}')"></div>
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
                            <input type="number" class="input-control" min="1" max="10" value="${caja.retornos}" onchange="actualizarRetornos('${zona.id}', '${caja.id}', this.value)">
                        </div>
                    </div>
            `;
            
            html += `<div style="margin-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.5rem;">`;
            caja.cargas.forEach((cargaValue, idx) => {
                let currentDimer = (caja.cargasDimer && caja.cargasDimer[idx]) ? caja.cargasDimer[idx] : 'No dimerizable';
                const standardLoads = ['Sin definir', 'Spots / Empotrados', 'Cinta LED', 'Lámpara Colgante', 'Lámpara de Pared', 'Lámpara de Mesa/Pie', 'Exterior / Jardín', 'Ventilador', 'Extractor', 'Persianas / Cortinas', 'Tomacorriente Controlado', ''];
                let isCustom = !standardLoads.includes(cargaValue) || cargaValue === 'Otro';
                let selectValue = isCustom ? 'Otro' : (cargaValue || 'Sin definir');

                html += `
                    <div class="input-group" style="margin-bottom: 0.5rem; display:flex; gap:0.5rem; align-items:flex-end; flex-wrap:wrap;">
                        <div style="flex:1; min-width:140px;">
                            <label style="color:var(--primary);">Tipo de Carga ${idx + 1}</label>
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
                        <div style="flex:1; min-width:140px;">
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
            html += `</div></div></div>`; 
        });
        
        html += `
            <div class="input-group" style="margin-bottom: 1rem; margin-top:1rem;">
                <label>Otros Requerimientos (Audio, Seguridad, Red)</label>
                <input type="text" class="input-control" placeholder="Ej: Pantalla T4, Videoportero, Access Point" value="${zona.otros}" onchange="actualizarCampoTexto('${zona.id}', 'otros', this.value)">
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
                    <div class="equipo-item equipo-card-${zona.id}" data-nombre="${eq.nombre.toLowerCase()}" data-desc="${eq.desc.toLowerCase()}" data-linea="${eq.linea}" data-tipo="${eq.tipo}">
                        <div class="equipo-badge badge-${eq.linea.toLowerCase()}">${eq.linea}</div>
                        <img src="${eq.img}" alt="${eq.nombre}" class="equipo-img">
                        <div class="equipo-nombre">${eq.nombre}</div>
                        <div class="equipo-desc">${eq.desc}</div>
                        <div class="counter-controls">
                            <button class="btn-round" onclick="modificarCantidad('${zona.id}', '${eq.id}', -1)"><i class="ri-subtract-line"></i></button>
                            <div class="count-val" id="${zona.id}-${eq.id}">${zona.equipos[eq.id] || 0}</div>
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
    const saved = localStorage.getItem('c4_cotizador_data');
    if (saved) {
        try {
            zonas = JSON.parse(saved);
            // Asegurarnos de que las zonas antiguas tengan la estructura correcta si agregamos propiedades nuevas
            zonas.forEach(z => {
                if(!z.cajas) z.cajas = [];
                if(!z.equipos) z.equipos = {};
                z.cajas.forEach(c => {
                    if(!c.cargas) c.cargas = [''];
                    if(!c.cargasDimer) c.cargasDimer = ['No dimerizable'];
                });
            });
            renderizarZonas();
        } catch (e) {
            console.error('Error al parsear datos de localStorage:', e);
            crearZona('Habitación Principal');
        }
    } else {
        crearZona('Habitación Principal');
    }
}

cargarDatos();

// Exportación
btnExportar.addEventListener('click', () => {
    if (zonas.length === 0) {
        alert("Agrega al menos una zona antes de exportar.");
        return;
    }
    
    // Identificar qué equipos se usaron realmente en todo el proyecto
    let equiposUsados = [];
    TODOS_EQUIPOS.forEach(eq => {
        let totalQty = 0;
        zonas.forEach(z => { totalQty += (z.equipos[eq.id] || 0); });
        if(totalQty > 0) {
            equiposUsados.push(eq);
        }
    });

    let datosLevantamiento = [];
    zonas.forEach(z => {
        let cajasDesc = z.cajas.map((c, idx) => {
            let n = c.neutro ? "Con Neutro" : "Sin Neutro";
            let descCargas = c.cargas.map((carga, i) => {
                let dimer = (c.cargasDimer && c.cargasDimer[i]) ? c.cargasDimer[i] : 'No dimerizable';
                return `R${i+1}: ${carga || 'N/A'} (${dimer})`;
            }).join(" | ");
            return `Caja "${c.nombre}": [${c.gangs} | ${n} | ${c.cableado}] -> ${descCargas}`;
        }).join(" \\n\\n");
        
        let fila = {
            "Área / Zona": z.nombre,
            "Total Cajas Físicas": z.cajas.length,
            "Detalle de Cajas": cajasDesc,
            "Otros Reqs": z.otros,
        };

        // Generación dinámica de columnas
        equiposUsados.forEach(eq => {
            let colName = `[${eq.linea}] ${eq.nombre}`;
            fila[colName] = z.equipos[eq.id] > 0 ? z.equipos[eq.id] : '';
        });

        fila["Notas / Obs."] = z.notas;
        datosLevantamiento.push(fila);
    });

    const wb = XLSX.utils.book_new();
    const wsLev = XLSX.utils.json_to_sheet(datosLevantamiento);
    
    // Anchos de columna dinámicos
    const colWidths = [
        {wch: 25}, {wch: 15}, {wch: 80}, {wch: 20} // Columnas base
    ];
    equiposUsados.forEach(() => colWidths.push({wch: 12})); // Columnas de equipos
    colWidths.push({wch: 40}); // Notas
    
    wsLev['!cols'] = colWidths;
    XLSX.utils.book_append_sheet(wb, wsLev, "Levantamiento Total");
    XLSX.writeFile(wb, "Levantamiento_Completo_C4.xlsx");
});
