//productos.js
import { agregarAlCarrito, actualizarContadorCarrito } from "./carrito.js";
import {
  formatearPrecio,
  obtenerImagenProducto,
  mostrarError,
} from "./utils.js";
import { estaAutenticado } from "./auth.js";

const API_BASE_URL = "https://funval-backend.onrender.com";
let productosCache = null;
let categoriasCache = null;

// Mapeo de imágenes por categoría
const imagenesCategorias = {
  bebidas:
    "https://i.pinimg.com/736x/c7/cb/5a/c7cb5adddce6695a80e78f91684b0308.jpg",
  lácteos:
    "https://i.pinimg.com/1200x/9f/31/b7/9f31b75bf86f5618911af6f0345aaf51.jpg",
  carnes:
    "https://i.pinimg.com/1200x/dc/ce/23/dcce23c671ecf89badf52eb8ab63c4ea.jpg",
  frutas:
    "https://i.pinimg.com/1200x/fc/e0/76/fce0766f7dc45b70cb33aaea88d81d31.jpg",
  verduras:
    "https://i.pinimg.com/736x/f3/c2/11/f3c211781e529073e355481af50c5943.jpg",
  limpieza:
    "https://i.pinimg.com/1200x/92/9c/b1/929cb17191218e9ba2288f4eaa277dc9.jpg",
  higiene:
    "https://i.pinimg.com/1200x/9f/18/ec/9f18ec9bcaae0da7bc7cb67b57ac8261.jpg",
  panadería:
    "https://i.pinimg.com/736x/27/b4/59/27b459487fd18fcc84f09c80f996b859.jpg",
  congelados:
    "https://i.pinimg.com/1200x/64/fd/d2/64fdd2e339d061bc29a8d8ac83243717.jpg",
  enlatados:
    "https://i.pinimg.com/736x/27/18/77/271877f94746dc1ef2961cf4096774a6.jpg",
  conservas:
    "https://i.pinimg.com/736x/27/18/77/271877f94746dc1ef2961cf4096774a6.jpg",
  dulces:
    "https://i.pinimg.com/736x/2c/49/16/2c4916c9142404490fc8c5d33dcf67c6.jpg",
  abarrotes:
    "https://i.pinimg.com/736x/d8/39/6b/d8396b498a087c551af6337affbc591b.jpg",
  comida:
    "https://i.pinimg.com/736x/b6/d3/ed/b6d3ed14e86fa601c03ec89e054d8811.jpg",
  todos:
    "https://i.pinimg.com/736x/28/4a/3f/284a3f14cc71930b37e901670c3a7812.jpg",
};

// Función principal para cargar productos
export async function cargarProductos(
  categoria = null,
  terminoBusqueda = null
) {
  try {
    // Cargar productos si no están en caché
    if (!productosCache) {
      const response = await fetch(
        `${API_BASE_URL}/productos/?skip=0&limit=100`
      );
      if (!response.ok) throw new Error("Error al cargar productos");
      productosCache = await response.json();
    }

    // Filtrar productos por categoría y término de búsqueda
    let productosFiltrados = [...productosCache];

    if (categoria && categoria.toLowerCase() !== "todos") {
      productosFiltrados = productosFiltrados.filter(
        (p) => p.categoria.toLowerCase() === categoria.toLowerCase()
      );
    }

    if (terminoBusqueda) {
      const termino = terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(
        (p) =>
          p.nombre.toLowerCase().includes(termino) ||
          p.descripcion?.toLowerCase().includes(termino)
      );
    }

    mostrarProductos(productosFiltrados);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarErrorProductos();
  }
}

