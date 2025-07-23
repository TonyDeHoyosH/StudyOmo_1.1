document.addEventListener("DOMContentLoaded", async () => {
    const idGrupo = localStorage.getItem("idGrupo");

    // Verificamos si el idGrupo está disponible
    if (!idGrupo) {
        alert("No se encontró el grupo. Redirigiendo...");
        window.location.href = "/errorPage.html"; // Redirige a una página de error si no se encuentra el idGrupo
        return;
    }

    try {
        // Hacemos la solicitud GET para obtener los usuarios del grupo
        const response = await fetch(`http://localhost:7000/grupos/${idGrupo}/usuarios`);

        if (response.ok) {
            const usuarios = await response.json();
            console.log(usuarios); // Verifica el contenido de la respuesta

            // Filtramos solo los alumnos
            const alumnos = usuarios.filter(usuario => usuario.rol === "alumno");

            const classListContainer = document.querySelector(".class-list");
            classListContainer.innerHTML = ''; // Limpiar la lista antes de añadir nuevos alumnos

            if (alumnos.length === 0) {
                classListContainer.innerHTML = "<p>No hay alumnos en este grupo.</p>";
                return;
            }

            // Mostrar todos los alumnos asociados al grupo
            alumnos.forEach(alumno => {
                const alumnoItem = document.createElement("div");
                alumnoItem.classList.add("class-item");
                alumnoItem.innerHTML = `
                    <span class="class-item__name">${alumno.nombre}</span> <!-- Ahora mostramos el nombre -->
                    <div class="class-item__actions">
                        <button onclick="verAlumno(${alumno.idUsuario})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                `;
                classListContainer.appendChild(alumnoItem);
            });
        } else {
            alert("No se pudieron cargar los alumnos.");
        }
    } catch (error) {
        console.error("Error al cargar los alumnos:", error);
        alert("Error en la conexión con el servidor.");
    }
});
