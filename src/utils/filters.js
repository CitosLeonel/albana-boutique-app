/* ============================================================
   src/utils/filters.js
   Funciones de filtrado sobre tablas y listas del DOM.
   ============================================================ */

/**
 * Filtra las filas de una tabla según el texto ingresado.
 * @param {HTMLInputElement} input
 * @param {string}           tableId  - id del elemento <table>
 */
function filterTable(input, tableId) {
  const q = input.value.toLowerCase();
  document
    .querySelectorAll('#' + tableId + ' tbody tr')
    .forEach(tr => {
      tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

/**
 * Aplica el filtro de tipo (ingreso / egreso) en la vista Caja
 * y re-renderiza la tabla.
 * @param {string} value  - '' | 'ingreso' | 'egreso'
 */
function filterCaja(value) {
  cajaFilter = value;
  renderCaja();
}
