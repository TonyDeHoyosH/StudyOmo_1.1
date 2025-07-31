// --- FUNCIÓN AUXILIAR PARA FORMATEAR FECHA Y HORA (SIN CAMBIOS) ---
function formatLocalDateTime(dateArray) {
  if (!Array.isArray(dateArray) || dateArray.length < 5) {
    return "Fecha no disponible";
  }
  const date = new Date(
    dateArray[0], dateArray[1] - 1, dateArray[2],
    dateArray[3], dateArray[4]
  );
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }
  return date.toLocaleString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}


document.addEventListener("DOMContentLoaded", async () => {
    
  const idUsuario = localStorage.getItem("idUsuario");

  if (!idUsuario) {
    alert("No se encontró el ID del usuario. Por favor, inicie sesión de nuevo.");
    window.location.href = "/";
    return;
  }

  const linkCompletados = document.getElementById("linkCompletados");
  if (linkCompletados) {
    linkCompletados.href = `./objetivosCompletados.html`;
  }

  try {
    const response = await fetch(`http://100.29.28.174:7000/objetivos/no-entregados/${idUsuario}`);

    if (response.ok) {
      const objetivos = await response.json();
      const contenedor = document.querySelector(".class-list");
      contenedor.innerHTML = "";

      if (objetivos.length === 0) {
        contenedor.innerHTML = `<p style="color: white; text-align: center;">¡Felicidades! No tienes objetivos pendientes.</p>`;
        return;
      }

      objetivos.forEach(objetivo => {
        const objetivoItem = document.createElement("div");
        objetivoItem.classList.add("class-item");

        objetivoItem.innerHTML = `
          <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Objetivo" class="class-item__logo">
          <span class="class-item__name">${objetivo.nombre}</span> 
          <span class="class-item__objective">Creado el: ${formatLocalDateTime(objetivo.fechaCreacion)}</span>
          <div class="class-item__actions">
            <!-- 1. CAMBIO: Pasamos ambos IDs a la función onclick -->
            <button onclick="verObjetivo(${objetivo.idObjetivo}, ${objetivo.idSesion})" class="class-item__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        `;

        contenedor.appendChild(objetivoItem);
      });

    } else {
      alert("No se pudieron cargar los objetivos pendientes. Estado: " + response.status);
    }

  } catch (error) {
    console.error("Error al cargar objetivos pendientes:", error);
    alert("Error de conexión con el servidor.");
  }
});


// --- 2. CAMBIO: La función ahora acepta dos parámetros y los añade a la URL ---
function verObjetivo(idObjetivo, idSesion) {
  // Construimos la URL con ambos IDs como parámetros
  window.location.href = `./detalleObjetivo.html?idObjetivo=${idObjetivo}&idSesion=${idSesion}`;
}