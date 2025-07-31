// --- FUNCIÓN AUXILIAR PARA FORMATEAR LA FECHA DE UN ARREGLO ---
/**
 * Convierte un arreglo de fecha/hora de un JSON (LocalDateTime) a un string legible.
 * @param {Array<number>} dateArray - El arreglo [año, mes, día, hora, minuto].
 * @returns {string} - La fecha formateada.
 */
function formatLocalDateTime(dateArray) {
  // Si el dato no es un arreglo válido, devuelve un texto de error.
  if (!Array.isArray(dateArray) || dateArray.length < 5) {
    return "Fecha no disponible";
  }

  // Creamos el objeto Date usando los elementos del arreglo.
  // IMPORTANTE: Restamos 1 al mes porque en JS los meses son 0-11.
  const date = new Date(
    dateArray[0],      // Año
    dateArray[1] - 1,  // Mes (0-11)
    dateArray[2],      // Día
    dateArray[3],      // Hora
    dateArray[4]       // Minuto
  );

  // Verificamos si la fecha resultante es válida.
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }

  // Usamos toLocaleString para un formato amigable para el usuario.
  return date.toLocaleString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}


document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const idGrupo = urlParams.get("idGrupo");
  const rol = urlParams.get("rol");
  const idUsuario = localStorage.getItem("idUsuario");

  if (!idGrupo || !rol || !idUsuario) {
    alert("Faltan datos del grupo o del usuario");
    window.location.href = "/";
    return;
  }
  
  const crearTareaLink = document.getElementById("crearTareaBtn");

  if (crearTareaLink) {
    // Pasa tanto idGrupo como rol a la página de creación de tareas.
    crearTareaLink.href = `./crearTarea.html?idGrupo=${idGrupo}&rol=${rol}`;
  }

  try {
    const response = await fetch(`http://100.29.28.174:7000/tareas/grupo/${idGrupo}`);

    if (response.ok) {
      const tareas = await response.json();
      const contenedor = document.querySelector(".class-list");
      contenedor.innerHTML = "";

      if (tareas.length === 0) {
        contenedor.innerHTML = `<p style="color: white; text-align: center;">Aún no hay tareas en este grupo.</p>`;
      }

      tareas.forEach(tarea => {
        const tareaItem = document.createElement("div");
        tareaItem.classList.add("class-item");
        
        // Se usa la nueva función para formatear la fecha correctamente.
        tareaItem.innerHTML = `
          <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Tarea" class="class-item__logo">
          <span class="class-item__name">${tarea.titulo}</span>
          <span class="class-item__objective">Fecha límite: ${formatLocalDateTime(tarea.fechaEntrega)}</span>
          <div class="class-item__actions">
            <button onclick="verTarea(${tarea.idTarea})" class="class-item__button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>
        `;
        
        contenedor.appendChild(tareaItem);
      });

    } else {
      alert("No se pudieron cargar las tareas.");
    }

  } catch (error) {
    console.error("Error al cargar las tareas:", error);
    alert("Error de conexión con el servidor.");
  }
});

function verTarea(idTarea) {
  const urlParams = new URLSearchParams(window.location.search);
  const idGrupo = urlParams.get("idGrupo");
  const rol = urlParams.get("rol");

  localStorage.setItem("idTarea", idTarea);
  localStorage.setItem("idGrupo", idGrupo);
  localStorage.setItem("rol", rol);

  window.location.href = `./alumnosTareaCompletada.html?idTarea=${idTarea}&idGrupo=${idGrupo}&rol=${rol}`;
}