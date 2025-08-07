//ADMIN.JS
import {
  estaAutenticado,
  obtenerRolUsuario,
  cerrarSesion,
  obtenerToken,
} from "./auth.js";
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";

export async function cargarPanelAdmin() {
  if (!estaAutenticado() || obtenerRolUsuario() !== "admin") {
    window.location.hash = "";
    return;
  }

  document.querySelector("main").classList.add("hidden");

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
          <tbody id="productos-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"></tbody>
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
          <tbody id="usuarios-admin" class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700"></tbody>
        </table>
      </div>
    </div>

    <!-- Modal para crear/editar producto -->
    <div id="producto-modal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 id="producto-modal-title" class="text-xl font-bold text-gray-800 dark:text-white">Nuevo Producto</h3>
          <button id="close-producto-modal" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <form id="producto-form" class="space-y-4">
          <div>
            <label for="producto-nombre" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
            <input type="text" id="producto-nombre" name="nombre" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label for="producto-descripcion" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
            <textarea id="producto-descripcion" name="descripcion" class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"></textarea>
          </div>
          <div>
            <label for="producto-categoria" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
            <input type="text" id="producto-categoria" name="categoria" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label for="producto-precio" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Precio</label>
            <input type="number" id="producto-precio" name="precio" step="0.01" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label for="producto-stock" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
            <input type="number" id="producto-stock" name="stock" required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>
          <input type="hidden" id="producto-id" name="id_producto">
          <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-300">Guardar</button>
        </form>
      </div>
    </div>
  `;

  document.body.appendChild(adminPanel);

  document.getElementById("logout-btn").addEventListener("click", cerrarSesion);
  document.getElementById("refresh-btn").addEventListener("click", async () => {
    await Promise.all([
      cargarEstadisticasAdmin(),
      cargarProductosAdmin(),
      cargarUsuariosAdmin(),
    ]);
  });
  document
    .getElementById("nuevo-producto-btn")
    .addEventListener("click", () => mostrarFormularioProducto());
  document
    .getElementById("close-producto-modal")
    .addEventListener("click", () =>
      document.getElementById("producto-modal").classList.add("hidden")
    );

  await Promise.all([
    cargarEstadisticasAdmin(),
    cargarProductosAdmin(),
    cargarUsuariosAdmin(),
  ]);
}

async function cargarEstadisticasAdmin() {
  try {
    const [productosRes, usuariosRes, ventasRes] = await Promise.all([
      fetch(`${API_BASE_URL}/productos/?skip=0&limit=100`, {
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      }),
      fetch(`${API_BASE_URL}/usuarios/?skip=0&limit=100`, {
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      }),
      fetch(`${API_BASE_URL}/ventas/?skip=0&limit=100`, {
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      }),
    ]);

    const productos = await productosRes.json();
    const usuarios = await usuariosRes.json();
    const ventas = await ventasRes.json();

    const totalIngresos = ventas.reduce((sum, venta) => sum + venta.total, 0);

    document.getElementById("total-productos").textContent = productos.length;
    document.getElementById("total-usuarios").textContent = usuarios.length;
    document.getElementById("total-ventas").textContent = ventas.length;
    document.getElementById("total-ingresos").textContent =
      formatearPrecio(totalIngresos);
  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
}

async function cargarProductosAdmin() {
  try {
    const response = await fetch(
      `${API_BASE_URL}/productos/?skip=0&limit=100`,
      {
        headers: { Authorization: `Bearer ${obtenerToken()}` },
      }
    );
    const productos = await response.json();
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

    document.querySelectorAll(".editar-producto").forEach((btn) => {
      btn.addEventListener("click", () =>
        mostrarFormularioProducto(parseInt(btn.getAttribute("data-id")))
      );
    });

    document.querySelectorAll(".eliminar-producto").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (confirm("¿Seguro que desea eliminar este producto?")) {
          await eliminarProducto(parseInt(btn.getAttribute("data-id")));
        }
      });
    });
  } catch (error) {
    console.error("Error al cargar productos:", error);
  }
}

async function cargarUsuariosAdmin() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/?skip=0&limit=100`, {
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
    const usuarios = await response.json();
    const tbody = document.getElementById("usuarios-admin");

    tbody.innerHTML = usuarios
      .map(
        (usuario) => `
      <tr>
        <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${usuario.username}</td>
        <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${usuario.email}</td>
        <td class="px-6 py-4 text-gray-800 dark:text-gray-200">${usuario.role}</td>
        <td class="px-6 py-4">
          <button class="editar-usuario text-blue-600 hover:text-blue-800 mr-2" data-id="${usuario.id}">
            <i class="fas fa-edit"></i>
          </button>
          <button class="eliminar-usuario text-red-600 hover:text-red-800" data-id="${usuario.id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `
      )
      .join("");

    document.querySelectorAll(".editar-usuario").forEach((btn) => {
      btn.addEventListener("click", () =>
        alert("Funcionalidad de edición de usuario no implementada")
      );
    });

    document.querySelectorAll(".eliminar-usuario").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (confirm("¿Seguro que desea eliminar este usuario?")) {
          await eliminarUsuario(parseInt(btn.getAttribute("data-id")));
        }
      });
    });
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  }
}

async function mostrarFormularioProducto(idProducto = null) {
  const modal = document.getElementById("producto-modal");
  const form = document.getElementById("producto-form");
  const title = document.getElementById("producto-modal-title");

  if (idProducto) {
    title.textContent = "Editar Producto";
    const response = await fetch(`${API_BASE_URL}/productos/${idProducto}`, {
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
    const producto = await response.json();

    document.getElementById("producto-nombre").value = producto.nombre;
    document.getElementById("producto-descripcion").value =
      producto.descripcion || "";
    document.getElementById("producto-categoria").value = producto.categoria;
    document.getElementById("producto-precio").value = producto.precio;
    document.getElementById("producto-stock").value = producto.stock;
    document.getElementById("producto-id").value = producto.id_producto;
  } else {
    title.textContent = "Nuevo Producto";
    form.reset();
    document.getElementById("producto-id").value = "";
  }

  modal.classList.remove("hidden");

  form.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("producto-id").value;
    const datos = {
      nombre: document.getElementById("producto-nombre").value,
      descripcion: document.getElementById("producto-descripcion").value,
      categoria: document.getElementById("producto-categoria").value,
      precio: parseFloat(document.getElementById("producto-precio").value),
      stock: parseInt(document.getElementById("producto-stock").value),
    };

    try {
      const url = id
        ? `${API_BASE_URL}/productos/${id}`
        : `${API_BASE_URL}/productos/`;
      const method = id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${obtenerToken()}`,
        },
        body: JSON.stringify(datos),
      });

      if (response.ok) {
        modal.classList.add("hidden");
        form.reset();
        await cargarProductosAdmin();
        await cargarEstadisticasAdmin();
      } else {
        alert("Error al guardar el producto");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al conectar con el servidor");
    }
  };
}

async function eliminarProducto(idProducto) {
  try {
    const response = await fetch(`${API_BASE_URL}/productos/${idProducto}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });

    if (response.ok) {
      await cargarProductosAdmin();
      await cargarEstadisticasAdmin();
    } else {
      alert("Error al eliminar el producto");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
}

async function eliminarUsuario(idUsuario) {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/${idUsuario}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });

    if (response.ok) {
      await cargarUsuariosAdmin();
      await cargarEstadisticasAdmin();
    } else {
      alert("Error al eliminar el usuario");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error al conectar con el servidor");
  }
}
