// main
import { inicializarTema } from "./theme.js";
import { inicializarAuth, estaAutenticado, obtenerRolUsuario } from "./auth.js";
import {
  cargarProductos,
  cargarCategorias,
  inicializarBuscador,
} from "./productos.js";
import { inicializarCarrito, actualizarContadorCarrito } from "./carrito.js";
import { cargarPanelAdmin } from "./admin.js";

// Configuración inicial
const config = {
  apiBaseUrl: "https://funval-backend.onrender.com",
  maxProductos: 100,
  cargarDatosIniciales: true,
};

// Función principal que se ejecuta al cargar la página
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Inicializar tema (claro/oscuro)
    inicializarTema();

    // 2. Inicializar sistema de autenticación
    inicializarAuth();

    // 3. Inicializar buscador de productos
    inicializarBuscador();

    // 4. Verificar si estamos en el panel de admin
    await cargarContenidoSegunHash();

    // 5. Inicializar carrito (solo si está logueado y no en admin)
    if (estaAutenticado() && window.location.hash !== "#admin-panel") {
      inicializarCarrito();
      actualizarContadorCarrito();
    }

    // 6. Cargar datos iniciales si está configurado y no en admin
    if (
      config.cargarDatosIniciales &&
      window.location.hash !== "#admin-panel"
    ) {
      await Promise.all([cargarProductos(), cargarCategorias()]);
    }

    // 7. Verificar si hay hash de categoría
    const categoriaHash = window.location.hash.substring(1);
    if (categoriaHash && categoriaHash !== "admin-panel") {
      await cargarProductos(categoriaHash);
    }
  } catch (error) {
    console.error("Error en la inicialización:", error);
    mostrarErrorInicial();
  }
});

// Escuchar cambios en el hash
window.addEventListener("hashchange", cargarContenidoSegunHash);

// Función para cargar contenido según el hash
async function cargarContenidoSegunHash() {
  if (window.location.hash === "#admin-panel") {
    console.log("Intentando cargar panel de admin...");
    if (estaAutenticado() && obtenerRolUsuario() === "administrador") {
      document.querySelector("main").classList.add("hidden");
      await cargarPanelAdmin();
      console.log("Panel de admin cargado");
    } else {
      console.log("Acceso denegado al panel de admin");
      window.location.hash = "";
      document.querySelector("main").classList.remove("hidden");
      await Promise.all([cargarProductos(), cargarCategorias()]);
    }
  }
}

// Función para mostrar error inicial
function mostrarErrorInicial() {
  const mainElement = document.querySelector("main");
  if (mainElement) {
    mainElement.innerHTML = `
      <div class="flex flex-col items-center justify-center h-screen">
        <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center max-w-md mx-4">
          <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
          <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error de carga</h2>
          <p class="text-gray-600 dark:text-gray-300 mb-6">
            Ocurrió un error al cargar la aplicación. Por favor, intenta recargar la página.
          </p>
          <button onclick="window.location.reload()" 
                  class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300">
            Recargar
          </button>
        </div>
      </div>
    `;
  }
}

// Función para manejar cambios en la autenticación
export function actualizarUIpostLogin(role) {
  // Actualizar el carrito
  if (estaAutenticado()) {
    inicializarCarrito();
    actualizarContadorCarrito();
    const cartBtn = document.getElementById("cart-btn");
    if (cartBtn) cartBtn.style.display = "block"; // Mostrar botón del carrito
  }

  // Redirigir a admin panel si es administrador
  if (role === "administrador") {
    window.location.hash = "#admin-panel";
    window.location.reload();
  } else {
    // Recargar productos para mostrar botones de carrito
    productosCache = null; // Limpiar caché para forzar recarga
    cargarProductos();
  }
}

// Función para manejar logout
export function actualizarUIpostLogout() {
  // Recargar productos para ocultar botones de carrito
  cargarProductos();

  // Ocultar elementos del carrito
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) cartBtn.style.display = "none";
}

// Exportar funciones para acceso global (si es necesario)
window.app = {
  recargarProductos: () => {
    productosCache = null;
    categoriasCache = null;
    cargarProductos();
    cargarCategorias();
  },
  redirigirAdmin: () => {
    if (estaAutenticado() && obtenerRolUsuario() === "administrador") {
      window.location.hash = "#admin-panel";
      window.location.reload();
    }
  },
};

console.log(JSON.parse(localStorage.getItem("user_data")));
