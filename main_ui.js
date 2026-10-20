// ==========================================
// MÓDULO 3A: CONTROL DE INTERFAZ DE USUARIO (UI)
// ==========================================

// Elementos capturados del DOM
const modal = document.getElementById('modal-registro');
const formRegistro = document.getElementById('form-registro');
const selectHorarios = document.getElementById('horario-predefinido');
const tablaBody = document.querySelector('#tabla-registros tbody');
const modalTitulo = modal.querySelector('h2');

const selectMes = document.getElementById('select-mes');
const selectAnio = document.getElementById('select-anio');
const btnMesAnterior = document.getElementById('btn-mes-anterior');
const btnMesSiguiente = document.getElementById('btn-mes-siguiente');

// --- INICIALIZACIÓN DE SELECTORES SUPERIORES ---
function inicializarControlesPeriodo() {
    selectMes.innerHTML = "";
    NOMBRES_MESES.forEach((nombre, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = nombre;
        selectMes.appendChild(opt);
    });
    
    selectAnio.innerHTML = "";
    for (let a = anioActual - 5; a <= anioActual + 5; a++) {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        selectAnio.appendChild(opt);
    }

    selectMes.value = mesActual;
    selectAnio.value = anioActual;

    selectMes.addEventListener('change', () => { mesActual = parseInt(selectMes.value, 10); cargarPeriodo(); });
    selectAnio.addEventListener('change', () => { anioActual = parseInt(selectAnio.value, 10); cargarPeriodo(); });
    
    btnMesAnterior.addEventListener('click', () => cambiarMes(-1));
    btnMesSiguiente.addEventListener('click', () => cambiarMes(1));
}

function inicializarHorarios() {
    selectHorarios.innerHTML = "";
    HORARIOS_PREDEFINIDOS.forEach(h => {
        const option = document.createElement('option');
        option.value = h.id;
        option.textContent = `${h.descripcion} (${h.horas}h ${h.minutos}m)`;
        selectHorarios.appendChild(option);
    });
}


// --- NAVEGACIÓN Y FILTRADO POR MES ---
function cambiarMes(direccion) {
    mesActual += direccion;
    if (mesActual < 0) {
        mesActual = 11;
        anioActual--;
    } else if (mesActual > 11) {
        mesActual = 0;
        anioActual++;
    }
    selectMes.value = mesActual;
    selectAnio.value = anioActual;
    cargarPeriodo();
}

function cargarPeriodo() {
    registrosFiltrados = listaRegistros.filter(reg => {
        const [regAnio, regMes] = reg.fecha.split('-').map(Number);
        return regAnio === anioActual && (regMes - 1) === mesActual;
    });
    indiceSeleccionado = -1;
    // La función de renderizado se encuentra en el siguiente módulo (main_core.js)
    if (typeof actualizarTablaPantalla === 'function') {
        actualizarTablaPantalla();
    }
}

// --- CONTROL DEL FORMULARIO MODAL FLOTANTE ---
document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
modal.addEventListener('click', (e) => { if(e.target === modal) cerrarModal(); });

function abrirModal() {
    const inputFecha = document.getElementById('fecha');

    if (indiceEdicion === -1) {
        modalTitulo.textContent = "Nuevo Registro de Jornada";
        const d = new Date();
        const diaHoy = d.getDate().toString().padStart(2, '0');
        const mesFormato = (mesActual + 1).toString().padStart(2, '0');
        inputFecha.value = `${anioActual}-${mesFormato}-${diaHoy}`;
        
        document.getElementById('hora-entrada').value = "09:00";
        document.getElementById('hora-salida').value = "18:00";
        document.getElementById('tiempo-no-trabajo').value = "0"; 
        selectHorarios.selectedIndex = 0;
        document.getElementById('descripcion').value = "";
    } else {
        modalTitulo.textContent = "Editar Registro de Jornada";
        const reg = listaRegistros[indiceEdicion];
        inputFecha.value = reg.fecha;
        document.getElementById('hora-entrada').value = reg.entrada;
        document.getElementById('hora-salida').value = reg.salida;
        document.getElementById('tiempo-no-trabajo').value = reg.tiempoNoTrabajo || 0;
        selectHorarios.value = reg.horarioId;
        document.getElementById('descripcion').value = reg.descripcion;
    }
    
    modal.style.display = 'flex';

    // SOLUCIÓN PARTE 1: Forzar el foco de inmediato en el primer campo al abrir
    setTimeout(() => {
        inputFecha.focus();
    }, 50);
}

function cerrarModal() { modal.style.display = 'none'; }

// SOLUCIÓN PARTE 2: Bucle de enfoque dinámico para mantener el Tabulador atrapado en el modal
modal.addEventListener('keydown', function(e) {
    if (e.key !== 'Tab') return;

    // Capturamos todos los elementos interactivos que tiene tu modal
    const elementosInteractivos = modal.querySelectorAll('input, select, textarea, button, .btn');
    const primerElemento = elementosInteractivos[0];
    const ultimoElemento = elementosInteractivos[elementosInteractivos.length - 1];

    // Si el usuario presiona Shift + Tab (retroceder)
    if (e.shiftKey) {
        if (document.activeElement === primerElemento) {
            ultimoElemento.focus();
            e.preventDefault();
        }
    } 
    // Si el usuario presiona Tab solo (avanzar)
    else {
        if (document.activeElement === ultimoElemento) {
            primerElemento.focus();
            e.preventDefault();
        }
    }
});
