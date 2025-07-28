document.addEventListener("DOMContentLoaded", async () => {
    const idUsuario = localStorage.getItem("idUsuario");
    const idGrupo = localStorage.getItem("idGrupo"); // Obtenemos el idGrupo desde el localStorage

    if (!idUsuario) {
        alert("No has iniciado sesión.");
        window.location.href = "/login"; // Ajusta a tu página de login
        return;
    }

    try {
        // Hacemos la solicitud GET para obtener los grupos creados por el usuario
        const response = await fetch(`http://100.29.28.174:7000/grupos/docente/${idUsuario}`);

        if (response.ok) {
            const grupos = await response.json();
            console.log(grupos); // Verifica el contenido de la respuesta

            const classListContainer = document.querySelector(".class-list");
            classListContainer.innerHTML = ''; // Limpiar la lista antes de añadir nuevos elementos

            if (grupos.length === 0) {

            }

            grupos.forEach(grupo => {
                const classItem = document.createElement("div");
                classItem.classList.add("class-item");

                // Contamos cuántos objetivos tiene la clase (si la API lo provee)
                const numObjetivos = grupo.objetivos ? grupo.objetivos.length : 0;
                const textoObjetivos = `${numObjetivos} Objetivo${numObjetivos !== 1 ? 's' : ''}`;

                // Generamos el HTML para cada clase con la nueva estructura
                classItem.innerHTML = `
                    <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Clase" class="class-item__logo">
                    <span class="class-item__name">${grupo.nombre}</span>
                    <span class="class-item__objective">${textoObjetivos}</span>
                    <div class="class-item__actions">
                        <button onclick="verClase(${grupo.idGrupo})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                        <button onclick="empezarClase(${grupo.idGrupo})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                        </button>
                    </div>
                `;
                classListContainer.appendChild(classItem);

                // Si el idGrupo del grupo actual coincide con el idGrupo guardado, podemos hacer algo, como destacarlo
                if (grupo.idGrupo == idGrupo) {
                    classItem.style.backgroundColor = "#f0f0f0"; // Puedes personalizar este estilo
                    console.log("Este es el grupo seleccionado: ", grupo);
                }
            });
        } else {
            alert("No se pudieron cargar las clases.");
        }
    } catch (error) {
        console.error("Error al cargar las clases:", error);
        alert("Error en la conexión con el servidor.");
    }
});

// Función para el botón de 'ver clase' (el ojo)
function verClase(idGrupo) {
    console.log(`Viendo la clase con ID: ${idGrupo}`);
    // Guardamos el idGrupo en el localStorage antes de redirigir
    localStorage.setItem("idGrupo", idGrupo);
    // Aquí rediriges a la página de objetivos de la clase
    window.location.href = `./crearObjetivo.html?idClase=${idGrupo}`;
}

// Función para el botón de 'empezar clase' (play)
function empezarClase(idGrupo) {
    console.log(`Empezando la clase con ID: ${idGrupo}`);
    alert(`Funcionalidad 'empezar' para la clase ${idGrupo} aún no implementada.`);
}


//Sacar idGrupo en localstorage