// Función para cargar categorías
export async function cargarCategorias() {
  try {
    if (!categoriasCache) {
      if (!productosCache) {
        const response = await fetch(
          `${API_BASE_URL}/productos/?skip=0&limit=100`
        );
        if (!response.ok) throw new Error("Error al cargar productos");
        productosCache = await response.json();
      }

      // Obtener categorías únicas de los productos
      const categoriasUnicas = [
        ...new Set(productosCache.map((p) => p.categoria)),
      ];
      categoriasCache = ["todos", ...categoriasUnicas];
    }

    mostrarCategorias(categoriasCache);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

// Mostrar productos en el DOM
function mostrarProductos(productos) {
  const productosContainer = document.getElementById("productos-container");
  if (!productosContainer) return;

  if (productos.length === 0) {
    productosContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-box-open text-4xl text-gray-400 mb-3"></i>
        <p class="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  const estaLogueado = estaAutenticado();

  productosContainer.innerHTML = productos
    .map(
      (producto) => `
    <div class="bg-white dark:bg-[#332f2f] rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <!-- Contenedor de imagen -->
      <div class="relative pt-[70%] overflow-hidden">
        <img src="${obtenerImagenProducto(producto.id_producto)}" 
             alt="${producto.nombre}"
             class="absolute top-0 left-0 w-full h-full object-contain p-2"
             ">
      </div>
      
      <!-- Contenido de la card -->
      <div class="p-3 flex flex-col flex-grow">
        <div class="flex-grow">
          <h3 class="font-semibold text-center text-sm text-gray-800 dark:text-white mb-1 line-clamp-2">${
            producto.nombre
          }</h3>
          <p class="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">${
            producto.descripcion || "Sin descripción"
          }</p>
          
          <!-- Categoría -->
          <span class="inline-block px-2 py-0.5 text-[0.65rem] rounded-full mb-1 ${getClaseCategoria(
            producto.categoria
          )}">
            ${producto.categoria}
          </span>
        </div>
        
        <!-- Precio y botón -->
        <div class="mt-2 flex items-center justify-between">
          <p class="text-md font-bold text-green-600 dark:text-green-400">
            ${formatearPrecio(producto.precio)}
          </p>
          ${
            estaLogueado
              ? `
            <button class="agregar-carrito bg-green-600 hover:bg-green-800 text-white w-5 h-5 rounded-full
                      text-xs transition duration-300 flex items-center justify-center cursor-pointer hover:scale-110" 
                    data-id="${producto.id_producto}"
                    aria-label="Agregar ${producto.nombre} al carrito">
              +
            </button>
          `
              : ""
          }
        </div>
      </div>
    </div>
  `
    )
    .join("");

  // Agregar eventos a los botones de carrito
  if (estaLogueado) {
    agregarEventosCarrito(productos);
  }
}

// Función auxiliar para clases de categoría
function getClaseCategoria(categoria) {
  const cat = categoria.toLowerCase();
  if (cat === "bebidas")
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
  if (cat === "lácteos")
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  if (cat === "frutas" || cat === "verduras")
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  if (cat === "carnes")
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  return "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200";
}

// Mostrar error cuando falla la carga de productos
function mostrarErrorProductos() {
  const productosContainer = document.getElementById("productos-container");
  if (!productosContainer) return;

  productosContainer.innerHTML = `
    <div class="col-span-full text-center py-12">
      <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
      <p class="text-gray-500 dark:text-gray-400">Error al cargar los productos</p>
      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
              onclick="window.location.reload()">
        Reintentar
      </button>
    </div>
  `;
}

// Mostrar categorías en el carrusel
function mostrarCategorias(categorias) {
  const categoriasContainer = document.getElementById("categorias-filtros");
  if (!categoriasContainer) return;

  // Crear HTML para categorías y duplicar para efecto infinito
  const categoriasHTML = categorias
    .map(
      (categoria) => `
        <div class="cursor-pointer inline-block text-center p-3 dark:bg-[#100e10] rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center group mx-1 hover:scale-105 min-w-[80px]"
             data-categoria="${categoria}">
          <div class="w-14 h-14 md:w-16 md:h-16 mb-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
            <img src="${
              imagenesCategorias[categoria.toLowerCase()] ||
              imagenesCategorias["todos"]
            }" 
                 alt="${categoria}"
                 class="w-full h-full object-cover hover:scale-110 transition-transform"
                 loading="lazy"
                 >
          </div>
          <p class="font-medium text-xs text-gray-800 dark:text-white">${categoria}</p>
        </div>
      `
    )
    .join("");

  // Duplicar el contenido para el efecto infinito
  categoriasContainer.innerHTML = `
    <div class="flex space-x-4 py-2">
      ${categoriasHTML}${categoriasHTML}
    </div>
  `;

  // Agregar eventos a los filtros de categoría
  document.querySelectorAll("[data-categoria]").forEach((filtro) => {
    filtro.addEventListener("click", () => {
      const categoria = filtro.getAttribute("data-categoria");
      cargarProductos(categoria === "todos" ? null : categoria);
    });
  });
}

// Agregar eventos a los botones de carrito
function agregarEventosCarrito(productos) {
  document.querySelectorAll(".agregar-carrito").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      const producto = productos.find((p) => p.id_producto === id);

      if (producto) {
        // Deshabilitar botón temporalmente
        const boton = e.target;
        boton.disabled = true;
        boton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        try {
          await agregarAlCarrito(producto);
          actualizarContadorCarrito();

          // Feedback visual
          boton.innerHTML = '<i class="fas fa-check"></i>';
          boton.classList.remove("bg-green-600", "hover:bg-green-800");
          boton.classList.add("bg-blue-600");

          // Restaurar botón después de 1.5 segundos
          setTimeout(() => {
            boton.innerHTML = "+";
            boton.classList.remove("bg-blue-600");
            boton.classList.add("bg-green-600", "hover:bg-green-800");
            boton.disabled = false;
          }, 1500);
        } catch (error) {
          console.error("Error al agregar al carrito:", error);
          boton.innerHTML = '<i class="fas fa-times"></i>';
          boton.classList.remove("bg-green-600", "hover:bg-green-800");
          boton.classList.add("bg-red-500");

          setTimeout(() => {
            boton.innerHTML = "+";
            boton.classList.remove("bg-red-500");
            boton.classList.add("bg-green-600", "hover:bg-green-800");
            boton.disabled = false;
          }, 1500);
        }
      }
    });
  });
}

// Inicializar buscador de productos
export function inicializarBuscador() {
  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "search";
  searchInput.placeholder = "Buscar productos...";
  searchInput.className =
    "px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";

  // Insertar en el navbar después del logo
  const navbar = document.querySelector("nav > div");
  if (navbar) {
    navbar.insertBefore(searchInput, navbar.children[1]);
  }

  // Evento de búsqueda con debounce
  let timeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const termino = e.target.value.trim();
      if (termino.length >= 3 || termino.length === 0) {
        cargarProductos(null, termino);
      }
    }, 300);
  });
}
