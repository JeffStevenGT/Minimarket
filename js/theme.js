/**
 * THEME.JS - Manejo del tema claro/oscuro del sistema
 * Permite cambiar entre modos y persistir la preferencia
 */

/**
 * Inicializa el sistema de tema claro/oscuro
 * @returns {void}
 */
export function inicializarTema() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  // 1. Obtener preferencia guardada o del sistema
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
  const currentTheme = savedTheme || (systemPrefersDark ? "dark" : "light");

  // 2. Aplicar tema inicial
  aplicarTema(currentTheme, themeIcon);

  // 3. Configurar evento del botón
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme = document.documentElement.classList.contains("dark")
        ? "light"
        : "dark";
      localStorage.setItem("theme", newTheme);
      aplicarTema(newTheme, themeIcon);
    });
  }
}

/**
 * Aplica el tema especificado al documento
 * @param {'light'|'dark'} theme - Tema a aplicar
 * @param {HTMLElement|null} icon - Elemento del icono (opcional)
 */
function aplicarTema(theme, icon = null) {
  // 1. Aplicar clase al documento
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // 2. Actualizar icono si existe
  if (icon) {
    icon.innerHTML =
      theme === "dark"
        ? // Icono de luna (modo oscuro activo)
          `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />`
        : // Icono de sol (modo claro activo)
          `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />`;
  }
}

// Inicializar automáticamente si es el módulo principal (para desarrollo)
if (import.meta.url === document.currentScript?.src) {
  inicializarTema();
}
