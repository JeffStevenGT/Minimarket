// auth.js
import { mostrarError, ocultarError } from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";
const TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrZXZpbmRhbmRyZXciLCJyb2wiOiJhZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzU0NTg0NTc3fQ.jIh8dvM9qrQEtjQXnYK-y52p5boMz75dGtI57fIhUKI";

export function inicializarAuth() {
  const loginBtn = document.getElementById("login-btn");
  const loginDropdown = document.getElementById("login-dropdown");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const registerBtn = document.getElementById("register-btn");
  const registerModal = document.getElementById("register-modal");
  const closeRegisterModal = document.getElementById("close-register-modal");
  const registerForm = document.getElementById("register-form");

  loginBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    loginDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", () => {
    loginDropdown.classList.add("hidden");
  });

  loginDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    ocultarError(loginError);

    const nombre_usuario = document
      .getElementById("nombre_usuario")
      .value.trim();
    const contraseña = document.getElementById("contraseña").value.trim();

    if (!nombre_usuario || !contraseña) {
      mostrarError(loginError, "Por favor, completa todos los campos");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_usuario, contraseña }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("nombre_usuario", nombre_usuario);
        localStorage.setItem("userId", data.user_id);
        actualizarUIpostLogin(data.role);
      } else {
        const errorMessage = procesarMensajeError(data.detail);
        mostrarError(loginError, errorMessage || "Credenciales incorrectas");
      }
    } catch (error) {
      mostrarError(loginError, "Error al conectar con el servidor");
      console.error("Error:", error);
    }
  });

  registerBtn.addEventListener("click", () => {
    registerModal.classList.remove("hidden");
    loginDropdown.classList.add("hidden");
  });

  closeRegisterModal.addEventListener("click", () => {
    registerModal.classList.add("hidden");
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre_usuario = document
      .getElementById("register-nombre-usuario")
      .value.trim();
    const nombre_completo = document
      .getElementById("register-nombre-completo")
      .value.trim();
    const correo = document.getElementById("register-correo").value.trim();
    const telefono = document.getElementById("register-telefono").value.trim();
    const contraseña = document
      .getElementById("register-contraseña")
      .value.trim();
    const rol = document.getElementById("register-rol").value;

    if (
      !nombre_usuario ||
      !nombre_completo ||
      !correo ||
      !telefono ||
      !contraseña
    ) {
      alert("Por favor, completa todos los campos");
      return;
    }

    try {
      const endpoint =
        rol === "administrador"
          ? `${API_BASE_URL}/registro-admin`
          : `${API_BASE_URL}/registro-comprador`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({
          nombre_usuario,
          nombre_completo,
          correo,
          telefono,
          contraseña,
          rol,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registro exitoso! Por favor inicia sesión.");
        registerModal.classList.add("hidden");
        registerForm.reset();
      } else {
        const errorMessage = procesarMensajeError(data.detail);
        alert(errorMessage || "Error en el registro");
      }
    } catch (error) {
      alert("Error al conectar con el servidor");
      console.error("Error:", error);
    }
  });
}

function procesarMensajeError(detail) {
  if (!detail) return null;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
  }

  if (typeof detail === "object") {
    return detail.msg || detail.error || JSON.stringify(detail);
  }

  return JSON.stringify(detail);
}

function actualizarUIpostLogin(role) {
  const loginBtn = document.getElementById("login-btn");
  const nombre_usuario = localStorage.getItem("nombre_usuario");

  loginBtn.innerHTML = `
    <span class="text-white dark:text-gray-300">${nombre_usuario}</span>
    <i class="fas fa-user text-white dark:text-gray-400"></i>
    <i class="fas fa-caret-down text-white dark:text-gray-400 ml-2"></i>
  `;

  const loginDropdown = document.getElementById("login-dropdown");
  loginDropdown.innerHTML = `
    <div class="p-4">
      <p class="text-sm text-gray-700 dark:text-gray-300 mb-2">Bienvenido, ${nombre_usuario}</p>
      <button id="profile-btn" class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
        Mi Perfil
      </button>
      <button id="logout-btn" class="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
        Cerrar Sesión
      </button>
    </div>
  `;

  document.getElementById("profile-btn").addEventListener("click", () => {
    window.location.hash = "#perfil";
    window.location.reload();
  });

  document.getElementById("logout-btn").addEventListener("click", cerrarSesion);

  if (role === "administrador") {
    window.location.hash = "#admin-panel";
    window.location.reload();
  }
}

export async function obtenerPerfil() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/me/perfil`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token") || TOKEN}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error("Error al obtener el perfil");
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

export async function actualizarPerfil(datos) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/me/perfil`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") || TOKEN}`,
      },
      body: JSON.stringify(datos),
    });
    if (response.ok) {
      alert("Perfil actualizado correctamente");
      return true;
    } else {
      const data = await response.json();
      const errorMessage = procesarMensajeError(data.detail);
      alert(errorMessage || "Error al actualizar el perfil");
      return false;
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
    return false;
  }
}

export function estaAutenticado() {
  return !!localStorage.getItem("token");
}

export function obtenerRolUsuario() {
  return localStorage.getItem("userRole");
}

export function obtenerUserId() {
  return localStorage.getItem("userId");
}

export function obtenerToken() {
  return localStorage.getItem("token") || TOKEN;
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("nombre_usuario");
  localStorage.removeItem("userId");
  window.location.hash = "";
  window.location.reload();
}
