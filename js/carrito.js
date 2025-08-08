// carrito
import { estaAutenticado, obtenerToken, obtenerUserId } from "./auth.js";
import {
  formatearPrecio,
  obtenerImagenProducto,
  mostrarError,
  ocultarError,
} from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

export function inicializarCarrito() {
  // Solo inicializar si el usuario está logueado
  if (!estaAutenticado()) {
    ocultarElementosCarrito();
    return;
  }

  const cartBtn = document.getElementById("cart-btn");
  const cartModal = document.getElementById("cart-modal");
  const closeCartModal = document.getElementById("close-cart-modal");
  const checkoutBtn = document.getElementById("checkout-btn");
  const paymentModal = document.getElementById("payment-modal");
  const closePaymentModal = document.getElementById("close-payment-modal");
  const paymentForm = document.getElementById("payment-form");

  // Mostrar el botón del carrito
  if (cartBtn) cartBtn.style.display = "block";

  // Mostrar/ocultar modal del carrito
  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      actualizarCarritoUI();
      cartModal.classList.toggle("hidden");
    });
  }

  // Cerrar modal con el botón X
  if (closeCartModal) {
    closeCartModal.addEventListener("click", () => {
      cartModal.classList.add("hidden");
    });
  }

  // Cerrar modal al hacer clic fuera
  document.addEventListener("click", (e) => {
    const isClickInsideModal = cartModal?.contains(e.target);
    const isClickOnCartButton =
      e.target === cartBtn || cartBtn?.contains(e.target);

    if (!isClickInsideModal && !isClickOnCartButton) {
      cartModal?.classList.add("hidden");
    }
  });

  // Prevenir cierre al hacer clic dentro del modal
  if (cartModal) {
    cartModal.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  }

  // Mostrar modal de pago
  checkoutBtn.addEventListener("click", () => {
    if (carrito.length === 0) return;
    cartModal.classList.add("hidden");
    paymentModal.classList.remove("hidden");
  });

  // Cerrar modal de pago
  closePaymentModal.addEventListener("click", () => {
    paymentModal.classList.add("hidden");
  });

  // Procesar pago
  paymentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await procesarPago();
  });

  // Inicializar carrito desde localStorage
  actualizarContadorCarrito();
}

function ocultarElementosCarrito() {
  const cartBtn = document.getElementById("cart-btn");
  if (cartBtn) cartBtn.style.display = "none";

  // También puedes ocultar otros elementos relacionados al carrito si es necesario
}

export function agregarAlCarrito(producto) {
  if (!estaAutenticado()) {
    alert("Debes iniciar sesión para agregar productos al carrito");
    return;
  }

  const productoExistente = carrito.find(
    (item) => item.id_producto === producto.id_producto
  );

  if (productoExistente) {
    productoExistente.cantidad += 1;
  } else {
    carrito.push({
      ...producto,
      cantidad: 1,
    });
  }

  guardarCarrito();
  actualizarContadorCarrito();
  mostrarNotificacionAgregado(producto.nombre);
}

export function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter((item) => item.id_producto !== idProducto);
  guardarCarrito();
  actualizarContadorCarrito();
  actualizarCarritoUI();
}

export function actualizarCantidadCarrito(idProducto, cantidad) {
  const producto = carrito.find((item) => item.id_producto === idProducto);

  if (producto) {
    if (cantidad <= 0) {
      eliminarDelCarrito(idProducto);
    } else {
      producto.cantidad = cantidad;
      guardarCarrito();
      actualizarCarritoUI();
    }
  }
}

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

export function actualizarContadorCarrito() {
  const cartCount = document.getElementById("cart-count");
  const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.toggle("hidden", totalItems === 0);
  }
}

