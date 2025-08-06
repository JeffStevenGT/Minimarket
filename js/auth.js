// AUTH.JS
import { mostrarError, ocultarError } from "./utils.js";

// Manejo de autenticación

/**
 * Inicializa los eventos de autenticación
 */
export function inicializarAuth() {
  const loginBtn = document.getElementById("login-btn");
  const loginDropdown = document.getElementById("login-dropdown");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const registerBtn = document.getElementById("register-btn");
  const registerModal = document.getElementById("register-modal");
  const closeRegisterModal = document.getElementById("close-register-modal");
  const registerForm = document.getElementById("register-form");

  // Mostrar/ocultar dropdown de login
  loginBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    loginDropdown.classList.toggle("hidden");
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", () => {
    loginDropdown.classList.add("hidden");
  });

  // Prevenir cierre al hacer clic dentro del dropdown
  loginDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // Manejar envío del formulario de login
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError(loginError);

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
      const response = await fetch(
        "https://funval-backend.onrender.com/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Guardar token y redirigir según el rol
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("username", username);

        if (data.role === "admin") {
          // Redirigir al panel de admin
          window.location.href = "#admin-panel";
          cargarPanelAdmin();
        } else {
          // Recargar la página para el comprador
          window.location.reload();
        }
      } else {
        mostrarError(loginError, data.detail || "Credenciales incorrectas");
      }
    } catch (error) {
      mostrarError(loginError, "Error al conectar con el servidor");
      console.error("Error:", error);
    }
  });

  // Mostrar modal de registro
  registerBtn.addEventListener("click", () => {
    registerModal.classList.remove("hidden");
    loginDropdown.classList.add("hidden");
  });

  // Cerrar modal de registro
  closeRegisterModal.addEventListener("click", () => {
    registerModal.classList.add("hidden");
  });

  // Manejar envío del formulario de registro
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;

    try {
      const endpoint =
        role === "admin"
          ? "https://funval-backend.onrender.com/registro-admin"
          : "https://funval-backend.onrender.com/registro-comprador";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registro exitoso! Por favor inicia sesión.");
        registerModal.classList.add("hidden");
      } else {
        alert(data.detail || "Error en el registro");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
      console.error("Error:", error);
    }
  });
}

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export function estaAutenticado() {
  return !!localStorage.getItem("token");
}

/**
 * Obtiene el rol del usuario actual
 * @returns {string|null}
 */
export function obtenerRolUsuario() {
  return localStorage.getItem("userRole");
}

/**
 * Cierra la sesión del usuario
 */
export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("username");
  window.location.reload();
}
