// ==========================================
// MÓDULO 1: CONFIGURACIÓN Y ESTADO GLOBAL
// ==========================================

// Horarios por defecto si no existen en el fichero ni en localStorage
const HORARIOS_POR_DEFECTO = [
    { id: "horario_continuado", descripcion: "Horario Continuado", horas: 7, minutos: 30 },
    { id: "horario_partido", descripcion: "Horario Partido", horas: 8, minutos: 30 },
    { id: "turno_abierto_1", descripcion: "Turno abierto Mañana", horas: 7, minutos: 30 },
    { id: "turno_abierto_2", descripcion: "Turno abierto Tarde", horas: 7, minutos: 30 }
];

// Array dinámico de horarios activos
let HORARIOS_PREDEFINIDOS = [...HORARIOS_POR_DEFECTO];

// Nombres de los meses para el selector superior
const NOMBRES_MESES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Variables de estado de la aplicación
let listaRegistros = [];

// Intentar cargar estado global (registros y horarios) desde localStorage
try {
    const datosLocales = localStorage.getItem('control_tiempo_registros');
    if (datosLocales) {
        const estadoCargado = JSON.parse(datosLocales);
        
        // Estructura nueva (Objeto con horarios y registros)
        if (estadoCargado && typeof estadoCargado === 'object' && !Array.isArray(estadoCargado)) {
            listaRegistros = estadoCargado.registros || [];
            if (estadoCargado.horarios && Array.isArray(estadoCargado.horarios) && estadoCargado.horarios.length > 0) {
                HORARIOS_PREDEFINIDOS = estadoCargado.horarios;
            }
        } 
        // Estructura antigua (Array simple de registros)
        else if (Array.isArray(estadoCargado)) {
            listaRegistros = estadoCargado;
        }
    }
} catch (e) {
    console.error("Error al cargar datos desde localStorage:", e);
}

let registrosFiltrados = [];  // Jornadas visibles del mes activo
let indiceSeleccionado = -1;  // Renglón seleccionado
let indiceEdicion = -1;       // Índice del array global al modificar (-1 = Crear)

// Inicialización del periodo
const fechaActual = new Date();
let mesActual = fechaActual.getMonth();
let anioActual = fechaActual.getFullYear();
