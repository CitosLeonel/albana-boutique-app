/* ============================================================
   src/views/proveedores.js
   Vista de proveedores: directorio y conteo de compras.
   ============================================================ */

async function renderProveedores() {
  const [proveedores, compras] = await Promise.all([
    fetchAll('proveedores'),
    fetchAll('compras', 'fecha'),
  ]);
  cache.proveedores = proveedores;

  const rows = proveedores.map(pv => {
    const cs = compras.filter(c => c.proveedor_id === pv.id).length;
    return `<tr>
      <td class="fw-600">${pv.nombre}</td>
      <td>${pv.telefono || '—'}</td>
      <td>${pv.email    || '—'}</td>
      <td>${pv.whatsapp || '—'}</td>
      <td>${pv.rubro    || '—'}</td>
      <td>${cs}</td>
      <td class="text-muted">${pv.notas || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteProveedor('${pv.id}')">✕</button></td>
    </tr>`;
  });

  document.getElementById('proveedoresTable').innerHTML =
    `<thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>WA/IG</th><th>Rubro</th><th>Compras</th><th>Notas</th><th></th></tr></thead>
     <tbody>${rows.length ? rows.join('') : '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">🏭</div><p>Sin proveedores</p></div></td></tr>'}</tbody>`;
}

/* ── Guardar proveedor ── */
async function saveProveedor() {
  const nombre = document.getElementById('pvNombre').value.trim();
  if (!nombre) { toast('Ingresá el nombre', 'error'); return; }

  setBtnLoading('btnSaveProveedor', true);
  try {
    await insert('proveedores', {
      nombre,
      telefono: document.getElementById('pvTel').value,
      email:    document.getElementById('pvEmail').value,
      whatsapp: document.getElementById('pvWa').value,
      rubro:    document.getElementById('pvRubro').value,
      notas:    document.getElementById('pvNotas').value,
    });
    closeModal('proveedorModal');
    toast('Proveedor guardado ✓', 'success');
    ['pvNombre', 'pvTel', 'pvEmail', 'pvWa', 'pvRubro', 'pvNotas'].forEach(id => document.getElementById(id).value = '');
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveProveedor', false);
}

/* ── Eliminar proveedor ── */
async function deleteProveedor(id) {
  if (!confirm('¿Eliminar este proveedor?')) return;
  try {
    await remove('proveedores', id);
    toast('Proveedor eliminado', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error', 'error');
  }
}
