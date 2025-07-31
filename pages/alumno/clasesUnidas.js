document.addEventListener("DOMContentLoaded", async () => {

    
    const idUsuario = localStorage.getItem("idUsuario");

    if (!idUsuario) {
        alert("No has iniciado sesión.");
        window.location.href = "/login";
        return;
    }

    try {
        // 🟦 Cambiamos a fetch para grupos donde el usuario es alumno
        const response = await fetch(`http://100.29.28.174:7000/grupos/alumno/${idUsuario}`);

        if (response.ok) {
            const grupos = await response.json();
            const classListContainer = document.querySelector(".class-list");
            classListContainer.innerHTML = '';

            if (grupos.length === 0) {
                classListContainer.innerHTML = `<p style="color: white; text-align: center;">Aún no te has unido a ninguna clase.</p>`;
            }

            grupos.forEach(grupo => {
                const classItem = document.createElement("div");
                classItem.classList.add("class-item");

                const numObjetivos = grupo.objetivos ? grupo.objetivos.length : 0;
                const textoObjetivos = `${numObjetivos} Objetivo${numObjetivos !== 1 ? 's' : ''}`;

                // 🧠 Solo botón de ver
                classItem.innerHTML = `
                    <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Clase" class="class-item__logo">
                    <span class="class-item__name">${grupo.nombre}</span>
                    <div class="class-item__actions">
                        <button onclick="verClase(${grupo.idGrupo})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </button>
                    </div>
                `;

                classListContainer.appendChild(classItem);
            });

        } else {
            alert("No se pudieron cargar las clases.");
        }
    } catch (error) {
        console.error("Error al cargar las clases:", error);
        alert("Error en la conexión con el servidor.");
    }
});

function verClase(idGrupo) {
    console.log(`Viendo clase con ID: ${idGrupo}`);

    // Guardamos también el rol en localStorage si quieres reutilizarlo después
    localStorage.setItem("idGrupo", idGrupo);
    localStorage.setItem("rol", "alumno");

    // Redirigimos con parámetros en la URL
    window.location.href = `./tareasNoCompletadas.html?idGrupo=${idGrupo}&rol=alumno`;
}
