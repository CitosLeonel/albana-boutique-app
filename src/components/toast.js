/* ============================================================
   src/components/toast.js
   Notificaciones temporales tipo "snackbar".
   ============================================================ */

/**
 * Muestra un toast por 3.2 segundos.
 * @param {string} msg
 * @param {'success'|'error'} type
 */
function toast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = (type === 'success' ? '✓ ' : '✕ ') + msg;
  t.className   = 'toast ' + type + ' show';
  setTimeout(() => t.classList.remove('show'), 3200);
}

/**
 * Habilita / deshabilita un botón y baja su opacidad
 * para indicar que una operación está en curso.
 * @param {string}  id
 * @param {boolean} loading
 */
function setBtnLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled      = loading;
  btn.style.opacity = loading ? '.6' : '1';
}
