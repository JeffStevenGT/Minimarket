// PRODUCTOS.JS
import { agregarAlCarrito, actualizarContadorCarrito } from "./carrito.js";
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

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
            <div class="relative pt-[100%] bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <img src="${obtenerImagenProducto(producto.id_producto)}" 
                     alt="${producto.nombre}"
                     class="absolute top-0 left-0 w-full h-full object-contain p-4"
                     loading="lazy"
                     onerror="this.onerror=null;this.src='https://via.placeholder.com/300?text=Producto'">
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <div class="flex-grow">
                    <h3 class="font-semibold text-gray-800 dark:text-gray-200 mb-1 line-clamp-2" title="${
                      producto.nombre
                    }">${producto.nombre}</h3>
                    <span class="inline-block px-2 py-1 text-xs rounded-full mb-2 
                                ${
                                  producto.categoria.toLowerCase() === "bebidas"
                                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    : producto.categoria.toLowerCase() ===
                                      "lácteos"
                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                                }">
                        ${producto.categoria}
                    </span>
                </div>
                <div class="mt-auto">
                    <p class="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3">${formatearPrecio(
                      producto.precio
                    )}</p>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300 agregar-carrito"
                            data-id="${producto.id_producto}"
                            aria-label="Agregar ${producto.nombre} al carrito">
                        Agregar al carrito
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
      <div class="w-12 h-12 mb-2 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center
                  group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
        <i class="fas fa-boxes text-blue-600 dark:text-blue-300"></i>
      </div>
      <p class="font-medium text-xs text-gray-800 dark:text-white">Todos</p>
    </div>
    
    ${categorias
      .map((categoria) => {
        const icono = obtenerIconoCategoria(categoria);
        const color = obtenerColorCategoria(categoria);

        return `
        <div class="cursor-pointer inline-block text-center p-3 bg-white dark:bg-gray-700 rounded-lg shadow hover:shadow-md transition-all flex flex-col items-center group mx-2"
             data-categoria="${categoria}">
          <div class="w-12 h-12 mb-2 rounded-full ${color.bg} ${color.hoverBg} flex items-center justify-center transition-colors">
            <i class="fas fa-${icono} ${color.text}"></i>
          </div>
          <p class="font-medium text-xs text-gray-800 dark:text-white">${categoria}</p>
        </div>
      `;
      })
      .join("")}
  `;
}

function obtenerIconoCategoria(categoria) {
  const mapaIconos = {
    bebidas: "wine-bottle",
    lácteos: "cheese",
    carnes: "drumstick-bite",
    frutas: "apple-alt",
    verduras: "carrot",
    limpieza: "broom",
    higiene: "soap",
    panadería: "bread-slice",
    congelados: "snowflake",
    enlatados: "can-food",
  };

  return mapaIconos[categoria.toLowerCase()] || "shopping-basket";
}

function obtenerColorCategoria(categoria) {
  const colores = {
    bebidas: {
      bg: "bg-blue-100 dark:bg-blue-900",
      hoverBg: "group-hover:bg-blue-200 dark:group-hover:bg-blue-800",
      text: "text-blue-600 dark:text-blue-300",
    },
    lácteos: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      hoverBg: "group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800",
      text: "text-yellow-600 dark:text-yellow-300",
    },
    carnes: {
      bg: "bg-red-100 dark:bg-red-900",
      hoverBg: "group-hover:bg-red-200 dark:group-hover:bg-red-800",
      text: "text-red-600 dark:text-red-300",
    },
    frutas: {
      bg: "bg-green-100 dark:bg-green-900",
      hoverBg: "group-hover:bg-green-200 dark:group-hover:bg-green-800",
      text: "text-green-600 dark:text-green-300",
    },
    verduras: {
      bg: "bg-lime-100 dark:bg-lime-900",
      hoverBg: "group-hover:bg-lime-200 dark:group-hover:bg-lime-800",
      text: "text-lime-600 dark:text-lime-300",
    },
    default: {
      bg: "bg-gray-100 dark:bg-gray-600",
      hoverBg: "group-hover:bg-gray-200 dark:group-hover:bg-gray-500",
      text: "text-gray-600 dark:text-gray-300",
    },
  };

  const categoriaLower = categoria.toLowerCase();
  return colores[categoriaLower] || colores.default;
}

// Resto de tus funciones (agregarEventosCarrito, mostrarErrorProductos, etc.)
