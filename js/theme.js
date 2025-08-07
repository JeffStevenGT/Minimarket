// THEME.JS

// Manejo del tema claro/oscuro

//Inicializa el tema de la aplicación

export function inicializarTema() {
  const themeToggle = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  // Verificar preferencia del usuario
  const preferenciaUsuario =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  // Aplicar tema inicial
  aplicarTema(preferenciaUsuario, themeIcon);

  // Configurar evento del botón
  themeToggle.addEventListener("click", () => {
    const temaActual = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
    const nuevoTema = temaActual === "dark" ? "light" : "dark";

    localStorage.setItem("theme", nuevoTema);
    aplicarTema(nuevoTema, themeIcon);
  });
}

function aplicarTema(tema, icon) {
  if (tema === "dark") {
    document.documentElement.classList.add("dark");
    // Cambiar a icono de luna
    icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        `;
  } else {
    document.documentElement.classList.remove("dark");
    // Cambiar a icono de sol
    icon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        `;
  }
}
