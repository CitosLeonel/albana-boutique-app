/* ============================================================
   src/views/compras.js
   Vista de compras / ingreso de mercadería.
   ============================================================ */

async function renderCompras() {
  const [compras, productos, proveedores] = await Promise.all([
    fetchAll('compras',    'fecha'),
    fetchAll('productos'),
    fetchAll('proveedores'),
  ]);
  cache.productos   = productos;
  cache.proveedores = proveedores;

  // ── KPIs ──
  const total = compras.reduce((a, c) => a + c.cant * c.costo, 0);
  document.getElementById('comprasStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon">🛒</div><div class="stat-label">Total invertido</div><div class="stat-value">${fmt(total)}</div></div>
    <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-label">Órdenes</div><div class="stat-value">${compras.length}</div></div>`;

  // ── Tabla ──
  const rows = compras.map(c => {
    const p  = productos.find(x => x.id === c.producto_id);
    const pv = c.proveedor_id ? proveedores.find(x => x.id === c.proveedor_id) : null;
    return `<tr>
      <td>${c.fecha}</td>
      <td>${p ? p.nombre : '—'}</td>
      <td>${pv ? pv.nombre : '<span class="text-muted">—</span>'}</td>
      <td>${c.cant}</td>
      <td class="fw-600 color-rose">${fmt(c.cant * c.costo)}</td>
      <td class="text-muted">${c.notas || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteCompra('${c.id}')">✕</button></td>
    </tr>`;
  });

  document.getElementById('comprasTable').innerHTML =
    `<thead><tr><th>Fecha</th><th>Producto</th><th>Proveedor</th><th>Cant</th><th>Total</th><th>Notas</th><th></th></tr></thead>
     <tbody>${rows.length ? rows.join('') : '<tr><td colspan="7"><div class="empty-state"><div class="empty-icon">🛒</div><p>Sin compras</p></div></td></tr>'}</tbody>`;
}

/* ── Guardar compra ── */
async function saveCompra() {
  const cant  = parseInt(document.getElementById('cCantidad').value)  || 0;
  const costo = parseFloat(document.getElementById('cCosto').value)   || 0;
  if (!cant || !costo) { toast('Completá cantidad y costo', 'error'); return; }

  setBtnLoading('btnSaveCompra', true);
  try {
    let prodId;
    const sel = document.getElementById('cProducto').value;

    if (sel === '__nuevo__') {
      // Crear producto nuevo
      const nombre = document.getElementById('cNombreProd').value.trim();
      if (!nombre) { toast('Ingresá el nombre del producto', 'error'); setBtnLoading('btnSaveCompra', false); return; }
      const np = await insert('productos', {
        nombre,
        categoria:  document.getElementById('cCategoria').value,
        stock:      cant,
        costo,
        precio:     parseFloat(document.getElementById('cPrecioVenta').value) || costo * 2,
        stock_min:  3,
      });
      prodId = np.id;
    } else {
      // Sumar stock a producto existente
      prodId    = sel;
      const p   = cache.productos.find(x => x.id === prodId);
      const pv  = parseFloat(document.getElementById('cPrecioVenta').value);
      await update('productos', prodId, {
        stock: (p?.stock || 0) + cant,
        costo,
        ...(pv ? { precio: pv } : {}),
      });
    }

    const provId = document.getElementById('cProveedor').value || null;
    const prod   = cache.productos.find(p => p.id === prodId) || { nombre: document.getElementById('cNombreProd').value };

    await insert('compras', {
      fecha:        document.getElementById('cFecha').value || today(),
      proveedor_id: provId,
      producto_id:  prodId,
      cant,
      costo,
      notas:        document.getElementById('cNotas').value,
    });
    await insert('caja', {
      fecha:       today(),
      tipo:        'egreso',
      descripcion: `Compra: ${prod.nombre}`,
      monto:       cant * costo,
      categoria:   'Compras / Stock',
    });

    closeModal('compraModal');
    toast('Compra registrada ✓', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveCompra', false);
}

/* ── Eliminar compra ── */
async function deleteCompra(id) {
  if (!confirm('¿Eliminar esta compra?')) return;
  try {
    await remove('compras', id);
    toast('Compra eliminada', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error', 'error');
  }
}
