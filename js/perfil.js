// perfil.js
import { obtenerToken } from "./auth.js";
import { mostrarNotificacion } from "./utils.js";

const API_BASE_URL = "https://funval-backend.onrender.com";

export async function cargarPerfil() {
  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/me/perfil`, {
      headers: { Authorization: `Bearer ${obtenerToken()}` },
    });
    if (!response.ok) throw new Error("Error al cargar el perfil");
    const perfil = await response.json();
    mostrarNotificacion(`Perfil cargado: ${perfil.nombre_usuario}`, "success");
    // Aquí puedes actualizar la UI con los datos del perfil
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    mostrarNotificacion("Error al cargar el perfil", "error");
  }
}
