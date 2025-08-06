// ADMIN.JS
import { estaAutenticado, obtenerRolUsuario, cerrarSesion } from "./auth.js";
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

// Manejo del panel de administración

/**
 * Carga el panel de administración
 */
export async function cargarPanelAdmin() {
  if (!estaAutenticado() || obtenerRolUsuario() !== "admin") {
    return;
  }

  // Ocultar contenido normal y mostrar panel admin
  document.querySelector("main").classList.add("hidden");

  // Crear estructura del panel admin
  const adminPanel = document.createElement("div");
  adminPanel.id = "admin-panel";
  adminPanel.className = "pt-16 container mx-auto px-4 py-8";
  adminPanel.innerHTML = `
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Panel de Administración</h1>
            <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300">
                Cerrar sesión
            </button>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">Productos</h3>
                <p id="total-productos" class="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">Usuarios</h3>
                <p id="total-usuarios" class="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">Ventas</h3>
                <p id="total-ventas" class="text-2xl font-bold text-blue-600 dark:text-blue-400">0</p>
            </div>
            
            <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <h3 class="text-lg font-medium text-gray-800 dark:text-white mb-2">Ingresos</h3>
                <p id="total-ingresos" class="text-2xl font-bold text-blue-600 dark:text-blue-400">S/ 0.00</p>
            </div>
        </div>
        
        <div class="mb-8">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">Productos</h2>
                <button id="nuevo-producto-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-300">
                    <i class="fas fa-plus mr-2"></i>Nuevo Producto
                </button>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Imagen</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="productos-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Productos se cargarán aquí -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <div>
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800 dark:text-white">Usuarios</h2>
            </div>
            
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Usuario</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rol</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="usuarios-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        <!-- Usuarios se cargarán aquí -->
                    </tbody>
                </table>
            </div>
        </div>
    `;

  document.body.appendChild(adminPanel);

  // Configurar eventos
  document.getElementById("logout-btn").addEventListener("click", cerrarSesion);
  document
    .getElementById("nuevo-producto-btn")
    .addEventListener("click", mostrarFormularioProducto);

  // Cargar datos
  await cargarEstadisticasAdmin();
  await cargarProductosAdmin();
  await cargarUsuariosAdmin();
}

/**
 * Carga las estadísticas del panel de administración
 */
async function cargarEstadisticasAdmin() {
  try {
    const token = localStorage.getItem("token");

    // Obtener total de productos
    const productosRes = await fetch(
      "https://funval-backend.onrender.com/productos/?skip=0&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const productos = await productosRes.json();
    document.getElementById("total-productos").textContent = productos.length;

    // Obtener total de usuarios
    const usuariosRes = await fetch(
      "https://funval-backend.onrender.com/usuarios/?skip=0&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const usuarios = await usuariosRes.json();
    document.getElementById("total-usuarios").textContent = usuarios.length;

    // Obtener total de ventas e ingresos
    const ventasRes = await fetch(
      "https://funval-backend.onrender.com/ventas/?skip=0&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const ventas = await ventasRes.json();
    document.getElementById("total-ventas").textContent = ventas.length;

    const ingresos = ventas.reduce((total, venta) => total + venta.total, 0);
    document.getElementById("total-ingresos").textContent =
      formatearPrecio(ingresos);
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

/**
 * Carga los productos en la tabla de administración
 */
async function cargarProductosAdmin() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://funval-backend.onrender.com/productos/?skip=0&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const productos = await response.json();

    const productosContainer = document.getElementById("productos-admin");
    productosContainer.innerHTML = "";

    productos.forEach((producto) => {
      const productoElement = document.createElement("tr");
      productoElement.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap">
                    <img src="${obtenerImagenProducto(
                      producto.id_producto
                    )}" alt="${
        producto.nombre
      }" class="w-10 h-10 rounded-full object-cover">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">${
                  producto.nombre
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${
                  producto.categoria
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${formatearPrecio(
                  producto.precio
                )}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${
                  producto.stock || 0
                }</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3 editar-producto" data-id="${
                      producto.id_producto
                    }">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:hover:text-red-400 eliminar-producto" data-id="${
                      producto.id_producto
                    }">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

      productosContainer.appendChild(productoElement);
    });

    // Agregar eventos a los botones
    document.querySelectorAll(".editar-producto").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("button").getAttribute("data-id"));
        editarProducto(id);
      });
    });

    document.querySelectorAll(".eliminar-producto").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("button").getAttribute("data-id"));
        eliminarProducto(id);
      });
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

/**
 * Carga los usuarios en la tabla de administración
 */
async function cargarUsuariosAdmin() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      "https://funval-backend.onrender.com/usuarios/?skip=0&limit=100",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const usuarios = await response.json();

    const usuariosContainer = document.getElementById("usuarios-admin");
    usuariosContainer.innerHTML = "";

    usuarios.forEach((usuario) => {
      const usuarioElement = document.createElement("tr");
      usuarioElement.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-white">${usuario.username}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${usuario.email}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">${usuario.role}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button class="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 mr-3 editar-usuario" data-id="${usuario.id_usuario}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-600 hover:text-red-900 dark:hover:text-red-400 eliminar-usuario" data-id="${usuario.id_usuario}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

      usuariosContainer.appendChild(usuarioElement);
    });

    // Agregar eventos a los botones
    document.querySelectorAll(".editar-usuario").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("button").getAttribute("data-id"));
        editarUsuario(id);
      });
    });

    document.querySelectorAll(".eliminar-usuario").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.target.closest("button").getAttribute("data-id"));
        eliminarUsuario(id);
      });
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

