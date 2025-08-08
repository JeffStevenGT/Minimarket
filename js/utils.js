/**
 * UTILS.JS - Módulo de funciones utilitarias compartidas
 * Contiene funciones de uso común en toda la aplicación
 */

// Constantes globales
export const API_BASE_URL = "https://funval-backend.onrender.com";
export const API_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJrZXZpbmRhbmRyZXciLCJyb2wiOiJhZG1pbmlzdHJhZG9yIiwiZXhwIjoxNzU0NTg0NTc3fQ.jIh8dvM9qrQEtjQXnYK-y52p5boMz75dGtI57fIhUKI";

/**
 * Formatea un precio a formato monetario peruano (PEN - S/)
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado con símbolo de soles
 */
export function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(precio || 0);
}

/**
 * Obtiene la URL de la imagen de un producto basado en su ID
 * @param {number} idProducto - ID del producto
 * @returns {string} URL de la imagen del producto
 */
export function obtenerImagenProducto(idProducto) {
  // Mapeo de imágenes específicas por ID de producto
  const imagenesEspecificas = {
    1: "https://costenoalimentos.com.pe/media/641/PgoqgZ3EPHwtiJ7oPbftXXce9Gx8pgA7nHxd2r02.png", // Arroz
    2: "https://www.reinsac.com/wp-content/uploads/2020/06/584580.png", // Aceite
    3: "https://delivemas.fac.pe/web/image/product.product/4467/image", // Leche
    4: "https://images.squarespace-cdn.com/content/v1/5d4c75052f957a000169e9fe/09aecf45-340c-4a62-a44e-8ea73a42b0e9/02.png", // Huevos
    5: "https://www.union.pe/wp-content/uploads/2023/05/INTEGRAL-S_F-web.png", // Pan
    6: "https://delsurcongelados.cl/wp-content/uploads/2021/11/Pechuga-Deshuesada-Super-Pollo.png", // Pollo
    7: "https://www.campomar.com.pe/img/produts/solido-de-caballa.png", // Atún
    8: "https://mercafreshperu.com/wp-content/uploads/2024/02/Manzana-Delicia.webp", // Manzana
    9: "https://mercafreshperu.com/wp-content/uploads/2024/02/Platano-Seda-Organico.webp", // Plátano
    10: "https://labodega.com.pe/Adminbackend/fotos/producto15771.jpg", // Yogurt
    11: "https://adex-b2peru.s3.amazonaws.com/userfiles/product/photos/8630_5f7206cf1c62c.png", // Queso
    12: "https://www.palmolive.com.pe/content/dam/cp-sites/personal-care/palmolive-latam/redesign-2020/pdp/mandarina-romero/envoltura-jabon-palmolive-naturals-mandarina-romero-front-d-mx.png", // Jabón
    13: "https://www.suavemashigiene.com/-/media/project/site/products/aromas/suave-aromas-2-rollos-flores-del-valle-sagrado.png", // Papel higiénico
    14: "https://www.lanuestraperu.com/wp-content/uploads/CAJA-CEREAL-7S-CACAO@2x-1.png", // Cereales
    15: "https://www.union.pe/wp-content/uploads/2023/05/Galleta-nar.png", // Galletas
    16: "https://www.licoresbrisol.com.pe/web/webimg/1618_1_1000.png", // Coca Cola
    17: "https://group-ism.com/wp-content/uploads/2023/07/cielo-sin-gas2.png", // Agua
    18: "https://laiberica.com.pe/files/productos/presentaciones/20200127105604.png", // Chocolate
    19: "https://www.dentaidcomprasonline.pe/406-large_default/pasta-vitis-cpc-protect-100-ml.jpg", // Pasta dental
    20: "https://images.ctfassets.net/fdzk4n7nu51v/5O8NjbrxC6nV69UaMMaKZA/f8c34cc4d592ebcdd4dc84426e911e39/Render_Ace_Lavanda_3000_Packshot_Front_Clean_286x288.png", // Detergente
    21: "https://images.rappi.pe/products/1669323880748_1669323878554_1669323881778.png", // Saladitas
    23: "https://www.agropesa.com.ec/wp-content/uploads/2020/02/Agropesa-07-Mix-Parrillero.png", // Chorizo
  };

  return (
    imagenesEspecificas[idProducto] ||
    "https://diccionarioactual.com/wp-content/uploads/2017/10/disponible-768x768.png"
  );
}