export function actualizarCarritoUI() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (!cartItems) return;

  if (carrito.length === 0) {
    cartItems.innerHTML =
      '<p class="py-4 text-center text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>';
    cartTotal.textContent = formatearPrecio(0);
    if (checkoutBtn) checkoutBtn.classList.add("hidden");
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove("hidden");

  let total = 0;
  cartItems.innerHTML = "";

  carrito.forEach((item) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const itemElement = document.createElement("div");
    itemElement.className =
      "py-3 flex items-start border-b border-gray-200 dark:border-gray-700";
    itemElement.innerHTML = `
            <div class="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                <img src="${obtenerImagenProducto(item.id_producto)}" 
                     alt="${item.nombre}" 
                     class="max-h-full max-w-full object-contain p-1"
                     onerror="this.src='https://via.placeholder.com/80?text=Producto'">
            </div>
            <div class="ml-3 flex-1">
                <div class="flex justify-between">
                    <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">${
                      item.nombre
                    }</h4>
                    <p class="text-sm font-medium text-gray-800 dark:text-white">${formatearPrecio(
                      subtotal
                    )}</p>
                </div>
                <div class="flex justify-between items-center mt-2">
                    <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md">
                        <button class="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 decrementar-cantidad" 
                                data-id="${item.id_producto}">
                            <i class="fas fa-minus text-xs"></i>
                        </button>
                        <span class="px-2 text-sm text-gray-700 dark:text-gray-300 cantidad-producto">${
                          item.cantidad
                        }</span>
                        <button class="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 incrementar-cantidad" 
                                data-id="${item.id_producto}">
                            <i class="fas fa-plus text-xs"></i>
                        </button>
                    </div>
                    <button class="text-red-500 hover:text-red-700 dark:hover:text-red-400 eliminar-producto" 
                            data-id="${item.id_producto}">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            </div>
        `;

    cartItems.appendChild(itemElement);
  });

  // Agregar eventos a los botones
  agregarEventosCarrito();

  if (cartTotal) cartTotal.textContent = formatearPrecio(total);
}

function agregarEventosCarrito() {
  document.querySelectorAll(".incrementar-cantidad").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.closest("button").getAttribute("data-id"));
      const producto = carrito.find((item) => item.id_producto === id);
      if (producto) {
        actualizarCantidadCarrito(id, producto.cantidad + 1);
      }
    });
  });

  document.querySelectorAll(".decrementar-cantidad").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.closest("button").getAttribute("data-id"));
      const producto = carrito.find((item) => item.id_producto === id);
      if (producto) {
        actualizarCantidadCarrito(id, producto.cantidad - 1);
      }
    });
  });

  document.querySelectorAll(".eliminar-producto").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = parseInt(e.target.closest("button").getAttribute("data-id"));
      eliminarDelCarrito(id);
    });
  });
}

async function procesarPago() {
  const paymentModal = document.getElementById("payment-modal");
  const paymentError = document.getElementById("payment-error");

  try {
    // Validar datos de pago (simplificado)
    const cardName = document.getElementById("card-name").value.trim();
    const cardNumber = document.getElementById("card-number").value.trim();

    if (!cardName || !cardNumber) {
      mostrarError(paymentError, "Por favor complete todos los campos");
      return;
    }

    // Crear objeto de venta
    const venta = {
      detalles: carrito.map((item) => ({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })),
    };

    // Enviar a la API
    const response = await fetch(`${API_BASE_URL}/ventas/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${obtenerToken()}`,
      },
      body: JSON.stringify(venta),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Error al procesar el pago");
    }

    // Limpiar carrito después de éxito
    carrito = [];
    guardarCarrito();
    actualizarContadorCarrito();
    actualizarCarritoUI();

    // Cerrar modales y mostrar mensaje
    paymentModal.classList.add("hidden");
    ocultarError(paymentError);

    // Mostrar notificación de éxito
    mostrarNotificacion("¡Compra realizada con éxito!", "success");
  } catch (error) {
    console.error("Error al procesar pago:", error);
    mostrarError(paymentError, error.message || "Error al procesar el pago");
  }
}

function mostrarNotificacionAgregado(nombreProducto) {
  const notification = document.createElement("div");
  notification.className =
    "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center animate-fade-in-up";
  notification.innerHTML = `
        <i class="fas fa-check-circle mr-2"></i>
        <span>${nombreProducto} agregado al carrito</span>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("animate-fade-in-up");
    notification.classList.add("animate-fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}

function mostrarNotificacion(mensaje, tipo = "success") {
  const notification = document.createElement("div");
  notification.className = `fixed bottom-4 right-4 ${
    tipo === "success" ? "bg-green-500" : "bg-red-500"
  } text-white px-4 py-2 rounded-md shadow-lg flex items-center animate-fade-in-up`;
  notification.innerHTML = `
        <i class="fas ${
          tipo === "success" ? "fa-check-circle" : "fa-exclamation-circle"
        } mr-2"></i>
        <span>${mensaje}</span>
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.remove("animate-fade-in-up");
    notification.classList.add("animate-fade-out");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}
