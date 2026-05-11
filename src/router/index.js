/* ============================================================
   src/router/index.js
   Router simple basado en el nombre de la vista.
   Activa la vista correcta, marca el nav-item y llama al
   render correspondiente.
   ============================================================ */

/**
 * Navega a una vista por nombre.
 * @param {string} v  - Nombre de la vista (ej: 'dashboard', 'ventas')
 */
function nav(v) {
  currentView = v;

  // Activar vista
  document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
  document.getElementById('view-' + v).classList.add('active');

  // Marcar nav-item activo
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle(
      'active',
      el.getAttribute('onclick')?.includes(`'${v}'`) ?? false
    );
  });

  closeSidebar();
  renderView(v);
}

/**
 * Dispatcher: llama al render de la vista correspondiente.
 * @param {string} v
 */
async function renderView(v) {
  if      (v === 'dashboard')  await renderDashboard();
  else if (v === 'ventas')     await renderVentas();
  else if (v === 'compras')    await renderCompras();
  else if (v === 'stock')      await renderStock();
  else if (v === 'caja')       await renderCaja();
  else if (v === 'clientes')   await renderClientes();
  else if (v === 'proveedores') await renderProveedores();
  else if (v === 'usuarios')   await renderUsuarios();
}
