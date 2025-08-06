// UTILS.JS
// Funciones utilitarias compartidas

/**
 * Muestra un mensaje de error en un elemento
 * @param {HTMLElement} element - Elemento donde mostrar el error
 * @param {string} message - Mensaje de error
 */
export function mostrarError(element, message) {
  element.textContent = message;
  element.classList.remove("hidden");
}

/**
 * Oculta un mensaje de error
 * @param {HTMLElement} element - Elemento que contiene el error
 */
export function ocultarError(element) {
  element.textContent = "";
  element.classList.add("hidden");
}

/**
 * Formatea un precio a formato monetario
 * @param {number} precio - Precio a formatear
 * @returns {string} Precio formateado
 */
export function formatearPrecio(precio) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(precio);
}

/**
 * Obtiene la imagen de un producto basado en su ID
 * @param {number} idProducto - ID del producto
 * @returns {string} URL de la imagen
 */
export function obtenerImagenProducto(idProducto) {
  const productosConImagen = [
    {
      id_producto: 18,
      imagen:
        "https://laiberica.com.pe/files/productos/presentaciones/20200127105604.png",
    }, // Chocolate
    {
      id_producto: 19,
      imagen:
        "https://www.dentaidcomprasonline.pe/406-large_default/pasta-vitis-cpc-protect-100-ml.jpg",
    }, // Pasta dental
    {
      id_producto: 20,
      imagen:
        "https://images.ctfassets.net/fdzk4n7nu51v/5O8NjbrxC6nV69UaMMaKZA/f8c34cc4d592ebcdd4dc84426e911e39/Render_Ace_Lavanda_3000_Packshot_Front_Clean_286x288.png?fm=webp&q=60",
    }, // Detergente
    {
      id_producto: 1,
      imagen:
        "https://costenoalimentos.com.pe/media/641/PgoqgZ3EPHwtiJ7oPbftXXce9Gx8pgA7nHxd2r02.png",
    }, // Arroz
    {
      id_producto: 2,
      imagen: "https://www.reinsac.com/wp-content/uploads/2020/06/584580.png",
    }, // Aceite
    {
      id_producto: 3,
      imagen: "https://delivemas.fac.pe/web/image/product.product/4467/image",
    }, // Leche
    {
      id_producto: 4,
      imagen:
        "https://images.squarespace-cdn.com/content/v1/5d4c75052f957a000169e9fe/09aecf45-340c-4a62-a44e-8ea73a42b0e9/02.png?format=500w",
    }, // Huevos
    {
      id_producto: 5,
      imagen:
        "https://www.union.pe/wp-content/uploads/2023/05/INTEGRAL-S_F-web.png",
    }, // Pan
    {
      id_producto: 6,
      imagen:
        "https://delsurcongelados.cl/wp-content/uploads/2021/11/Pechuga-Deshuesada-Super-Pollo.png",
    }, // Pollo
    {
      id_producto: 7,
      imagen: "https://www.campomar.com.pe/img/produts/solido-de-caballa.png",
    }, // Atún
    {
      id_producto: 8,
      imagen:
        "https://mercafreshperu.com/wp-content/uploads/2024/02/Manzana-Delicia.webp",
    }, // Manzana
    {
      id_producto: 9,
      imagen:
        "https://mercafreshperu.com/wp-content/uploads/2024/02/Platano-Seda-Organico.webp",
    }, // Plátano
    {
      id_producto: 10,
      imagen: "https://labodega.com.pe/Adminbackend/fotos/producto15771.jpg",
    }, // Yogurt
    {
      id_producto: 11,
      imagen:
        "https://adex-b2peru.s3.amazonaws.com/userfiles/product/photos/8630_5f7206cf1c62c.png",
    }, // Queso
    {
      id_producto: 12,
      imagen:
        "https://www.palmolive.com.pe/content/dam/cp-sites/personal-care/palmolive-latam/redesign-2020/pdp/mandarina-romero/envoltura-jabon-palmolive-naturals-mandarina-romero-front-d-mx.png",
    }, // Jabón
    {
      id_producto: 13,
      imagen:
        "https://www.suavemashigiene.com/-/media/project/site/products/aromas/suave-aromas-2-rollos-flores-del-valle-sagrado.png?h=578&w=578&la=es-PE&hash=59DD436BE2E9257071265EEC9E9B741E",
    }, // Papel higiénico
    {
      id_producto: 14,
      imagen:
        "https://www.lanuestraperu.com/wp-content/uploads/CAJA-CEREAL-7S-CACAO@2x-1.png",
    }, // Cereales
    {
      id_producto: 15,
      imagen: "https://www.union.pe/wp-content/uploads/2023/05/Galleta-nar.png",
    }, // Galletas
    {
      id_producto: 16,
      imagen: "https://www.licoresbrisol.com.pe/web/webimg/1618_1_1000.png",
    }, // Coca Cola
    {
      id_producto: 17,
      imagen:
        "https://group-ism.com/wp-content/uploads/2023/07/cielo-sin-gas2.png",
    }, // Agua
    {
      id_producto: 21,
      imagen:
        "https://images.rappi.pe/products/1669323880748_1669323878554_1669323881778.png?d=900x750&e=webp&q=30",
    }, // Saladitas
  ];

  const producto = productosConImagen.find((p) => p.id_producto === idProducto);

  // Si no encontramos la imagen, usamos un placeholder genérico
  return (
    producto?.imagen || "https://via.placeholder.com/100x100?text=Producto"
  );
}
