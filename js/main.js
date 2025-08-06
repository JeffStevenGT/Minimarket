// MAIN.JS
import { inicializarTema } from "./theme.js";
import { inicializarAuth, estaAutenticado, obtenerRolUsuario } from "./auth.js";
import { cargarProductos, cargarCategorias } from "./productos.js";
import { inicializarCarrito, actualizarContadorCarrito } from "./carrito.js";
import { cargarPanelAdmin } from "./admin.js";

// Configuración inicial del proyecto
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

    // 3. Inicializar carrito de compras
    inicializarCarrito();

    // 4. Verificar si es admin para cargar panel especial
    if (estaAutenticado() && obtenerRolUsuario() === "admin") {
      await cargarPanelAdmin();
      return; // Detener aquí si es admin
    }

    // 5. Cargar interfaz principal para usuarios normales
    if (config.cargarDatosIniciales) {
      await Promise.all([cargarProductos(), cargarCategorias()]);
    }

    // 6. Actualizar contador del carrito si hay items
    actualizarContadorCarrito();

    // 7. Manejar errores no capturados
    window.addEventListener("error", manejarErrorGlobal);
  } catch (error) {
    console.error("Error en la inicialización:", error);
    mostrarErrorInicial();
  }
});

// Función para manejar errores globales
function manejarErrorGlobal(event) {
  console.error("Error no capturado:", event.error);

  // Mostrar notificación al usuario
  const errorDiv = document.createElement("div");
  errorDiv.className =
    "fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg";
  errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle mr-2"></i>
        <span>Ocurrió un error inesperado</span>
    `;
  document.body.appendChild(errorDiv);

  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Función para mostrar error inicial
function mostrarErrorInicial() {
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `
            <div class="container mx-auto px-4 py-12 text-center">
                <i class="fas fa-exclamation-triangle text-5xl text-red-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error al cargar la aplicación</h2>
                <p class="text-gray-600 dark:text-gray-300 mb-6">Por favor intenta recargar la página</p>
                <button onclick="window.location.reload()" 
                        class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition duration-300">
                    Recargar
                </button>
            </div>
        `;
  }
}

// Exportar funciones para acceso global (opcional)
window.app = {
  recargarProductos: cargarProductos,
  limpiarCarrito: () => {
    localStorage.removeItem("carrito");
    actualizarContadorCarrito();
    if (document.getElementById("cart-items")) {
      document.getElementById("cart-items").innerHTML =
        '<p class="py-4 text-center text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>';
      document.getElementById("cart-total").textContent = formatearPrecio(0);
    }
  },
  // Otras funciones útiles...
};
