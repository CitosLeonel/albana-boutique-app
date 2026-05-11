/* ============================================================
   src/views/usuarios.js
   Vista de usuarios (solo admin). Gestiona el acceso al sistema
   usando Supabase Auth — contraseñas hasheadas con bcrypt en
   el servidor, nunca almacenadas en texto plano.
   ============================================================ */

async function renderUsuarios() {
  // Protección en cliente (reforzada por RLS en servidor)
  if (!currentUser || currentUser.role !== 'admin') {
    nav('dashboard');
    return;
  }

  const { data: profiles, error } = await db
    .from('user_profiles')
    .select('*')
    .order('created_at');

  if (error) {
    document.getElementById('usuariosTable').innerHTML = `
      <thead><tr><th>Nombre</th><th>Email</th><th>Contraseña</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody><tr><td colspan="5"><div class="empty-state"><div class="empty-icon">⚠️</div>
      <p>Error al cargar. Ejecutá el SQL de perfiles en Supabase.</p></div></td></tr></tbody>`;
    return;
  }

  if (!profiles || profiles.length === 0) {
    document.getElementById('usuariosTable').innerHTML = `
      <thead><tr><th>Nombre</th><th>Email</th><th>Contraseña</th><th>Rol</th><th>Acciones</th></tr></thead>
      <tbody><tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔐</div>
      <p>No hay perfiles aún. Ejecutá el SQL de perfiles en Supabase.</p></div></td></tr></tbody>`;
    _ensureNuevoUsuarioBtn();
    return;
  }

  const rows = profiles.map(u => `
    <tr>
      <td class="fw-600">${u.name}</td>
      <td class="text-muted">${u.email || '—'}</td>
      <td><span style="letter-spacing:2px;color:#bbb">••••••</span></td>
      <td><span class="badge ${u.role === 'admin' ? 'badge-blue' : 'badge-gray'}">${u.role}</span></td>
      <td style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" onclick="editUsuario('${u.id}','${u.name}','${u.email || ''}','${u.role}')">✏️ Editar</button>
        ${u.id !== currentUser.id
          ? `<button class="btn btn-danger btn-sm" onclick="deleteUsuario('${u.id}')">✕</button>`
          : ''}
      </td>
    </tr>`).join('');

  document.getElementById('usuariosTable').innerHTML = `
    <thead><tr><th>Nombre</th><th>Email (usuario)</th><th>Contraseña</th><th>Rol</th><th>Acciones</th></tr></thead>
    <tbody>${rows || '<tr><td colspan="5"><div class="empty-state"><div class="empty-icon">🔐</div><p>Sin usuarios</p></div></td></tr>'}</tbody>`;

  _ensureNuevoUsuarioBtn();
}

/** Añade el botón "+ Nuevo Usuario" al page-header si no existe. */
function _ensureNuevoUsuarioBtn() {
  const ph = document.querySelector('#view-usuarios .page-header');
  if (ph && !ph.querySelector('.btn-gold')) {
    const btn = document.createElement('button');
    btn.className = 'btn btn-gold';
    btn.textContent = '+ Nuevo Usuario';
    btn.onclick = openNuevoUsuario;
    ph.appendChild(btn);
  }
}

/* ── Formulario nuevo usuario ── */
function openNuevoUsuario() {
  document.getElementById('usuarioModalTitle').textContent = 'Nuevo Usuario';
  document.getElementById('uEditId').value  = '';
  document.getElementById('uNombre').value  = '';
  document.getElementById('uUser').value    = '';
  document.getElementById('uPass').value    = '';
  document.getElementById('uRol').value     = 'vendedor';
  document.getElementById('uPassLabel').textContent = 'Contraseña (mínimo 8 caracteres)';
  document.getElementById('usuarioModal').classList.add('open');
}

/* ── Formulario editar usuario ── */
function editUsuario(id, name, email, role) {
  document.getElementById('usuarioModalTitle').textContent = 'Editar Usuario';
  document.getElementById('uEditId').value  = id;
  document.getElementById('uNombre').value  = name;
  document.getElementById('uUser').value    = email;
  document.getElementById('uPass').value    = '';
  document.getElementById('uRol').value     = role;
  document.getElementById('uPassLabel').textContent = 'Nueva contraseña (dejá vacío para no cambiar)';
  document.getElementById('usuarioModal').classList.add('open');
}

/* ── Guardar usuario (nuevo o edición) ── */
async function saveUsuario() {
  if (!currentUser || currentUser.role !== 'admin') { toast('Sin permisos', 'error'); return; }

  const nombre = document.getElementById('uNombre').value.trim();
  const email  = document.getElementById('uUser').value.trim().toLowerCase();
  const pass   = document.getElementById('uPass').value;
  const role   = document.getElementById('uRol').value;
  const editId = document.getElementById('uEditId').value;

  if (!nombre || !email)        { toast('Nombre y email son obligatorios', 'error'); return; }
  if (!email.includes('@'))     { toast('Ingresá un email válido', 'error'); return; }

  setBtnLoading('btnSaveUsuario', true);

  if (editId) {
    // ── Editar usuario existente ──
    if (pass && pass.length < 8) { toast('La contraseña debe tener al menos 8 caracteres', 'error'); setBtnLoading('btnSaveUsuario', false); return; }

    const { error: profErr } = await db.from('user_profiles').update({ name: nombre, role }).eq('id', editId);
    if (profErr) { toast('Error al actualizar perfil: ' + profErr.message, 'error'); setBtnLoading('btnSaveUsuario', false); return; }

    if (pass) {
      const { error: passErr } = await db.functions.invoke('update-user-password', { body: { userId: editId, newPassword: pass } });
      toast(passErr ? 'Perfil actualizado pero error al cambiar contraseña.' : 'Usuario actualizado ✓', passErr ? 'error' : 'success');
    } else {
      toast('Usuario actualizado ✓', 'success');
    }

  } else {
    // ── Crear usuario nuevo ──
    if (!pass || pass.length < 8) { toast('La contraseña debe tener al menos 8 caracteres', 'error'); setBtnLoading('btnSaveUsuario', false); return; }
    if (!/[A-Z]/.test(pass))      { toast('La contraseña debe tener al menos una mayúscula', 'error'); setBtnLoading('btnSaveUsuario', false); return; }
    if (!/[0-9]/.test(pass))      { toast('La contraseña debe tener al menos un número', 'error'); setBtnLoading('btnSaveUsuario', false); return; }

    const { error: signUpErr } = await db.auth.admin.createUser({
      email,
      password:      pass,
      email_confirm: true,
      user_metadata: { name: nombre, role },
    });

    if (signUpErr) { toast('Error al crear usuario: ' + signUpErr.message, 'error'); setBtnLoading('btnSaveUsuario', false); return; }
    toast('Usuario creado ✓', 'success');
  }

  closeModal('usuarioModal');
  await renderUsuarios();
  setBtnLoading('btnSaveUsuario', false);
}

/* ── Eliminar usuario ── */
async function deleteUsuario(id) {
  if (!currentUser || currentUser.role !== 'admin') { toast('Sin permisos', 'error'); return; }
  if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;

  const { error } = await db.functions.invoke('delete-user', { body: { userId: id } });
  if (error) { toast('Error al eliminar usuario', 'error'); return; }

  await db.from('user_profiles').delete().eq('id', id);
  toast('Usuario eliminado', 'success');
  await renderUsuarios();
}
