// ==========================================
// MÓDULO 3B: OPERACIONES NATIVAS, TECLADO Y ARCHIVOS (PARTE 1)
// ==========================================

// --- CAPTURA DE TECLADO GENERAL ---
document.addEventListener('keydown', function(evento) {
    if (modal.style.display === 'flex') return;

    if (evento.key === 'F1') {
        evento.preventDefault();
        indiceEdicion = -1;
        abrirModal();
    }
    if (evento.key === 'F2') {
        evento.preventDefault();
        iniciarEdicion();
    }
    if (evento.key === 'F3') {
        evento.preventDefault();
        borrarRegistroSeleccionado();
    }
    if (evento.key === 'F5') {
        evento.preventDefault();
        guardarFicheroTXT();
    }
    if (evento.key === 'F6') {
        evento.preventDefault();
        cargarFicheroTXT();
    }
    if (evento.key === 'ArrowDown') {
        evento.preventDefault();
        cambiarSeleccionFila(1);
    }
    if (evento.key === 'ArrowUp') {
        evento.preventDefault();
        cambiarSeleccionFila(-1);
    }
    if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        cambiarMes(-1);
    }
    if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        cambiarMes(1);
    }
});

function cambiarSeleccionFila(direccion) {
    if (registrosFiltrados.length === 0) return;

    if (indiceSeleccionado === -1) {
        indiceSeleccionado = direccion === 1 ? 0 : registrosFiltrados.length - 1;
    } else {
        indiceSeleccionado += direccion;
        if (indiceSeleccionado < 0) indiceSeleccionado = 0;
        if (indiceSeleccionado >= registrosFiltrados.length) indiceSeleccionado = registrosFiltrados.length - 1;
    }
    actualizarTablaPantalla();
}

function iniciarEdicion() {
    if (indiceSeleccionado === -1) {
        alert("Por favor, selecciona primero un registro de la tabla para editar.");
        return;
    }
    const registroAEditar = registrosFiltrados[indiceSeleccionado];
    indiceEdicion = listaRegistros.findIndex(r => r === registroAEditar);
    abrirModal();
}

function borrarRegistroSeleccionado() {
    if (indiceSeleccionado === -1) {
        alert("Por favor, selecciona primero un registro para borrar.");
        return;
    }

    const registroABorrar = registrosFiltrados[indiceSeleccionado];
    const fechaFormateada = registroABorrar.fecha.split('-').reverse().join('/');
    
    if (confirm(`¿Estás seguro de que deseas eliminar el registro del día ${fechaFormateada}?`)) {
        const indiceReal = listaRegistros.findIndex(r => r === registroABorrar);
        listaRegistros.splice(indiceReal, 1);

        // Guardar automáticamente al eliminar
        guardarEnLocalStorage(); 

        cargarPeriodo();
    }
}

// --- ACCIÓN DE GUARDADO DEL FORMULARIO ---
formRegistro.addEventListener('submit', function(e) {
    e.preventDefault();

        const datosRegistro = {
        fecha: document.getElementById('fecha').value,
        entrada: document.getElementById('hora-entrada').value,
        salida: document.getElementById('hora-salida').value,
        tiempoCorreccion: parseInt(document.getElementById('tiempo-correccion').value, 10) || 0,
        horarioId: selectHorarios.value,
        descripcion: document.getElementById('descripcion').value
    };


    if (indiceEdicion === -1) {
        listaRegistros.push(datosRegistro);
    } else {
        listaRegistros[indiceEdicion] = datosRegistro;
    }

    listaRegistros.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const [targetAnio, targetMes] = datosRegistro.fecha.split('-').map(Number);
    mesActual = targetMes - 1;
    anioActual = targetAnio;
    selectMes.value = mesActual;
    selectAnio.value = anioActual;

    cargarPeriodo();
    
    indiceSeleccionado = registrosFiltrados.findIndex(r => r.fecha === datosRegistro.fecha);
    actualizarTablaPantalla();

    // Guardar automáticamente al añadir o editar
    guardarEnLocalStorage(); 	

    cerrarModal();
});

// ==========================================
// MÓDULO 3B: OPERACIONES NATIVAS, TECLADO Y ARCHIVOS (PARTE 2)
// ==========================================

