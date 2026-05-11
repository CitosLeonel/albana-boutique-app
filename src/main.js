/* ============================================================
   src/main.js
   Bootstrap de la aplicación.
   Punto de entrada: verifica sesión, muestra la pantalla
   correcta y registra listeners globales.
   ============================================================ */

// ── Estado global de la app ──
let currentUser = null;
let currentView = "dashboard";

// Cache en memoria para evitar fetches redundantes en modales
let cache = { productos: [], clientes: [], proveedores: [] };

/* ── Helpers de pantalla ── */
function hideLoading() {
  document.getElementById("loadingScreen").style.display = "none";
}
function showLogin() {
  document.getElementById("loginScreen").style.display = "flex";
}

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("app").style.display = "block";

  // Actualizar UI con datos del usuario
  document.getElementById("userName").textContent = currentUser.name;
  document.getElementById("userRoleLabel").textContent =
    currentUser.role === "admin" ? "Administrador" : "Vendedor";
  document.getElementById("userAvatar").textContent =
    currentUser.name[0].toUpperCase();
  document.getElementById("sidebarRole").textContent =
    currentUser.role === "admin" ? "Admin" : "Vendedor";
  document.getElementById("adminNavSection").style.display =
    currentUser.role === "admin" ? "block" : "none";

  // Fecha en el dashboard
  document.getElementById("dashDate").textContent =
    new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Valores por defecto en formularios de fecha
  document.getElementById("mFecha").value = today();
  document.getElementById("cFecha").value = today();

  nav("dashboard");
}

/* ── Inicialización ── */
window.addEventListener("DOMContentLoaded", async () => {
  try {
    const {
      data: { session },
    } = await db.auth.getSession();
    if (session) {
      await loadUserProfile(session.user);
      hideLoading();
      showApp();
    } else {
      hideLoading();
      showLogin();
    }
  } catch (e) {
    hideLoading();
    showLogin();
  }

  // Escuchar cambios de sesión (expiración, logout desde otra pestaña, refresh de token)
  db.auth.onAuthStateChange(async (event, session) => {
    if (event === "SIGNED_OUT" || !session) {
      currentUser = null;
      document.getElementById("app").style.display = "none";
      showLogin();
    } else if (event === "TOKEN_REFRESHED" && session) {
      await loadUserProfile(session.user);
    }
  });
});

/* ── Re-renderizar dashboard al cambiar tamaño de ventana ── */
window.addEventListener("resize", () => {
  if (currentView === "dashboard") renderDashboard();
});
