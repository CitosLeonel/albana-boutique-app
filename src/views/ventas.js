/* ============================================================
   src/views/ventas.js
   Vista de ventas: listado, KPIs y operaciones CRUD.
   ============================================================ */

async function renderVentas() {
  const [ventas, productos, clientes] = await Promise.all([
    fetchAll('ventas',   'fecha'),
    fetchAll('productos'),
    fetchAll('clientes'),
  ]);
  cache.productos = productos;
  cache.clientes  = clientes;

  // ── KPIs ──
  const total = ventas.reduce((a, v) => a + v.cant * v.precio, 0);
  const mes   = today().substring(0, 7);
  const esteM = ventas
    .filter(v => v.fecha?.startsWith(mes))
    .reduce((a, v) => a + v.cant * v.precio, 0);

  document.getElementById('ventasStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-label">Total vendido</div><div class="stat-value">${fmt(total)}</div></div>
    <div class="stat-card"><div class="stat-icon">📅</div><div class="stat-label">Este mes</div><div class="stat-value">${fmt(esteM)}</div></div>
    <div class="stat-card"><div class="stat-icon">🧾</div><div class="stat-label">Nº ventas</div><div class="stat-value">${ventas.length}</div></div>`;

  // ── Tabla ──
  const rows = ventas.map(v => {
    const p  = productos.find(x => x.id === v.producto_id);
    const cl = v.cliente_id ? clientes.find(x => x.id === v.cliente_id) : null;
    return `<tr>
      <td>${v.fecha}</td>
      <td>${p ? p.nombre : '—'}</td>
      <td>${cl ? cl.nombre : '<span class="text-muted">Mostrador</span>'}</td>
      <td>${v.cant}</td>
      <td class="fw-600 color-sage">${fmt(v.cant * v.precio)}</td>
      <td>${v.pago}</td>
      <td class="text-muted">${v.vendedor || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteVenta('${v.id}')">✕</button></td>
    </tr>`;
  });

  document.getElementById('ventasTable').innerHTML =
    `<thead><tr>
      <th>Fecha</th><th>Producto</th><th>Cliente</th>
      <th>Cant</th><th>Total</th><th>Pago</th><th>Vendedor</th><th></th>
    </tr></thead>
    <tbody>${rows.length ? rows.join('') : '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">💰</div><p>Sin ventas registradas</p></div></td></tr>'}</tbody>`;
}

/* ── Guardar venta ── */
async function saveVenta() {
  const pId    = document.getElementById('vProducto').value;
  const cant   = parseInt(document.getElementById('vCantidad').value)  || 0;
  const precio = parseFloat(document.getElementById('vPrecio').value)  || 0;

  if (!pId || !cant || !precio) { toast('Completá todos los campos', 'error'); return; }

  const prod = cache.productos.find(p => p.id === pId);
  if (!prod || prod.stock < cant) { toast('Stock insuficiente', 'error'); return; }

  setBtnLoading('btnSaveVenta', true);
  try {
    const clId = document.getElementById('vCliente').value || null;
    await insert('ventas', {
      fecha:       today(),
      cliente_id:  clId,
      producto_id: pId,
      cant,
      precio,
      pago:    document.getElementById('vPago').value,
      notas:   document.getElementById('vNotas').value,
      vendedor: currentUser.name,
    });
    await update('productos', pId, { stock: prod.stock - cant });
    await insert('caja', {
      fecha:       today(),
      tipo:        'ingreso',
      descripcion: `Venta: ${prod.nombre}`,
      monto:       cant * precio,
      categoria:   'Ventas',
    });
    closeModal('ventaModal');
    toast('Venta registrada ✓', 'success');
    document.getElementById('vNotas').value = '';
    await renderView(currentView);
  } catch (e) {
    toast('Error al guardar: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveVenta', false);
}

/* ── Eliminar venta ── */
async function deleteVenta(id) {
  if (!confirm('¿Eliminar esta venta?')) return;
  try {
    await remove('ventas', id);
    toast('Venta eliminada', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error', 'error');
  }
}
