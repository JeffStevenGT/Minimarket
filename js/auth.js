//auth.js
import {
  mostrarError,
  ocultarError,
  procesarMensajeError,
  mostrarNotificacion,
} from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";
const TOKEN_KEY = "auth_token";
const USER_DATA_KEY = "user_data";

/**
 * Inicializa el sistema de autenticación
 * @returns {void}
 */
export function inicializarAuth() {
  const loginBtn = document.getElementById("login-btn");
  const loginDropdown = document.getElementById("login-dropdown");
  const loginForm = document.getElementById("login-form");
  const registerBtn = document.getElementById("register-btn");
  const registerModal = document.getElementById("register-modal");

  // 1. Configurar eventos del dropdown de login
  if (loginBtn && loginDropdown) {
    loginBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      loginDropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () =>
      loginDropdown.classList.add("hidden")
    );
    loginDropdown.addEventListener("click", (e) => e.stopPropagation());
  }

  // 2. Configurar formulario de login
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const errorElement = document.getElementById("login-error");
      ocultarError(errorElement);

      const data = {
        nombre_usuario: document.getElementById("nombre_usuario").value.trim(),
        contraseña: document.getElementById("contraseña").value.trim(),
      };

      try {
        const response = await fetch(`${API_BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(procesarMensajeError(errorData.detail));
        }

        const responseData = await response.json();
        const userData = {
          nombre_usuario: responseData.nombre_usuario || data.nombre_usuario, // Fallback al valor del formulario
          rol: responseData.rol || "administrador", // Fallback por seguridad
          id_usuario: responseData.id_usuario || null,
        };
        guardarSesion(responseData.access_token, userData);
        actualizarUIpostLogin(userData.rol);
        mostrarNotificacion(`Bienvenido ${userData.nombre_usuario}`);
      } catch (error) {
        mostrarError(errorElement, error.message);
      }
    });
  }

  // 3. Configurar registro
  if (registerBtn && registerModal) {
    registerBtn.addEventListener("click", () => {
      loginDropdown?.classList.add("hidden");
      registerModal.classList.remove("hidden");
    });

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
          nombre_usuario: document
            .getElementById("register-nombre-usuario")
            .value.trim(),
          nombre_completo: document
            .getElementById("register-nombre-completo")
            .value.trim(),
          correo: document.getElementById("register-correo").value.trim(),
          telefono: document.getElementById("register-telefono").value.trim(),
          contraseña: document
            .getElementById("register-contraseña")
            .value.trim(),
          rol: document.getElementById("register-rol").value,
        };

        try {
          const endpoint =
            data.rol === "administrador"
              ? `${API_BASE_URL}/registro-admin`
              : `${API_BASE_URL}/registro-comprador`;

          const response = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(procesarMensajeError(errorData.detail));
          }

          mostrarNotificacion("Registro exitoso. Por favor inicia sesión");
          registerModal.classList.add("hidden");
          registerForm.reset();
        } catch (error) {
          mostrarNotificacion(error.message, "error");
        }
      });
    }
  }
}

/**
 * Guarda los datos de sesión en localStorage
 * @param {string} token - Token JWT
 * @param {object} userData - Datos del usuario
 */
function guardarSesion(token, userData) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
}

/**
 * Actualiza la UI después del login
 * @param {string} role - Rol del usuario
 */
export function actualizarUIpostLogin(role) {
  const userData = JSON.parse(localStorage.getItem(USER_DATA_KEY)) || {};
  const loginBtn = document.getElementById("login-btn");

  // Depuración: Verificar datos del usuario
  console.log("Datos de usuario en localStorage:", userData);
  console.log("Rol detectado:", role);

  if (loginBtn) {
    const nombreUsuario = userData.nombre_usuario || "Usuario";
    loginBtn.innerHTML = `
      <span class="text-white dark:text-gray-300">${nombreUsuario}</span>
      <i class="fas fa-user text-white dark:text-gray-400"></i>
      <i class="fas fa-caret-down text-white dark:text-gray-300 ml-1"></i>
    `;

    const loginDropdown = document.getElementById("login-dropdown");
    if (loginDropdown) {
      loginDropdown.innerHTML = `
        <div class="p-4">
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">
            Hola, <strong>${nombreUsuario}</strong>
          </p>
          <button id="logout-btn" class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <i class="fas fa-sign-out-alt mr-2"></i> Cerrar sesión
          </button>
        </div>
      `;

      document
        .getElementById("logout-btn")
        .addEventListener("click", cerrarSesion);
    }
  }

  if (role === "administrador") {
    window.location.hash = "#admin-panel";
    // No recargar inmediatamente, dejar que main.js maneje la carga
    document.dispatchEvent(new Event("hashchange")); // Disparar evento para que main.js detecte el cambio
  }
}

/**
 * Cierra la sesión actual
 */
export function cerrarSesion() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  window.location.hash = "";
  window.location.reload();
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean}
 */
export function estaAutenticado() {
  return !!localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtiene el rol del usuario actual
 * @returns {'administrador'|'comprador'|null}
 */
export function obtenerRolUsuario() {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData).rol : null;
}

/**
 * Obtiene el token de autenticación
 * @returns {string|null}
 */
export function obtenerToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Obtiene el ID del usuario actual
 * @returns {number|null}
 */
export function obtenerUserId() {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData).id_usuario : null;
}