/**
 * Muestra un mensaje de error en un elemento del DOM
 * @param {HTMLElement} element - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error a mostrar
 */
export function mostrarError(element, message) {
  if (!element) return;

  element.textContent = message;
  element.classList.remove("hidden");
  element.classList.add("animate-shake");

  setTimeout(() => {
    element.classList.remove("animate-shake");
  }, 500);
}

/**
 * Oculta un mensaje de error en un elemento del DOM
 * @param {HTMLElement} element - Elemento que contiene el error
 */
export function ocultarError(element) {
  if (!element) return;

  element.textContent = "";
  element.classList.add("hidden");
}

/**
 * Procesa un mensaje de error de la API y lo devuelve en formato legible
 * @param {string|object|Array} detail - Detalle del error de la API
 * @returns {string} Mensaje de error procesado
 */
export function procesarMensajeError(detail) {
  if (!detail) return "Error desconocido";

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || JSON.stringify(item)).join(", ");
  }

  if (typeof detail === "object") {
    return detail.msg || detail.error || JSON.stringify(detail);
  }

  return "Error en la operación";
}

/**
 * Muestra una notificación toast en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (success, error, warning)
 * @param {number} duration - Duración en milisegundos (opcional)
 */
export function mostrarNotificacion(
  message,
  type = "success",
  duration = 3000
) {
  const container = document.createElement("div");
  container.className = `fixed bottom-4 right-4 z-50 transition-all duration-300 transform translate-y-4 opacity-0`;

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  const icons = {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  };

  container.innerHTML = `
        <div class="${
          colors[type] || colors.info
        } text-white px-4 py-2 rounded-md shadow-lg flex items-center">
            <i class="fas ${icons[type] || icons.info} mr-2"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(container);

  // Animación de entrada
  setTimeout(() => {
    container.classList.remove("translate-y-4", "opacity-0");
    container.classList.add("translate-y-0", "opacity-100");
  }, 10);

  // Animación de salida después de la duración
  setTimeout(() => {
    container.classList.remove("translate-y-0", "opacity-100");
    container.classList.add("translate-y-4", "opacity-0");

    // Eliminar el elemento después de la animación
    setTimeout(() => {
      container.remove();
    }, 300);
  }, duration);
}

/**
 * Valida si un string es un email válido
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido, false si no
 */
export function validarEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/**
 * Valida si un string es un número de teléfono válido (básico)
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido, false si no
 */
export function validarTelefono(telefono) {
  const re = /^[0-9]{9,15}$/;
  return re.test(String(telefono).trim());
}

/**
 * Debounce para limitar la frecuencia de ejecución de funciones
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounceada
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Formatea una fecha a formato legible
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada (ej: "15/08/2023, 10:30 AM")
 */
export function formatearFecha(fecha) {
  if (!fecha) return "--/--/----";

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };

  return new Date(fecha).toLocaleString("es-PE", options);
}

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String a capitalizar
 * @returns {string} String capitalizado
 */
export function capitalizar(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Genera un ID único simple
 * @returns {string} ID único
 */
export function generarIdUnico() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Maneja errores de fetch de forma centralizada
 * @param {Response} response - Objeto Response de fetch
 * @returns {Promise} Promesa con los datos o error
 */
export function manejarErrorFetch(response) {
  if (!response.ok) {
    return response.json().then((err) => {
      throw new Error(procesarMensajeError(err.detail || err));
    });
  }
  return response.json();
}

/**
 * Verifica si un objeto está vacío
 * @param {object} obj - Objeto a verificar
 * @returns {boolean} True si está vacío, false si no
 */
export function estaVacio(obj) {
  return Object.keys(obj).length === 0;
}

/**
 * Limpia y trimea los valores de un objeto
 * @param {object} obj - Objeto a limpiar
 * @returns {object} Objeto limpio
 */
export function limpiarObjeto(obj) {
  const cleanObj = {};
  for (const key in obj) {
    if (typeof obj[key] === "string") {
      cleanObj[key] = obj[key].trim();
    } else {
      cleanObj[key] = obj[key];
    }
  }
  return cleanObj;
}
