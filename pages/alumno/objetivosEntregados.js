// --- FUNCIÓN AUXILIAR PARA FORMATEAR FECHA Y HORA (SIN CAMBIOS) ---
/**
 * Convierte un arreglo de fecha/hora de un JSON (LocalDateTime) a un string legible.
 * @param {Array<number>} dateArray - El arreglo [año, mes, día, hora, minuto, ...].
 * @returns {string} - La fecha y hora formateada.
 */
function formatLocalDateTime(dateArray) {
  if (!Array.isArray(dateArray) || dateArray.length < 5) {
    return "Fecha no disponible";
  }
  const date = new Date(
    dateArray[0],      // Año
    dateArray[1] - 1,  // Mes (0-11)
    dateArray[2],      // Día
    dateArray[3],      // Hora
    dateArray[4]       // Minuto
  );
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  
  // Solo necesitamos el idUsuario para este fetch
  const idUsuario = localStorage.getItem("idUsuario");

  if (!idUsuario) {
    alert("No se encontró el ID del usuario. Por favor, inicie sesión de nuevo.");
    window.location.href = "/";
    return;
  }

  // --- LÓGICA OPCIONAL PARA EL BOTÓN DE NAVEGACIÓN ---
  // Si tienes un botón para ir a la vista de "objetivos pendientes", puedes enlazarlo aquí.
  // Asegúrate de que tu botón tenga id="linkPendientes" en el HTML.
  const linkPendientes = document.getElementById("linkPendientes");
  if (linkPendientes) {
    linkPendientes.href = `./objetivosNoEntregados.html`; // Ajusta esta ruta si es necesario
  }

  try {
    // Usamos el endpoint para objetivos entregados
    const response = await fetch(`http://100.29.28.174:7000/objetivos/entregados/${idUsuario}`);

    if (response.ok) {
      const objetivos = await response.json(); // Renombramos 'tareas' a 'objetivos'
      const contenedor = document.querySelector(".class-list");
      contenedor.innerHTML = "";

      if (objetivos.length === 0) {
        contenedor.innerHTML = `<p style="color: white; text-align: center;">Aún no has completado ningún objetivo.</p>`;
        return;
      }

        objetivos.forEach(objetivo => {
        const objetivoItem = document.createElement("div");
        objetivoItem.classList.add("class-item");

        objetivoItem.innerHTML = `
        <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Objetivo" class="class-item__logo">
        <div class="class-item__info">
        <span class="class-item__name">${objetivo.nombre}</span>
        <span class="class-item__objective">Completado el: ${formatLocalDateTime(objetivo.fechaCreacion)}</span>
        </div>`;
        contenedor.appendChild(objetivoItem);
      });
    } else {
      alert("No se pudieron cargar los objetivos completados. Estado: " + response.status);
    }

  } catch (error) {
    console.error("Error al cargar objetivos completados:", error);
    alert("Error de conexión con el servidor.");
  }
});

// --- FUNCIÓN DE NAVEGACIÓN PARA OBJETIVOS ---
function verObjetivo(idObjetivo) {
  // Redirigimos a una página de detalle del objetivo.
  // Solo necesitamos pasar el ID del objetivo.
  window.location.href = `./detalleObjetivo.html?idObjetivo=${idObjetivo}`;
}