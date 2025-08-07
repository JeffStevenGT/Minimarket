// main.js
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

    // 4. Verificar hash de URL para panel admin
    if (window.location.hash === "#admin-panel") {
      if (estaAutenticado() && obtenerRolUsuario() === "admin") {
        await cargarPanelAdmin();
        return;
      } else {
        window.location.hash = "";
      }
    }

    // 5. Cargar interfaz principal para usuarios normales
    if (config.cargarDatosIniciales) {
      await Promise.all([cargarProductos(), cargarCategorias()]);
    }

    // 6. Actualizar contador del carrito si hay items
    actualizarContadorCarrito();
  } catch (error) {
    console.error("Error en la inicialización:", error);
    mostrarErrorInicial();
  }
});

// Resto del código se mantiene igual...
// Modifica la función inicializarBuscador en main.js
function inicializarBuscador() {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");
  const searchSuggestions = document.getElementById("search-suggestions");

  // Mostrar/ocultar sugerencias
  searchInput.addEventListener("input", () => {
    const termino = searchInput.value.trim();
    if (termino.length > 2) {
      const sugerencias = obtenerSugerencias(termino);
      mostrarSugerencias(sugerencias);
    } else {
      searchSuggestions.classList.add("hidden");
    }
  });

  // Ocultar sugerencias al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target)) {
      searchSuggestions.classList.add("hidden");
    }
  });

  // Resto del código anterior...
}
