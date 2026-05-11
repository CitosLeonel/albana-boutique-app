/* ============================================================
   src/views/caja.js
   Vista de flujo de caja: KPIs, gráfico de barras de 7 días
   y tabla de movimientos.
   ============================================================ */

// Estado local de la vista
let cajaFilter = '';

async function renderCaja() {
  const movs = await fetchAll('caja', 'fecha');

  // ── KPIs ──
  const ing = movs.filter(m => m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
  const eg  = movs.filter(m => m.tipo === 'egreso').reduce((a, m) => a + m.monto, 0);

  document.getElementById('cajaStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon">📈</div><div class="stat-label">Total ingresos</div><div class="stat-value color-sage">${fmt(ing)}</div></div>
    <div class="stat-card"><div class="stat-icon">📉</div><div class="stat-label">Total egresos</div><div class="stat-value color-rose">${fmt(eg)}</div></div>
    <div class="stat-card"><div class="stat-icon">💳</div><div class="stat-label">Saldo</div><div class="stat-value" style="color:${ing - eg >= 0 ? 'var(--sage)' : 'var(--rose)'}">${fmt(ing - eg)}</div></div>`;

  // ── Gráfico últimos 7 días ──
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d    = new Date(); d.setDate(d.getDate() - i);
    const dStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
    const ingD  = movs.filter(m => m.fecha === dStr && m.tipo === 'ingreso').reduce((a, m) => a + m.monto, 0);
    const egD   = movs.filter(m => m.fecha === dStr && m.tipo === 'egreso').reduce((a, m)  => a + m.monto, 0);
    days.push({ dStr, label, ing: ingD, eg: egD });
  }
  const maxVal = Math.max(...days.map(d => Math.max(d.ing, d.eg)), 1);

  document.getElementById('cajaChart').innerHTML = days.map(d => `
    <div class="bar-wrap">
      <div style="display:flex;gap:2px;align-items:flex-end;height:94px;width:100%">
        <div class="bar" style="background:var(--sage);height:${Math.max(3, d.ing / maxVal * 94)}%;opacity:.82" title="Ingreso: ${fmt(d.ing)}"></div>
        <div class="bar" style="background:var(--rose);height:${Math.max(3, d.eg  / maxVal * 94)}%;opacity:.82" title="Egreso: ${fmt(d.eg)}"></div>
      </div>
      <span class="bar-lbl">${d.label}</span>
    </div>`).join('');

  document.getElementById('cajaTotals').innerHTML = `
    <div class="cf-total-item"><span class="cf-total-label">🟢 Ingresos</span><span class="cf-total-val color-sage">${fmt(ing)}</span></div>
    <div class="cf-total-item"><span class="cf-total-label">🔴 Egresos</span><span class="cf-total-val color-rose">${fmt(eg)}</span></div>
    <div class="cf-total-item"><span class="cf-total-label">⚖️ Balance</span><span class="cf-total-val" style="color:${ing - eg >= 0 ? 'var(--sage)' : 'var(--rose)'}">${fmt(ing - eg)}</span></div>`;

  // ── Tabla de movimientos ──
  const filtered = movs
    .filter(m => !cajaFilter || m.tipo === cajaFilter)
    .sort((a, b) => b.fecha?.localeCompare(a.fecha));

  document.getElementById('cajaTable').innerHTML =
    `<thead><tr><th>Fecha</th><th>Tipo</th><th>Descripción</th><th>Categoría</th><th>Monto</th><th></th></tr></thead>
     <tbody>${filtered.length
       ? filtered.map(m => `<tr>
           <td>${m.fecha}</td>
           <td><span class="badge ${m.tipo === 'ingreso' ? 'badge-green' : 'badge-red'}">${m.tipo}</span></td>
           <td>${m.descripcion}</td>
           <td class="text-muted">${m.categoria}</td>
           <td class="fw-600 ${m.tipo === 'ingreso' ? 'color-sage' : 'color-rose'}">${m.tipo === 'ingreso' ? '+' : '−'}${fmt(m.monto)}</td>
           <td><button class="btn btn-danger btn-sm" onclick="deleteMov('${m.id}')">✕</button></td>
         </tr>`).join('')
       : '<tr><td colspan="6"><div class="empty-state"><div class="empty-icon">💳</div><p>Sin movimientos</p></div></td></tr>'
     }</tbody>`;
}

/* ── Guardar movimiento ── */
async function saveMov() {
  const monto = parseFloat(document.getElementById('mMonto').value) || 0;
  const desc  = document.getElementById('mDesc').value.trim();
  if (!monto || !desc) { toast('Completá descripción y monto', 'error'); return; }

  setBtnLoading('btnSaveMov', true);
  try {
    await insert('caja', {
      fecha:       document.getElementById('mFecha').value || today(),
      tipo:        document.getElementById('mTipo').value,
      descripcion: desc,
      monto,
      categoria:   document.getElementById('mCat').value,
    });
    closeModal('movModal');
    toast('Movimiento registrado ✓', 'success');
    document.getElementById('mDesc').value  = '';
    document.getElementById('mMonto').value = '';
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveMov', false);
}

/* ── Eliminar movimiento ── */
async function deleteMov(id) {
  if (!confirm('¿Eliminar este movimiento?')) return;
  try {
    await remove('caja', id);
    toast('Eliminado', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error', 'error');
  }
}
