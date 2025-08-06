// CARRITO.JS
import { formatearPrecio, obtenerImagenProducto } from "./utils.js";

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

export function inicializarCarrito() {
  const cartBtn = document.getElementById("cart-btn");
  const cartModal = document.getElementById("cart-modal");
  const closeCartModal = document.getElementById("close-cart-modal");
  const checkoutBtn = document.getElementById("checkout-btn");
  const paymentModal = document.getElementById("payment-modal");
  const closePaymentModal = document.getElementById("close-payment-modal");

  // Mostrar/ocultar modal del carrito
  cartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    actualizarCarritoUI();
    cartModal.classList.toggle("hidden");
  });

  // Cerrar modal con el botón X
  closeCartModal.addEventListener("click", () => {
    cartModal.classList.add("hidden");
  });

  // Cerrar modal al hacer clic fuera
  document.addEventListener("click", (e) => {
    const isClickInsideModal = cartModal.contains(e.target);
    const isClickOnCartButton =
      e.target === cartBtn || cartBtn.contains(e.target);

    if (!isClickInsideModal && !isClickOnCartButton) {
      cartModal.classList.add("hidden");
    }
  });

  // Prevenir cierre al hacer clic dentro del modal
  cartModal.addEventListener("click", (e) => {
    e.stopPropagation();
  });

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

  // Inicializar carrito desde localStorage
  actualizarContadorCarrito();
}

export function agregarAlCarrito(producto) {
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

  // Mostrar feedback visual
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

  cartCount.textContent = totalItems;
  cartCount.classList.toggle("hidden", totalItems === 0);
}

export function actualizarCarritoUI() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");

  if (carrito.length === 0) {
    cartItems.innerHTML =
      '<p class="py-4 text-center text-gray-500 dark:text-gray-400">Tu carrito está vacío</p>';
    cartTotal.textContent = formatearPrecio(0);
    checkoutBtn.classList.add("hidden");
    return;
  }

  checkoutBtn.classList.remove("hidden");

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

  cartTotal.textContent = formatearPrecio(total);
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
