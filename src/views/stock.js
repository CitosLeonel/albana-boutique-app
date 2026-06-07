/* ============================================================
   src/views/stock.js
   Vista de inventario: tarjetas de productos, filtros por
   categoría y ajuste manual de stock.
   ============================================================ */

// Estado local de la vista
let stockCat = 'Todos';

function setStockCat(cat) {
  stockCat = cat;
  renderStock();
}

async function renderStock() {
  const productos = await fetchAll('productos');
  cache.productos = productos;

  // ── KPIs ──
  const total    = productos.reduce((a, p) => a + p.stock, 0);
  const criticos = productos.filter(p => p.stock > 0 && p.stock <= p.stock_min).length;
  const sinStock = productos.filter(p => p.stock === 0).length;
  const valorInv = productos.reduce((a, p) => a + p.stock * p.costo, 0);

  document.getElementById('stockStats').innerHTML = `
    <div class="stat-card"><div class="stat-icon">📦</div><div class="stat-label">Total unidades</div><div class="stat-value">${total}</div></div>
    <div class="stat-card"><div class="stat-icon">🏷️</div><div class="stat-label">Productos</div><div class="stat-value">${productos.length}</div></div>
    <div class="stat-card"><div class="stat-icon">⚠️</div><div class="stat-label">Stock bajo/sin</div><div class="stat-value" style="color:${criticos + sinStock > 0 ? 'var(--rose)' : 'var(--sage)'}">${criticos + sinStock}</div></div>
    <div class="stat-card"><div class="stat-icon">💎</div><div class="stat-label">Valor inventario</div><div class="stat-value">${fmt(valorInv)}</div></div>`;

  // ── Filtros de categoría ──
  const cats = ['Todos', ...new Set(productos.map(p => p.categoria))];
  document.getElementById('stockCatFilters').innerHTML = cats
    .map(c => `<button class="filter-btn${c === stockCat ? ' active' : ''}" onclick="setStockCat('${c}')">${c}</button>`)
    .join('');

  // ── Grilla de productos ──
  const prods = stockCat === 'Todos' ? productos : productos.filter(p => p.categoria === stockCat);
  document.getElementById('stockGrid').innerHTML = prods.length
    ? prods.map(p => {
        const pct   = Math.min(100, Math.round((p.stock / Math.max(p.stock_min * 3, 10)) * 100));
        const col   = p.stock === 0 ? '#c0616b' : p.stock <= p.stock_min ? '#d48b20' : '#5f8a72';
        const badge = p.stock === 0 ? 'badge-red' : p.stock <= p.stock_min ? 'badge-yellow' : 'badge-green';
        const label = p.stock === 0 ? 'Sin stock' : p.stock <= p.stock_min ? 'Stock bajo' : 'OK';
        return `<div class="stock-card" onclick="openAjusteForProd('${p.id}')">
          <div class="stock-card-name">${p.nombre}</div>
          <div class="stock-card-cat">${p.categoria}</div>
          <div class="stock-bar-wrap">
            <div class="stock-bar-bg"><div class="stock-bar-fill" style="width:${pct}%;background:${col}"></div></div>
            <span class="stock-qty">${p.stock} u.</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:9px;align-items:center">
            <span class="badge ${badge}">${label}</span>
            <span class="stock-price">${fmt(p.precio)}</span>
          </div>
        </div>`;
      }).join('')
    : '<p class="text-muted">No hay productos en esta categoría.</p>';
}

/* ── Guardar producto nuevo ── */
async function saveProducto() {
  const nombre = document.getElementById('pNombre').value.trim();
  if (!nombre) { toast('Ingresá el nombre', 'error'); return; }

  setBtnLoading('btnSaveProducto', true);
  try {
    await insert('productos', {
      nombre,
      categoria: document.getElementById('pCategoria').value,
      subcategoria: document.getElementById('cSubcategoria').value,
      stock:     parseInt(document.getElementById('pStock').value)    || 0,
      costo:     parseFloat(document.getElementById('pCosto').value)  || 0,
      precio:    parseFloat(document.getElementById('pPrecio').value) || 0,
      stock_min: parseInt(document.getElementById('pStockMin').value) || 3,
    });
    closeModal('productoModal');
    toast('Producto agregado ✓', 'success');
    document.getElementById('pNombre').value = '';
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveProducto', false);
}

/* ── Guardar ajuste de stock ── */
async function saveAjuste() {
  const pId        = document.getElementById('ajProducto').value;
  const nuevoStock = parseInt(document.getElementById('ajNuevoStock').value);
  if (isNaN(nuevoStock) || nuevoStock < 0) { toast('Stock inválido', 'error'); return; }

  setBtnLoading('btnSaveAjuste', true);
  try {
    await update('productos', pId, { stock: nuevoStock });
    closeModal('ajusteModal');
    toast('Stock ajustado ✓', 'success');
    await renderView(currentView);
  } catch (e) {
    toast('Error: ' + e.message, 'error');
  }
  setBtnLoading('btnSaveAjuste', false);
}
