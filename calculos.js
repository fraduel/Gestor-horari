// ==========================================
// MÓDULO 2: LÓGICA MATEMÁTICA Y CÁLCULOS
// ==========================================

/**
 * Calcula la jornada real trabajada y su respectivo diferencial
 * @param {Object} reg - Objeto de registro de jornada pura
 */
function calcularTiempos(reg) {
    const horarioObjeto = HORARIOS_PREDEFINIDOS.find(h => h.id === reg.horarioId) || 
                          { descripcion: "Desconocido", horas: 0, minutos: 0 };

    const [hEntrada, mEntrada] = reg.entrada.split(':').map(Number);
    const [hSalida, mSalida] = reg.salida.split(':').map(Number);
    
    // 1. Diferencia bruta de horas de reloj
    let minutosBrutos = (hSalida * 60 + mSalida) - (hEntrada * 60 + mEntrada);
    if (minutosBrutos < 0) minutosBrutos += 24 * 60; // Mitigación de turno nocturno

    // 2. Descontar los minutos de tiempo no trabajado
    let minutosTrabajados = minutosBrutos - (reg.tiempoNoTrabajo || 0);
    if (minutosTrabajados < 0) minutosTrabajados = 0;

    // 3. Obtener el diferencial respecto al horario teórico predefinido
    const minutosTeoricos = (horarioObjeto.horas * 60) + horarioObjeto.minutos;
    const minutosDiferencial = minutosTrabajados - minutosTeoricos;

    return {
        minutosTrabajados,
        minutosDiferencial,
        horarioTexto: `${horarioObjeto.descripcion}`
    };
}

/**
 * Transforma una cantidad de minutos en una cadena legible "Xh Ym"
 * @param {number} minutosTotales - Minutos a convertir
 * @param {boolean} incluirSigno - Si debe forzar la aparición de + o -
 */
function formatearMinutos(minutosTotales, incluirSigno = false) {
    const esNegativo = minutosTotales < 0;
    const absMinutos = Math.abs(minutosTotales);
    const horas = Math.floor(absMinutos / 60);
    const minutos = absMinutos % 60;
    
    let resultado = `${horas}h ${minutos}m`;
    if (incluirSigno) {
        resultado = (esNegativo ? "-" : "+") + resultado;
    }
    return resultado;
}