// --- RENDERIZADO VISUAL DE LA TABLA Y TOTALES ---
function actualizarTablaPantalla() {
    tablaBody.innerHTML = ""; 
    const tablaFoot = document.querySelector('#tabla-registros tfoot');
    tablaFoot.innerHTML = ""; 

    let acumuladoCorreccion = 0;
    let acumuladoTrabajado = 0;
    let acumuladoDiferencial = 0;

    registrosFiltrados.forEach((reg, index) => {
        const calculos = calcularTiempos(reg);
        const fila = document.createElement('tr');
        
        // Obtener corrección (con compatibilidad para registros viejos)
        const correccionActual = reg.tiempoCorreccion !== undefined 
            ? reg.tiempoCorreccion 
            : -(reg.tiempoNoTrabajo || 0);

        acumuladoCorreccion += correccionActual;
        acumuladoTrabajado += calculos.minutosTrabajados;
        acumuladoDiferencial += calculos.minutosDiferencial;

        if (index === indiceSeleccionado) fila.classList.add('seleccionada');

        fila.addEventListener('click', () => {
            document.querySelectorAll('#tabla-registros tbody tr').forEach(tr => tr.classList.remove('seleccionada'));
            fila.classList.add('seleccionada');
            indiceSeleccionado = index;
        });

                // Obtener el día de la semana en texto
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        const [anio, mes, dia] = reg.fecha.split('-').map(Number);
        const fechaObj = new Date(anio, mes - 1, dia); // Se crea en hora local para evitar desfases de zona horaria
        const nombreDia = diasSemana[fechaObj.getDay()];

        const fechaFormateada = `${nombreDia}, ${reg.fecha.split('-').reverse().join('/')}`;


        let celdaTrabajado = formatearMinutos(calculos.minutosTrabajados);
        let celdaDiferencial = formatearMinutos(calculos.minutosDiferencial, true);
        let claseClave = calculos.minutosDiferencial >= 0 ? "positivo" : "negativo";

        if (calculos.esExtraordinaria) {
            celdaTrabajado = `${formatearMinutos(calculos.minutosRealesExtras)} (Extras)`;
            celdaDiferencial = "Ø";
            claseClave = "nota-celda";
        } else if (calculos.esCorreccion) {
            celdaTrabajado = "0h 0m (Corrección)";
            // celdaDiferencial ya muestra "+Xh Ym" o "-Xh Ym" y claseClave aplica verde o rojo
        }



        // Formatear visualmente el signo + si es mayor que 0
        const textoCorreccion = correccionActual > 0 ? `+${correccionActual} m` : `${correccionActual} m`;

        fila.innerHTML = `
            <td>${fechaFormateada}</td>
            <td>${reg.entrada}</td>
            <td>${reg.salida}</td>
            <td>${textoCorreccion}</td>
            <td>${celdaTrabajado}</td>
            <td>${calculos.horarioTexto}</td>
            <td class="${claseClave}">${celdaDiferencial}</td>
            <td class="nota-celda">${reg.descripcion || '-'}</td>
        `;
        tablaBody.appendChild(fila);
    });

    // 1. FILA DE TOTALES DEL MES
    if (registrosFiltrados.length > 0) {
        const filaTotales = document.createElement('tr');
        const claseTotalDiferencial = acumuladoDiferencial >= 0 ? "positivo" : "negativo";
        const textoAcumuladoCorreccion = acumuladoCorreccion > 0 ? `+${acumuladoCorreccion} m` : `${acumuladoCorreccion} m`;

        filaTotales.innerHTML = `
            <td colspan="3" class="titulo-total">TOTALES DEL MES:</td>
            <td>${textoAcumuladoCorreccion}</td>
            <td>${formatearMinutos(acumuladoTrabajado)}</td>
            <td>-</td>
            <td class="${claseTotalDiferencial}">${formatearMinutos(acumuladoDiferencial, true)}</td>
            <td>Jornadas en el mes: ${registrosFiltrados.length}</td>
        `;
        tablaFoot.appendChild(filaTotales);
    }

    // 2. FILA DE TOTAL ACUMULADO HISTÓRICO (se mantiene igual)
    if (listaRegistros.length > 0) {
        let totalGlobalDiferencial = 0;

        listaRegistros.forEach(reg => {
            const calculosGlobales = calcularTiempos(reg);
            totalGlobalDiferencial += calculosGlobales.minutosDiferencial;
        });

        const filaTotalAcumulado = document.createElement('tr');
        const claseGlobalDiferencial = totalGlobalDiferencial >= 0 ? "positivo" : "negativo";
        filaTotalAcumulado.classList.add('fila-acumulado-historico');

        filaTotalAcumulado.innerHTML = `
            <td colspan="3" class="titulo-total" style="color: #ff9900;">TOTAL ACUMULADO:</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td class="${claseGlobalDiferencial}">${formatearMinutos(totalGlobalDiferencial, true)}</td>
            <td>Total jornadas: ${listaRegistros.length}</td>
        `;
        tablaFoot.appendChild(filaTotalAcumulado);
    }
}

// --- FUNCIÓN AUXILIAR PARA PERSISTENCIA AUTOMÁTICA EN LOCALSTORAGE ---
function guardarEnLocalStorage() {
    try {
        const datosAGuardar = {
            horarios: HORARIOS_PREDEFINIDOS,
            registros: listaRegistros
        };
        localStorage.setItem('control_tiempo_registros', JSON.stringify(datosAGuardar));
    } catch (error) {
        console.error("No se pudo guardar en el almacenamiento local:", error);
    }
}

