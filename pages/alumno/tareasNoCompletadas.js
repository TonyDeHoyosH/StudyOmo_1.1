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

  // Enlazamos el botón de toggle
  const linkCompletadas = document.getElementById("linkCompletadas");
  if (linkCompletadas) {
    linkCompletadas.href = `./tareasCompletadas.html?idGrupo=${idGrupo}&rol=${rol}`;
  }

  try {
    // 🔥 Usamos el endpoint correcto
    const response = await fetch(`http://100.29.28.174:7000/usuarios/${idUsuario}/grupos/${idGrupo}/tareas-pendientes`);

    if (response.ok) {
      const tareas = await response.json();
      const contenedor = document.querySelector(".class-list");
      contenedor.innerHTML = "";

      if (tareas.length === 0) {
        contenedor.innerHTML = `<p style="color: white; text-align: center;">No tienes tareas pendientes en este grupo.</p>`;
        return;
      }

      tareas.forEach(tarea => {
        const tareaItem = document.createElement("div");
        tareaItem.classList.add("class-item");

        tareaItem.innerHTML = `
          <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Tarea" class="class-item__logo">
          <span class="class-item__name">${tarea.titulo}</span>
          <span class="class-item__objective">Fecha límite: ${tarea.fechaEntrega}</span>
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
      alert("No se pudieron cargar las tareas pendientes.");
    }

  } catch (error) {
    console.error("Error al cargar tareas pendientes:", error);
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

  window.location.href = `./claseObjetivo.html?idTarea=${idTarea}&idGrupo=${idGrupo}&rol=${rol}`;
}
