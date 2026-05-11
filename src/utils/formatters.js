/* ============================================================
   src/utils/formatters.js
   Funciones puras de formato — sin efectos secundarios.
   ============================================================ */

/**
 * Devuelve la fecha de hoy en formato YYYY-MM-DD (timezone local).
 * @returns {string}
 */
function today() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Formatea un número como moneda argentina.
 * @param {number} n
 * @returns {string}  Ej: "$12.500"
 */
function fmt(n) {
  return '$' + Math.round(n).toLocaleString('es-AR');
}
