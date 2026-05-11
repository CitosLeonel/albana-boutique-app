/* ============================================================
   src/auth/session.js
   Gestión de sesión: carga del perfil de usuario y listeners
   de cambios de estado de autenticación (Supabase Auth).
   ============================================================ */

/**
 * Carga el perfil del usuario autenticado desde user_profiles.
 * Si no existe perfil, cierra la sesión por seguridad.
 * @param {Object} authUser  - Objeto user de Supabase Auth
 */
async function loadUserProfile(authUser) {
  const { data: profile, error } = await db
    .from('user_profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (error || !profile) {
    await db.auth.signOut();
    return;
  }

  currentUser = {
    id:    authUser.id,
    email: authUser.email,
    name:  profile.name,
    role:  profile.role,
  };
}
