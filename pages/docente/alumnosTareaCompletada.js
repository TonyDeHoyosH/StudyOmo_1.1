document.addEventListener("DOMContentLoaded", async () => {
  
  const urlParams = new URLSearchParams(window.location.search);
  const idTarea = urlParams.get("idTarea");
  const idGrupo = urlParams.get("idGrupo");
  const rol = urlParams.get("rol");

  if (!idTarea || !idGrupo || !rol) {
    alert("Faltan parámetros necesarios en la URL.");
    window.location.href = "/"; // Redirige a home si falta algo
    return;
  }

  // Toggle de cambio de vista a "no entregaron"
  const togglePendientes = document.getElementById("linkNoEntregaron");
  if (togglePendientes) {
    togglePendientes.href = `./alumnosTareaNoCompletada.html?idTarea=${idTarea}&idGrupo=${idGrupo}&rol=${rol}`;
  }

  try {
    const response = await fetch(`http://100.29.28.174:7000/grupos/${idGrupo}/tareas/${idTarea}/alumnos-completados`);
    const alumnos = await response.json();

    const contenedor = document.querySelector(".class-list");
    contenedor.innerHTML = "";

    if (!alumnos.length) {
      const mensaje = document.createElement("p");
      mensaje.textContent = "Ningún alumno ha entregado esta tarea todavía.";
      mensaje.classList.add("mensaje-vacio");
      contenedor.appendChild(mensaje);
      return;
    }

    alumnos.forEach(alumno => {
      const card = document.createElement("div");
      card.classList.add("class-item");

      const fechaFormateada = formatearFechaArray(alumno.fechaEnvio); // 👈 si es array tipo [2025, 7, 28, 0, 0]

      card.innerHTML = `
        <img src="../../../assets/images/logo_StudyOmo.png" alt="Avatar" class="class-item__logo">
        <span class="class-item__name">${alumno.nombre}</span>
        <span class="class-item__objective">Entregada el: ${fechaFormateada}</span>
        <div class="class-item__actions">
          <button onclick="verEvidencia(${alumno.idUsuario})" class="class-item__button" title="Ver evidencia">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      `;

      contenedor.appendChild(card);
    });

  } catch (error) {
    console.error("Error al obtener alumnos:", error);
    alert("No se pudo cargar la lista de alumnos.");
  }
});

function formatearFechaArray(fechaArr) {
  if (!Array.isArray(fechaArr)) return "Fecha inválida";

  const [anio, mes, dia, hora = 0, minuto = 0, segundo = 0] = fechaArr;
  const fecha = new Date(anio, mes - 1, dia, hora, minuto, segundo);

  return fecha.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}


function verEvidencia(idUsuarioAlumno) {
  const urlParams = new URLSearchParams(window.location.search);
  const idTarea = urlParams.get("idTarea");
  const idGrupo = urlParams.get("idGrupo");
  const rol = urlParams.get("rol");

  window.location.href = `./verEvidencia.html?idTarea=${idTarea}&idGrupo=${idGrupo}&idUsuario=${idUsuarioAlumno}&rol=${rol}`;
}
