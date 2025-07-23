document.addEventListener("DOMContentLoaded", async () => {
    const idUsuario = localStorage.getItem("idUsuario");
    const idGrupo = localStorage.getItem("idGrupo"); // Recuperamos el idGrupo desde el localStorage

    // Verificamos si el usuario está logueado
    if (!idUsuario) {
        alert("No has iniciado sesión.");
        window.location.href = "/login"; // Redirige a la página de login
        return;
    }

    // Verificamos si el idGrupo está disponible
    if (!idGrupo) {
        alert("No se encontró el grupo. Redirigiendo...");
        window.location.href = "/errorPage.html"; // Redirige a una página de error si no se encuentra el idGrupo
        return;
    }

    // Ahora hacemos la solicitud para obtener los objetivos asociados al grupo
    try {
        const response = await fetch(`http://localhost:7000/objetivos/grupo/${idGrupo}`);
        
        if (response.ok) {
            const objetivos = await response.json();
            console.log(objetivos); // Verifica el contenido de la respuesta

            const objetivosListContainer = document.querySelector(".class-list");
            objetivosListContainer.innerHTML = ''; // Limpiar la lista antes de añadir nuevos objetivos

            if (objetivos.length === 0) {
                objetivosListContainer.innerHTML = "<p>No hay objetivos asociados a este grupo.</p>";
                return;
            }

            // Mostrar todos los objetivos asociados al grupo
            objetivos.forEach(objetivo => {
                const objetivoItem = document.createElement("div");
                objetivoItem.classList.add("class-item");  // Mantiene la misma clase de estilo
                objetivoItem.innerHTML = `
                    <span class="class-item__name">${objetivo.nombre}</span>
                    <div class="class-item__actions">
                        <button onclick="verObjetivo(${objetivo.idObjetivo})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </button>
                    </div>
                `;
                objetivosListContainer.appendChild(objetivoItem);
            });
        } else {
            alert("No se pudieron cargar los objetivos.");
        }
    } catch (error) {
        console.error("Error al cargar los objetivos:", error);
        alert("Error en la conexión con el servidor.");
    }

    // Formulario para crear nuevos objetivos
    const formularioObjetivo = document.getElementById("formulario-objetivo");
    formularioObjetivo.addEventListener("submit", async (e) => {
        e.preventDefault();

        const inputNombre = document.getElementById("nombre-objetivo");
        const inputDescripcion = document.getElementById("descripcion-objetivo");
        const inputTotalPomodoros = document.getElementById("total-pomodoros");
        const inputDuracionPomodoro = document.getElementById("duracion-pomodoro");
        const inputDuracionDescanso = document.getElementById("duracion-descanso");

        const objetivoData = {
            nombre: inputNombre.value,
            descripcion: inputDescripcion.value,
            totalPomodoros: parseInt(inputTotalPomodoros.value),
            duracionPomodoro: parseInt(inputDuracionPomodoro.value),
            duracionDescanso: parseInt(inputDuracionDescanso.value),
            idGrupo: idGrupo, // Asociamos el objetivo con el grupo
            idUsuario: idUsuario, // Asociamos el objetivo con el docente
        };

        try {
            const response = await fetch("http://localhost:7000/objetivos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(objetivoData),
            });

            if (response.ok) {
                const nuevoObjetivo = await response.json();
                alert("Objetivo creado exitosamente.");
                // Recargamos los objetivos para mostrar el nuevo
                mostrarObjetivos();
                formularioObjetivo.reset(); // Limpiar el formulario
            } else {
                alert("Error al crear el objetivo.");
            }
        } catch (error) {
            console.error("Error al crear el objetivo:", error);
            alert("Error en la conexión con el servidor.");
        }
    });
});

// Función para ver el objetivo
function verObjetivo(idObjetivo) {
    window.location.href = `/verObjetivo.html?id=${idObjetivo}`;
}
