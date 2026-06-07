/* ============================================================
   Apertura / cierre de modales y lógica de pre-poblado.
   ============================================================ */

/**
 * Abre un modal por id y lo pre-puebla si corresponde.
 * @param {string} id
 */
function openModal(id) {
  if (id === 'ventaModal')   populateVentaModal();
  if (id === 'compraModal')  populateCompraModal();
  if (id === 'ajusteModal')  populateAjusteModal(null);
  if (id === 'compraModal' || id === 'productoModal') populateCategorias();
  document.getElementById(id).classList.add('open');
}

/** Cierra un modal por id. */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Cerrar al hacer click en el overlay (fuera del modal)
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) overlay.classList.remove('open');
  });
});

/* ── Venta ── */
function populateVentaModal() {
  document.getElementById('vCliente').innerHTML =
    '<option value="">Sin cliente (mostrador)</option>' +
    cache.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');

  document.getElementById('vProducto').innerHTML =
    cache.productos
      .filter(p => p.stock > 0)
      .map(p => `<option value="${p.id}">${p.nombre} (${p.stock} u.)</option>`)
      .join('');

  fillVentaPrice();
}

function fillVentaPrice() {
  const pId  = document.getElementById('vProducto').value;
  const prod = cache.productos.find(p => p.id === pId);
  if (prod) document.getElementById('vPrecio').value = prod.precio;
  calcVentaTotal();
}

function calcVentaTotal() {
  const c = parseFloat(document.getElementById('vCantidad').value) || 0;
  const p = parseFloat(document.getElementById('vPrecio').value)   || 0;
  document.getElementById('vTotal').textContent = fmt(c * p);
}

/* ── Compra ── */
function populateCompraModal() {
  document.getElementById('cProveedor').innerHTML =
    '<option value="">Sin especificar</option>' +
    cache.proveedores.map(pv => `<option value="${pv.id}">${pv.nombre}</option>`).join('');

  document.getElementById('cProducto').innerHTML =
    '<option value="__nuevo__">+ Producto nuevo</option>' +
    cache.productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');

  document.getElementById('nuevoProductoFields').style.display = 'block';
  document.getElementById('cFecha').value = today();
}

function onCompraProducto() {
  const v = document.getElementById('cProducto').value;
  document.getElementById('nuevoProductoFields').style.display = v === '__nuevo__' ? 'block' : 'none';
  if (v !== '__nuevo__') {
    const p = cache.productos.find(x => x.id === v);
    if (p) {
      document.getElementById('cCosto').value       = p.costo;
      document.getElementById('cPrecioVenta').value = p.precio;
    }
  }
}

/* ── Ajuste de stock ── */
function populateAjusteModal(prodId) {
  const sel = document.getElementById('ajProducto');
  sel.innerHTML = cache.productos.map(p => `<option value="${p.id}">${p.nombre}</option>`).join('');
  if (prodId) sel.value = prodId;
  onAjusteProd();
}

function onAjusteProd() {
  const p = cache.productos.find(x => x.id === document.getElementById('ajProducto').value);
  if (p) {
    document.getElementById('ajStockActual').value = p.stock;
    document.getElementById('ajNuevoStock').value  = p.stock;
  }
}

/** Abre el modal de ajuste pre-seleccionando un producto específico. */
function openAjusteForProd(id) {
  populateAjusteModal(id);
  document.getElementById('ajusteModal').classList.add('open');
}

// Llena los selects de categoría al abrir modales
function populateCategorias() {
  const selIds = ['cCategoria', 'pCategoria'];
  selIds.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = Object.keys(CATEGORIAS)
      .map(cat => `<option value="${cat}">${cat}</option>`)
      .join('');
    // Disparar el change para que se llene la subcategoría inicial
    sel.dispatchEvent(new Event('change'));
  });
}

// Cuando cambia la categoría, actualiza las subcategorías
function onCategoriaChange(catId, subId) {
  const cat = document.getElementById(catId)?.value;
  const sub = document.getElementById(subId);
  if (!sub || !cat) return;
  const subs = CATEGORIAS[cat] || [];
  sub.innerHTML = subs
    .map(s => `<option value="${s}">${s}</option>`)
    .join('');
}