/* ============================================================
   src/views/clientes.js
   Vista de clientes: directorio con historial de compras.
   ============================================================ */

async function renderClientes() {
  const [clientes, ventas] = await Promise.all([
    fetchAll('clientes'),
    fetchAll('ventas', 'fecha'),
  ]);
  cache.clientes = clientes;

  const rows = clientes.map(cl => {
    const compras = ventas.filter(v => v.cliente_id === cl.id).length;
    const total   = ventas.filter(v => v.cliente_id === cl.id).reduce((a, v) => a + v.cant * v.precio, 0);
    return `<tr>
      <td class="fw-600">${cl.nombre}</td>
      <td>${cl.telefono  || '—'}</td>
      <td>${cl.email     || '—'}</td>
      <td>${cl.instagram || '—'}</td>
      <td>${compras}</td>
      <td class="fw-600 color-sage">${fmt(total)}</td>
      <td class="text-muted">${cl.notas || '—'}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteCliente('${cl.id}')">✕</button></td>
    </tr>`;
  });

  document.getElementById('clientesTable').innerHTML =
    `<thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Instagram</th><th>Compras</th><th>Total</th><th>Notas</th><th></th></tr></thead>
     <tbody>${rows.length ? rows.join('') : '<tr><td colspan="8"><div class="empty-state"><div class="empty-icon">👥</div><p>Sin clientes</p></div></td></tr>'}</tbody>`;
}

/* ── Guardar cliente ── */
async function saveCliente() {
  const nombre = document.getElementById('clNombre').value.trim();
  if (!nombre) { toast('Ingresá el nombre', 'error'); return; }

  setBtnLoading('btnSaveCliente', true);
  try {
    await insert('clientes', {
      nombre,
      telefono:  document.getElementById('clTel').value,
      email:     document.getElementById('clEmail').value,
      instagram: document.getElementById('clInsta').value,
      notas:     document.getElementById('clNotas').value,
    });
    closeModal('clienteModal');
    toast('Cliente guardado ✓', 'success');
    ['clNombre', 'clTel', 'clEmail', 'clInsta', 'clNotas'].forEach(id => document.getElementById(id).value = '');
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveCliente', false);
}

/* ── Eliminar cliente ── */
async function deleteCliente(id) {
  if (!confirm('¿Eliminar este cliente?')) return;
  try {
    await remove('clientes', id);
    toast('Cliente eliminado', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error', 'error');
  }
}