// --- OPERACIONES DE FICHEROS NATIVAS (COMPATIBLE CON CHROME, EDGE, FIREFOX, SAFARI) ---
async function guardarFicheroTXT() {
    if (listaRegistros.length === 0 && HORARIOS_PREDEFINIDOS.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const objetoExportacion = {
        horarios: HORARIOS_PREDEFINIDOS,
        registros: listaRegistros
    };

    const contenidoTexto = JSON.stringify(objetoExportacion, null, 2);

    // 1. Navegadores con File System Access API (Chrome, Edge, Opera)
    if ('showSaveFilePicker' in window) {
        try {
            const opciones = {
                suggestedName: `control_tiempo.txt`,
                types: [{
                    description: 'Fichero de Control de Tiempo (.txt)',
                    accept: {'text/plain': ['.txt']},
                }],
            };
            const handle = await window.showSaveFilePicker(opciones);
            const writable = await handle.createWritable();
            await writable.write(contenidoTexto);
            await writable.close();
            alert("Registros y horarios guardados con éxito.");
            return;
        } catch (error) { 
            // Si el usuario pulsa "Cancelar" en la ventana, detenemos aquí para no forzar descarga
            if (error.name === 'AbortError') return;
            console.log("Guardado nativo no permitido, usando descarga estándar:", error); 
        }
    } 

    // 2. Fallback universal (Firefox, Safari y móviles)
    const blob = new Blob([contenidoTexto], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = `control_tiempo.txt`;
    enlace.click();
    URL.revokeObjectURL(url);
    alert("Registros y horarios descargados con éxito.");
}

async function cargarFicheroTXT() {
    // 1. Navegadores con File System Access API (Chrome, Edge, Opera)
    if ('showOpenFilePicker' in window) {
        try {
            const opciones = {
                types: [{
                    description: 'Fichero de Control de Tiempo (.txt)',
                    accept: {'text/plain': ['.txt']},
                }],
                multiple: false
            };

            const [handle] = await window.showOpenFilePicker(opciones);
            const file = await handle.getFile();
            const textoCargado = await file.text();
            
            procesarEInyectarDatos(textoCargado);
            return;
        } catch (error) { 
            if (error.name === 'AbortError') return;
            console.log("Lectura nativa no disponible, usando selector estándar:", error); 
        }
    } 

    // 2. Fallback universal (Firefox, Safari y móviles)
    const inputOculto = document.createElement('input');
    inputOculto.type = 'file';
    inputOculto.accept = '.txt,.json';
    inputOculto.onchange = evento => {
        const archivo = evento.target.files[0];
        if (!archivo) return;

        const lector = new FileReader();
        lector.onload = eLector => procesarEInyectarDatos(eLector.target.result);
        lector.readAsText(archivo);
    };
    inputOculto.click();
}

function procesarEInyectarDatos(textoEstructurado) {
    try {
        const datosDecodificados = JSON.parse(textoEstructurado);
        
        // Caso 1: Formato nuevo (Objeto con horarios y registros)
        if (datosDecodificados && typeof datosDecodificados === 'object' && !Array.isArray(datosDecodificados)) {
            listaRegistros = datosDecodificados.registros || [];
            
            if (datosDecodificados.horarios && Array.isArray(datosDecodificados.horarios) && datosDecodificados.horarios.length > 0) {
                // Filtramos el antiguo horario_descanso si existía en el fichero
                HORARIOS_PREDEFINIDOS = datosDecodificados.horarios.filter(h => h.id !== "horario_descanso");
                
                // Asegurar que nuevos horarios como "horario_correccion" existan
                HORARIOS_POR_DEFECTO.forEach(horarioBase => {
                    if (!HORARIOS_PREDEFINIDOS.some(h => h.id === horarioBase.id)) {
                        HORARIOS_PREDEFINIDOS.push(horarioBase);
                    }
                });
            } else {
                HORARIOS_PREDEFINIDOS = [...HORARIOS_POR_DEFECTO];
            }
        } 
        // Caso 2: Formato antiguo (Array simple solo con registros)
        else if (Array.isArray(datosDecodificados)) {
            listaRegistros = datosDecodificados;
            HORARIOS_PREDEFINIDOS = [...HORARIOS_POR_DEFECTO];
        } else { 
            throw new Error(); 
        }

        if (typeof inicializarHorarios === 'function') inicializarHorarios();
        guardarEnLocalStorage(); 
        cargarPeriodo();
        alert(`Se cargaron ${listaRegistros.length} registros exitosamente.`);
    } catch (err) {
        alert("Error: El archivo seleccionado no tiene un formato válido para esta aplicación.");
    }
}


// ========================================================
// --- ARRANQUE E INICIALIZACIÓN GENERAL DE LA APLICACIÓN ---
// ========================================================
if (typeof inicializarControlesPeriodo === 'function') {
    inicializarControlesPeriodo();
}
if (typeof inicializarHorarios === 'function') {
    inicializarHorarios();
}
if (typeof cargarPeriodo === 'function') {
    cargarPeriodo();
}
