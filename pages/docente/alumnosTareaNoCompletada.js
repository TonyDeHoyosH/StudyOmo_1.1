document.addEventListener("DOMContentLoaded", async () => {

  const urlParams = new URLSearchParams(window.location.search);
  const idTarea = urlParams.get("idTarea");
  const idGrupo = urlParams.get("idGrupo");
  const rol = urlParams.get("rol");

  if (!idTarea || !idGrupo || !rol) {
    alert("Faltan parámetros necesarios en la URL.");
    window.location.href = "/";
    return;
  }

  // Toggle de cambio de vista a "sí entregaron"
  const toggleEntregados = document.getElementById("linkPendientes");
  if (toggleEntregados) {
    toggleEntregados.href = `./alumnosTareaCompletada.html?idTarea=${idTarea}&idGrupo=${idGrupo}&rol=${rol}`;
  }

  try {
    const response = await fetch(`http://100.29.28.174:7000/grupos/${idGrupo}/tareas/${idTarea}/alumnos-no-entregados`);
    const alumnos = await response.json();

    const contenedor = document.querySelector(".class-list");
    contenedor.innerHTML = "";

    if (!alumnos.length) {
      contenedor.innerHTML = `<p style="color: white; text-align: center;">¡Todos los alumnos ya entregaron esta tarea!</p>`;
      return;
    }

    alumnos.forEach(alumno => {
      const card = document.createElement("div");
      card.classList.add("class-item");

      card.innerHTML = `
        <img src="../../../assets/images/logo_StudyOmo.png" alt="Avatar" class="class-item__logo">
        <span class="class-item__name">${alumno.nombre}</span>
        <span class="class-item__objective">Estado: No entregada</span>
      `;

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error al obtener alumnos pendientes:", error);
    alert("No se pudo cargar la lista de alumnos pendientes.");
  }
});
  