//ADMIN.JS
import {
  estaAutenticado,
  obtenerRolUsuario,
  obtenerToken,
  cerrarSesion,
} from "./auth.js";
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";
const API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

export async function cargarPanelAdmin() {
  console.log("Ejecutando cargarPanelAdmin...");
  console.log("Autenticado:", estaAutenticado(), "Rol:", obtenerRolUsuario());

  if (!estaAutenticado() || obtenerRolUsuario() !== "administrador") {
    console.log("Acceso denegado, redirigiendo...");
    window.location.hash = "";
    document.querySelector("main").classList.remove("hidden");
    window.app.recargarProductos();
    return;
  }

  // Ocultar contenido principal
  document.querySelector("main").classList.add("hidden");

  // Crear estructura del panel
  const adminPanel = document.createElement("div");
  adminPanel.id = "admin-panel";
  adminPanel.className = "pt-16 container mx-auto px-4 py-8";
  adminPanel.innerHTML = `
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800 dark:text-white">Panel de Administración</h1>
      <div>
        <button id="logout-btn" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300 mr-4">
          Cerrar sesión
        </button>
        <button id="refresh-btn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300">
          <i class="fas fa-sync-alt mr-2"></i>Actualizar
        </button>
      </div>
    </div>
    
    <!-- Estadísticas -->
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
    
    <!-- Sección de Productos -->
    <div class="mb-8 max-h-[500px] overflow-y-auto">
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
          <tbody id="productos-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"></tbody>
        </table>
      </div>
    </div>
    
    <!-- Sección de Usuarios -->
    <div class="mb-8 max-h-[500px] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-gray-800 dark:text-white">Usuarios</h2>
        <button id="nuevo-usuario-btn" class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition duration-300">
          <i class="fas fa-plus mr-2"></i>Nuevo Usuario
        </button>
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
          <tbody id="usuarios-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"></tbody>
        </table>
      </div>
    </div>

    <!-- Modal Producto -->
    <div id="producto-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 id="producto-modal-title" class="text-xl font-bold text-gray-800 dark:text-white">Nuevo Producto</h3>
          <button id="close-producto-modal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form id="producto-form" class="space-y-4">
          <input type="hidden" id="producto-id">
          <div>
            <label for="producto-nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" id="producto-nombre" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="producto-descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea id="producto-descripcion" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div>
            <label for="producto-categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <input type="text" id="producto-categoria" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="producto-precio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
            <input type="number" id="producto-precio" step="0.01" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="producto-stock" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
            <input type="number" id="producto-stock" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300">
            Guardar
          </button>
        </form>
      </div>
    </div>

    <!-- Modal Usuario -->
    <div id="usuario-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 id="usuario-modal-title" class="text-xl font-bold text-gray-800 dark:text-white">Nuevo Usuario</h3>
          <button id="close-usuario-modal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form id="usuario-form" class="space-y-4">
          <input type="hidden" id="usuario-id">
          <div>
            <label for="usuario-nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de usuario</label>
            <input type="text" id="usuario-nombre" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="usuario-completo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre completo</label>
            <input type="text" id="usuario-completo" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="usuario-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input type="email" id="usuario-email" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="usuario-telefono" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
            <input type="text" id="usuario-telefono" required class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <div>
            <label for="usuario-rol" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
            <select id="usuario-rol" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="comprador">Comprador</option>
              <option value="administrador">Administrador</option>
            </select>
          </div>
          <div id="usuario-password-container">
            <label for="usuario-password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
            <input type="password" id="usuario-password" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
          </div>
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300">
            Guardar
          </button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(adminPanel);

  // Event listeners
  document.getElementById("logout-btn").addEventListener("click", cerrarSesion);
  document
    .getElementById("refresh-btn")
    .addEventListener("click", actualizarPanel);
  document
    .getElementById("nuevo-producto-btn")
    .addEventListener("click", () => mostrarFormularioProducto());
  document
    .getElementById("nuevo-usuario-btn")
    .addEventListener("click", () => mostrarFormularioUsuario());
  document
    .getElementById("close-producto-modal")
    .addEventListener("click", () =>
      document.getElementById("producto-modal").classList.add("hidden")
    );
  document
    .getElementById("close-usuario-modal")
    .addEventListener("click", () =>
      document.getElementById("usuario-modal").classList.add("hidden")
    );

  // Inicializar panel
  await actualizarPanel();

  // CRUD Productos
  async function cargarProductos() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/productos/?skip=0&limit=100`,
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );
      const productos = await response.json();

      document.getElementById("total-productos").textContent = productos.length;

      const tbody = document.getElementById("productos-admin");
      tbody.innerHTML = productos
        .map(
          (producto) => `
        <tr>
          <td class="px-6 py-4">
            <img src="${obtenerImagenProducto(producto.id_producto)}" alt="${
            producto.nombre
          }" class="w-12 h-12 object-contain">
          </td>
          <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${
            producto.nombre
          }</td>
          <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${
            producto.categoria
          }</td>
          <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${formatearPrecio(
            producto.precio
          )}</td>
          <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${
            producto.stock
          }</td>
          <td class="px-6 py-4">
            <button class="editar-producto text-blue-600 hover:text-blue-800 mr-2" data-id="${
              producto.id_producto
            }">
              <i class="fas fa-edit"></i>
            </button>
            <button class="eliminar-producto text-red-600 hover:text-red-800" data-id="${
              producto.id_producto
            }">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `
        )
        .join("");

      // Eventos para botones de productos
      document.querySelectorAll(".editar-producto").forEach((btn) => {
        btn.addEventListener("click", () =>
          mostrarFormularioProducto(parseInt(btn.dataset.id))
        );
      });

      document.querySelectorAll(".eliminar-producto").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (confirm("¿Eliminar este producto?")) {
            await eliminarProducto(parseInt(btn.dataset.id));
            await actualizarPanel();
          }
        });
      });
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  }

  async function crearProducto(datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obtenerToken()}`,
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear producto");
      }

      return true;
    } catch (error) {
      console.error("Error al crear producto:", error);
      alert(error.message || "Error al crear producto");
      return false;
    }
  }

  async function actualizarProducto(id, datos) {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obtenerToken()}`, // Usar token dinámico
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error en la respuesta de la API:", errorData);
        throw new Error(errorData.detail || "Error al actualizar producto");
      }

      return true;
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      alert(error.message || "Error al actualizar producto");
      return false;
    }
  }

  async function eliminarProducto(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar producto");
      }

      return true;
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert(error.message || "Error al eliminar producto");
      return false;
    }
  }

  async function mostrarFormularioProducto(id = null) {
    const modal = document.getElementById("producto-modal");
    const form = document.getElementById("producto-form");
    const title = document.getElementById("producto-modal-title");

    if (id) {
      title.textContent = "Editar Producto";
      try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });
        const producto = await response.json();

        document.getElementById("producto-id").value = producto.id_producto;
        document.getElementById("producto-nombre").value = producto.nombre;
        document.getElementById("producto-descripcion").value =
          producto.descripcion || "";
        document.getElementById("producto-categoria").value =
          producto.categoria;
        document.getElementById("producto-precio").value = producto.precio;
        document.getElementById("producto-stock").value = producto.stock;
      } catch (error) {
        console.error("Error al cargar producto:", error);
      }
    } else {
      title.textContent = "Nuevo Producto";
      form.reset();
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        nombre_usuario: document.getElementById("usuario-nombre").value.trim(),
        nombre_completo: document
          .getElementById("usuario-completo")
          .value.trim(),
        correo: document.getElementById("usuario-email").value.trim(),
        telefono: document.getElementById("usuario-telefono").value.trim(),
        rol: document.getElementById("usuario-rol").value,
      };

      const password = document.getElementById("usuario-password").value.trim();
      if (!id) {
        // Solo validar contraseña para nuevos usuarios
        if (!password) {
          alert("La contraseña es requerida para nuevos usuarios");
          return;
        }
        datos.contraseña = password;
      }

      // Validar datos
      if (
        !datos.nombre_usuario ||
        !datos.nombre_completo ||
        !validarEmail(datos.correo) ||
        !validarTelefono(datos.telefono)
      ) {
        alert("Por favor, completa todos los campos con valores válidos.");
        return;
      }

      const id = document.getElementById("usuario-id").value;
      const success = id
        ? await actualizarUsuario(id, datos)
        : await crearUsuario(datos);

      if (success) {
        modal.classList.add("hidden");
        await actualizarPanel();
      }
    };

    modal.classList.remove("hidden");
  }

  // CRUD Usuarios - Implementación completa
  async function cargarUsuarios() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/usuarios/?skip=0&limit=100`,
        {
          headers: { Authorization: `Bearer ${obtenerToken()}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al cargar usuarios");
      }
      const usuarios = await response.json();

      document.getElementById("total-usuarios").textContent = usuarios.length;

      const tbody = document.getElementById("usuarios-admin");
      tbody.innerHTML = usuarios
        .map(
          (usuario) => `
          <tr>
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${
                usuario.nombre_usuario
              }</td>
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${
                usuario.correo
              }</td>
              <td class="px-6 py-4 text-gray-800 dark:text-gray-200">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    usuario.rol === "administrador"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }">
                      ${usuario.rol}
                  </span>
              </td>
              <td class="px-6 py-4">
                  <button class="editar-usuario text-blue-600 hover:text-blue-800 mr-2" data-id="${
                    usuario.id_usuario
                  }">
                      <i class="fas fa-edit"></i>
                  </button>
                  <button class="eliminar-usuario text-red-600 hover:text-red-800" data-id="${
                    usuario.id_usuario
                  }">
                      <i class="fas fa-trash"></i>
                  </button>
              </td>
          </tr>
      `
        )
        .join("");

      // Eventos para botones de usuarios
      document.querySelectorAll(".editar-usuario").forEach((btn) => {
        btn.addEventListener("click", () =>
          mostrarFormularioUsuario(parseInt(btn.dataset.id))
        );
      });

      document.querySelectorAll(".eliminar-usuario").forEach((btn) => {
        btn.addEventListener("click", async () => {
          if (confirm("¿Eliminar este usuario?")) {
            await eliminarUsuario(parseInt(btn.dataset.id));
            await actualizarPanel();
          }
        });
      });
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      alert(error.message || "Error al cargar usuarios");
    }
  }

  async function crearUsuario(datos) {
    try {
      // Determinar el endpoint correcto según el rol
      const endpoint =
        datos.rol === "administrador"
          ? `${API_BASE_URL}/registro-admin`
          : `${API_BASE_URL}/registro-comprador`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obtenerToken()}`,
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error en la respuesta de la API:", errorData);
        throw new Error(errorData.detail || "Error al actualizar producto");
      }

      return true;
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert(error.message || "Error al crear usuario");
      return false;
    }
  }

  async function actualizarUsuario(id, datos) {
    try {
      // Eliminamos la contraseña si está vacía
      if (!datos.contraseña || datos.contraseña.trim() === "") {
        delete datos.contraseña;
      }

      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(datos),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error en la respuesta de la API:", errorData);
        throw new Error(errorData.detail || "Error al actualizar producto");
      }

      return true;
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
      alert(error.message || "Error al actualizar usuario");
      return false;
    }
  }

  async function eliminarUsuario(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${API_TOKEN}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error en la respuesta de la API:", errorData);
        throw new Error(errorData.detail || "Error al actualizar producto");
      }

      return true;
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert(error.message || "Error al eliminar usuario");
      return false;
    }
  }

  async function mostrarFormularioUsuario(id = null) {
    const modal = document.getElementById("usuario-modal");
    const form = document.getElementById("usuario-form");
    const title = document.getElementById("usuario-modal-title");
    const passwordContainer = document.getElementById(
      "usuario-password-container"
    );

    if (id) {
      title.textContent = "Editar Usuario";
      passwordContainer.classList.add("hidden"); // Ocultar campo de contraseña en edición

      try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        });
        const usuario = await response.json();

        document.getElementById("usuario-id").value = usuario.id_usuario;
        document.getElementById("usuario-nombre").value =
          usuario.nombre_usuario;
        document.getElementById("usuario-completo").value =
          usuario.nombre_completo;
        document.getElementById("usuario-email").value = usuario.correo;
        document.getElementById("usuario-telefono").value = usuario.telefono;
        document.getElementById("usuario-rol").value = usuario.rol;
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("Error al cargar datos del usuario");
      }
    } else {
      title.textContent = "Nuevo Usuario";
      passwordContainer.classList.remove("hidden"); // Mostrar campo de contraseña para nuevo usuario
      form.reset();
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const datos = {
        nombre_usuario: document.getElementById("usuario-nombre").value,
        nombre_completo: document.getElementById("usuario-completo").value,
        correo: document.getElementById("usuario-email").value,
        telefono: document.getElementById("usuario-telefono").value,
        rol: document.getElementById("usuario-rol").value,
      };

      // Solo agregar contraseña si es nuevo usuario o se especificó una
      const password = document.getElementById("usuario-password").value;
      if (password) {
        datos.contraseña = password;
      }

      const id = document.getElementById("usuario-id").value;
      const success = id
        ? await actualizarUsuario(id, datos)
        : await crearUsuario(datos);

      if (success) {
        modal.classList.add("hidden");
        await actualizarPanel();
      }
    };

    modal.classList.remove("hidden");
  }

  // Función para actualizar todo el panel
  async function actualizarPanel() {
    try {
      await cargarProductos();
    } catch (error) {
      console.error("Error al actualizar productos:", error);
      alert("Error al actualizar productos");
    }
    try {
      await cargarUsuarios();
    } catch (error) {
      console.error("Error al actualizar usuarios:", error);
      alert("Error al actualizar usuarios");
    }
  }
}

