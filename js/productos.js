// PRODUCTOS.JS
import { agregarAlCarrito, actualizarContadorCarrito } from "./carrito.js";
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

// En productos.js
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

// Cache de productos para evitar múltiples llamadas a la API
let cacheProductos = null;
let cacheCategorias = null;

export async function cargarProductos(categoria = null) {
  try {
    // Usar cache si está disponible
    if (!cacheProductos) {
      const response = await fetch(
        "https://funval-backend.onrender.com/productos/?skip=0&limit=100"
      );
      cacheProductos = await response.json();
    }

    const productosFiltrados = categoria
      ? cacheProductos.filter(
          (p) => p.categoria.toLowerCase() === categoria.toLowerCase()
        )
      : cacheProductos;

    mostrarProductos(productosFiltrados);
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarErrorProductos();
  }
}

export async function cargarCategorias() {
  try {
    if (!cacheCategorias) {
      if (!cacheProductos) {
        const response = await fetch(
          "https://funval-backend.onrender.com/productos/?skip=0&limit=100"
        );
        cacheProductos = await response.json();
      }
      cacheCategorias = [...new Set(cacheProductos.map((p) => p.categoria))];
    }

    mostrarCategorias(cacheCategorias);
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

function mostrarProductos(productos) {
  const productosContainer = document.getElementById("productos-container");

  if (productos.length === 0) {
    productosContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-box-open text-4xl text-gray-400 mb-3"></i>
        <p class="text-gray-500 dark:text-gray-400">No se encontraron productos</p>
      </div>
    `;
    return;
  }

  productosContainer.innerHTML = productos
    .map(
      (producto) => `
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
        <!-- Contenedor de imagen más pequeño -->
        <div class="relative pt-[70%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <img src="${obtenerImagenProducto(producto.id_producto)}" 
               alt="${producto.nombre}"
               class="absolute top-0 left-0 w-full h-full object-contain p-2"
               loading="lazy"
               onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Producto'">
        </div>
        
        <!-- Contenido de la card -->
        <div class="p-3 flex flex-col flex-grow">
          <div class="flex-grow">
            <h3 class="font-semibold text-sm text-gray-800 dark:text-gray-200 mb-1 line-clamp-2" 
                title="${producto.nombre}">${producto.nombre}</h3>
            
            <!-- Categoría más compacta -->
            <span class="inline-block px-2 py-0.5 text-[0.65rem] rounded-full mb-1 
                        ${
                          producto.categoria.toLowerCase() === "bebidas"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : producto.categoria.toLowerCase() === "lácteos"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                        }">
              ${producto.categoria}
            </span>
          </div>
          
          <!-- Precio y botón más compactos -->
          <div class="mt-2">
            <p class="text-md font-bold text-blue-600 dark:text-blue-400 mb-2">
              ${formatearPrecio(producto.precio)}
            </p>
            <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md 
                          text-sm transition duration-300 agregar-carrito"
                    data-id="${producto.id_producto}"
                    aria-label="Agregar ${producto.nombre} al carrito">
              Agregar
            </button>
          </div>
        </div>
      </div>
    `
    )
    .join("");

  agregarEventosCarrito(productos);
}
function mostrarErrorProductos() {
  const productosContainer = document.getElementById("productos-container");
  if (!productosContainer) {
    console.error("No se encontró el contenedor de productos!");
    return;
  }
  productosContainer.innerHTML = `
    <div class="col-span-full text-center py-12">
      <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-3"></i>
      <p class="text-gray-500 dark:text-gray-400">Error al cargar los productos</p>
      <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300"
              onclick="window.app.recargarProductos()">
          Reintentar
      </button>
    </div>
  `;
}

function agregarEventosCarrito(productos) {
  document.querySelectorAll(".agregar-carrito").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = parseInt(e.target.getAttribute("data-id"));
      const producto = productos.find((p) => p.id_producto === id);

      if (producto) {
        // Deshabilitar botón temporalmente
        e.target.disabled = true;
        e.target.innerHTML =
          '<i class="fas fa-spinner fa-spin mr-2"></i> Agregando...';

        try {
          await agregarAlCarrito(producto);
          actualizarContadorCarrito();

          // Feedback visual
          e.target.innerHTML = '<i class="fas fa-check mr-2"></i> ¡Agregado!';
          e.target.classList.remove("bg-blue-600", "hover:bg-blue-700");
          e.target.classList.add("bg-green-500", "hover:bg-green-600");

          // Restaurar botón después de 1.5 segundos
          setTimeout(() => {
            e.target.innerHTML = "Agregar al carrito";
            e.target.classList.remove("bg-green-500", "hover:bg-green-600");
            e.target.classList.add("bg-blue-600", "hover:bg-blue-700");
            e.target.disabled = false;
          }, 1500);
        } catch (error) {
          console.error("Error al agregar al carrito:", error);
          e.target.innerHTML = '<i class="fas fa-times mr-2"></i> Error';
          e.target.classList.remove("bg-blue-600", "hover:bg-blue-700");
          e.target.classList.add("bg-red-500", "hover:bg-red-600");

          setTimeout(() => {
            e.target.innerHTML = "Agregar al carrito";
            e.target.classList.remove("bg-red-500", "hover:bg-red-600");
            e.target.classList.add("bg-blue-600", "hover:bg-blue-700");
            e.target.disabled = false;
          }, 1500);
        }
      }
    });
  });
}

function mostrarCategorias(categorias) {
  const categoriasContainer = document.getElementById("categorias-filtros");

  // Estructura para el carrusel infinito
  categoriasContainer.innerHTML = `
    <div class="relative overflow-hidden">
      <div id="carrusel-categorias" class="flex space-x-4 py-2 animate-scroll-infinite whitespace-nowrap">
        <!-- Duplicamos las categorías para efecto infinito -->
        ${generarItemsCarrusel(categorias)}
        ${generarItemsCarrusel(categorias)}
      </div>
    </div>
  `;

  // Agregar eventos a los filtros
  document.querySelectorAll("[data-categoria]").forEach((filtro) => {
    filtro.addEventListener("click", () => {
      const categoria = filtro.getAttribute("data-categoria");
      const categoriaNormalizada =
        categoria === "todos" ? null : categoria.toLowerCase();
      cargarProductos(categoriaNormalizada);
    });
  });
}

// Función auxiliar para generar los ítems del carrusel
function generarItemsCarrusel(categorias) {
  return `
    <div class="cursor-pointer inline-block text-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center group mx-2"
         data-categoria="todos">
      <div class="w-16 h-16 mb-2 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center overflow-hidden
                  group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
        <img src="https://ejemplo.com/ruta/todos.jpg" alt="Todos" class="w-full h-full object-cover">
      </div>
      <p class="font-medium text-xs text-gray-800 dark:text-white">Todos</p>
    </div>
    
    ${categorias
      .map((categoria) => {
        const imagen =
          imagenesCategorias[categoria.toLowerCase()] ||
          "https://via.placeholder.com/64";

        return `
        <div class="cursor-pointer inline-block text-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center group mx-2"
             data-categoria="${categoria}">
          <div class="w-16 h-16 mb-2 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-600">
            <img src="${imagen}" alt="${categoria}" 
                 class="w-full h-full object-cover hover:scale-105 transition-transform"
                 loading="lazy"
                 onerror="this.onerror=null;this.src='https://via.placeholder.com/64?text=${categoria.substring(
                   0,
                   3
                 )}'">
          </div>
          <p class="font-medium text-xs text-gray-800 dark:text-white">${categoria}</p>
        </div>
      `;
      })
      .join("")}
  `;
}

// Resto de tus funciones (agregarEventosCarrito, mostrarErrorProductos, etc.)