/**
 * Muestra el formulario para crear/editar un producto
 * @param {number|null} idProducto - ID del producto a editar (null para nuevo)
 */
async function mostrarFormularioProducto(idProducto = null) {
  // Crear modal
  const modal = document.createElement("div");
  modal.id = "producto-modal";
  modal.className =
    "fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4";

  let producto = null;
  if (idProducto) {
    // Cargar datos del producto si estamos editando
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://funval-backend.onrender.com/productos/${idProducto}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      producto = await response.json();
    } catch (error) {
      console.error("Error al cargar producto:", error);
      alert("Error al cargar producto");
      return;
    }
  }

  modal.innerHTML = `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-screen overflow-y-auto">
            <div class="p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800 dark:text-white">
                        ${idProducto ? "Editar Producto" : "Nuevo Producto"}
                    </h3>
                    <button id="close-producto-modal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="producto-form" class="space-y-4">
                    <input type="hidden" id="producto-id" value="${
                      idProducto || ""
                    }">
                    
                    <div>
                        <label for="producto-nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                        <input type="text" id="producto-nombre" required 
                            value="${producto?.nombre || ""}"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    
                    <div>
                        <label for="producto-descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                        <textarea id="producto-descripcion" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">${
                              producto?.descripcion || ""
                            }</textarea>
                    </div>
                    
                    <div>
                        <label for="producto-categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
                        <input type="text" id="producto-categoria" required 
                            value="${producto?.categoria || ""}"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label for="producto-precio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
                            <input type="number" id="producto-precio" step="0.01" min="0" required 
                                value="${producto?.precio || ""}"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        </div>
                        
                        <div>
                            <label for="producto-stock" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                            <input type="number" id="producto-stock" min="0" 
                                value="${producto?.stock || 0}"
                                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                        </div>
                    </div>
                    
                    <div>
                        <label for="producto-imagen" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de la imagen</label>
                        <input type="text" id="producto-imagen" 
                            value="${producto?.imagen_url || ""}"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
                    </div>
                    
                    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300">
                        ${idProducto ? "Actualizar Producto" : "Crear Producto"}
                    </button>
                </form>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Cerrar modal
  document
    .getElementById("close-producto-modal")
    .addEventListener("click", () => {
      document.body.removeChild(modal);
    });

  // Manejar envío del formulario
  document
    .getElementById("producto-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const productoData = {
        nombre: document.getElementById("producto-nombre").value,
        descripcion: document.getElementById("producto-descripcion").value,
        categoria: document.getElementById("producto-categoria").value,
        precio: parseFloat(document.getElementById("producto-precio").value),
        stock: parseInt(document.getElementById("producto-stock").value) || 0,
        imagen_url: document.getElementById("producto-imagen").value,
      };

      try {
        const token = localStorage.getItem("token");
        let response;

        if (idProducto) {
          // Actualizar producto existente
          response = await fetch(
            `https://funval-backend.onrender.com/productos/${idProducto}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(productoData),
            }
          );
        } else {
          // Crear nuevo producto
          response = await fetch(
            "https://funval-backend.onrender.com/productos/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(productoData),
            }
          );
        }

        if (response.ok) {
          alert(
            `Producto ${idProducto ? "actualizado" : "creado"} correctamente`
          );
          document.body.removeChild(modal);
          await cargarProductosAdmin();
          await cargarEstadisticasAdmin();
        } else {
          const errorData = await response.json();
          alert(errorData.detail || "Error al guardar el producto");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al guardar el producto");
      }
    });
}

/**
 * Edita un producto existente
 * @param {number} idProducto - ID del producto a editar
 */
async function editarProducto(idProducto) {
  // Implementar lógica para editar producto
  console.log("Editar producto:", idProducto);
}

/**
 * Elimina un producto
 * @param {number} idProducto - ID del producto a eliminar
 */
async function eliminarProducto(idProducto) {
  if (!confirm("¿Estás seguro de eliminar este producto?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://funval-backend.onrender.com/productos/${idProducto}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Producto eliminado correctamente");
      await cargarProductosAdmin();
      await cargarEstadisticasAdmin();
    } else {
      alert("Error al eliminar producto");
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    alert("Error al eliminar producto");
  }
}

/**
 * Edita un usuario existente
 * @param {number} idUsuario - ID del usuario a editar
 */
async function editarUsuario(idUsuario) {
  // Implementar lógica para editar usuario
  console.log("Editar usuario:", idUsuario);
}

/**
 * Elimina un usuario
 * @param {number} idUsuario - ID del usuario a eliminar
 */
async function eliminarUsuario(idUsuario) {
  if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `https://funval-backend.onrender.com/usuarios/${idUsuario}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.ok) {
      alert("Usuario eliminado correctamente");
      await cargarUsuariosAdmin();
      await cargarEstadisticasAdmin();
    } else {
      alert("Error al eliminar usuario");
    }
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    alert("Error al eliminar usuario");
  }
}
