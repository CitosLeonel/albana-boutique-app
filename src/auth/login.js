/* ============================================================
   src/auth/login.js
   Login / logout con protección anti fuerza bruta (contador
   de intentos en sessionStorage — sin tocar el servidor).
   ============================================================ */

const MAX_INTENTOS = 5;
const BLOQUEO_MS   = 5 * 60 * 1000; // 5 minutos

/* ── Helpers de estado de bloqueo ── */
function getLoginState()   { const r = sessionStorage.getItem('loginState'); return r ? JSON.parse(r) : { intentos: 0, bloqueadoHasta: null }; }
function setLoginState(s)  { sessionStorage.setItem('loginState', JSON.stringify(s)); }
function resetLoginState() { sessionStorage.removeItem('loginState'); }

function isLoginBloqueado() {
  const s = getLoginState();
  if (!s.bloqueadoHasta) return false;
  if (Date.now() < s.bloqueadoHasta) return true;
  resetLoginState(); // bloqueo expirado
  return false;
}

function registrarIntentoFallido() {
  const s = getLoginState();
  s.intentos = (s.intentos || 0) + 1;
  if (s.intentos >= MAX_INTENTOS) s.bloqueadoHasta = Date.now() + BLOQUEO_MS;
  setLoginState(s);
  return s;
}

/* ── Login ── */
async function doLogin() {
  const email = document.getElementById('loginUser').value.trim();
  const pass  = document.getElementById('loginPass').value;
  const btn   = document.getElementById('loginBtn');
  const errEl = document.getElementById('loginError');

  if (isLoginBloqueado()) {
    const mins = Math.ceil((getLoginState().bloqueadoHasta - Date.now()) / 60000);
    errEl.textContent = `Demasiados intentos. Intentá de nuevo en ${mins} minuto${mins !== 1 ? 's' : ''}.`;
    errEl.style.display = 'block';
    return;
  }

  if (!email || !pass) {
    errEl.textContent = 'Completá usuario y contraseña.';
    errEl.style.display = 'block';
    return;
  }

  errEl.style.display = 'none';
  btn.textContent = 'Ingresando...';
  btn.disabled    = true;

  try {
    const { data, error } = await db.auth.signInWithPassword({ email, password: pass });

    if (error || !data.session) {
      const s         = registrarIntentoFallido();
      const restantes = MAX_INTENTOS - s.intentos;
      errEl.textContent = s.bloqueadoHasta
        ? 'Cuenta bloqueada 5 minutos por demasiados intentos.'
        : `Usuario o contraseña incorrectos. ${restantes} intento${restantes !== 1 ? 's' : ''} restante${restantes !== 1 ? 's' : ''}.`;
      errEl.style.display = 'block';
      btn.textContent = 'Ingresar';
      btn.disabled    = false;
      return;
    }

    resetLoginState();
    await loadUserProfile(data.user);
    showApp();

  } catch (e) {
    errEl.textContent   = 'Error de conexión. Verificá tu internet.';
    errEl.style.display = 'block';
  }

  btn.textContent = 'Ingresar';
  btn.disabled    = false;
}

/* ── Logout ── */
function doLogout() {
  db.auth.signOut().catch(() => {});
  currentUser = null;
  cache       = { productos: [], clientes: [], proveedores: [] };
  document.getElementById('app').style.display       = 'none';
  document.getElementById('loginUser').value         = '';
  document.getElementById('loginPass').value         = '';
  showLogin();
}

/* ── Atajos de teclado en el form de login ── */
document.getElementById('loginPass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('loginUser').addEventListener('keydown', e => { if (e.key === 'Enter') document.getElementById('loginPass').focus(); });
