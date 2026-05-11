/* ============================================================
   src/views/dashboard.js
   Vista principal con KPIs del mes, últimas ventas y
   productos con stock crítico.
   ============================================================ */

async function renderDashboard() {
  const mes = today().substring(0, 7);
  const [ventas, compras, caja, productos] = await Promise.all([
    fetchAll('ventas',   'fecha'),
    fetchAll('compras',  'fecha'),
    fetchAll('caja',     'fecha'),
    fetchAll('productos'),
  ]);
  cache.productos = productos;

  // ── KPIs ──
  const vMes     = ventas.filter(v => v.fecha?.startsWith(mes));
  const tVentas  = vMes.reduce((a, v) => a + (v.cant * v.precio), 0);
  const tCompras = compras.filter(c => c.fecha?.startsWith(mes)).reduce((a, c) => a + (c.cant * c.costo), 0);
  const saldo    = caja.reduce((a, m) => m.tipo === 'ingreso' ? a + m.monto : a - m.monto, 0);
  const criticos = productos.filter(p => p.stock <= p.stock_min).length;

  document.getElementById('dashStats').innerHTML = `
    <div class="stat-card">
      <div class="stat-icon">💰</div>
      <div class="stat-label">Ventas del mes</div>
      <div class="stat-value">${fmt(tVentas)}</div>
      <div class="stat-sub">${vMes.length} transacciones</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">🛒</div>
      <div class="stat-label">Compras del mes</div>
      <div class="stat-value">${fmt(tCompras)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">💳</div>
      <div class="stat-label">Saldo Caja</div>
      <div class="stat-value" style="color:${saldo >= 0 ? 'var(--sage)' : 'var(--rose)'}">${fmt(saldo)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon">⚠️</div>
      <div class="stat-label">Stock crítico</div>
      <div class="stat-value" style="color:${criticos > 0 ? 'var(--rose)' : 'var(--sage)'}">${criticos}</div>
    </div>`;

  // ── Últimas ventas ──
  const ultiV = [...ventas].sort((a, b) => b.fecha?.localeCompare(a.fecha)).slice(0, 5);
  document.getElementById('dashVentasTable').innerHTML =
    `<thead><tr><th>Fecha</th><th>Producto</th><th>Total</th><th>Pago</th></tr></thead>
     <tbody>${ultiV.length
       ? ultiV.map(v => {
           const p = productos.find(x => x.id === v.producto_id);
           return `<tr>
             <td>${v.fecha}</td>
             <td>${p ? p.nombre : '—'}</td>
             <td class="fw-600 color-sage">${fmt(v.cant * v.precio)}</td>
             <td>${v.pago}</td>
           </tr>`;
         }).join('')
       : '<tr><td colspan="4" class="text-muted" style="text-align:center;padding:16px">Sin ventas</td></tr>'
     }</tbody>`;

  // ── Stock crítico ──
  const crits = productos.filter(p => p.stock <= p.stock_min).slice(0, 6);
  document.getElementById('dashStockTable').innerHTML =
    `<thead><tr><th>Producto</th><th>Stock</th><th>Estado</th></tr></thead>
     <tbody>${crits.length
       ? crits.map(p => `<tr>
           <td>${p.nombre}</td>
           <td>${p.stock}</td>
           <td>${p.stock === 0
             ? '<span class="badge badge-red">Sin stock</span>'
             : '<span class="badge badge-yellow">Bajo</span>'}</td>
         </tr>`).join('')
       : '<tr><td colspan="3" class="text-muted" style="text-align:center;padding:16px">✓ Stock OK</td></tr>'
     }</tbody>`;

  document.getElementById('dashGrid').style.gridTemplateColumns =
    window.innerWidth < 700 ? '1fr' : '1fr 1fr';
}
