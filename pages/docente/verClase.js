document.addEventListener("DOMContentLoaded", async () => {
    
    const idUsuario = localStorage.getItem("idUsuario");
    const idGrupo = localStorage.getItem("idGrupo");

    if (!idUsuario) {
        alert("No has iniciado sesión.");
        window.location.href = "/login";
        return;
    }

    try {
        const response = await fetch(`http://100.29.28.174:7000/grupos/docente/${idUsuario}`);

        if (response.ok) {
            const grupos = await response.json();
            console.log(grupos);

            const classListContainer = document.querySelector(".class-list");
            classListContainer.innerHTML = '';

            if (grupos.length === 0) {
                // Aquí podrías mostrar un mensaje si no hay grupos
            }

            grupos.forEach(grupo => {
                const classItem = document.createElement("div");
                classItem.classList.add("class-item");

                const numObjetivos = grupo.objetivos ? grupo.objetivos.length : 0;
                const textoObjetivos = `${numObjetivos} Objetivo${numObjetivos !== 1 ? 's' : ''}`;

                classItem.innerHTML = `
                    <img src="../../../assets/images/logo_StudyOmo.png" alt="Logo Clase" class="class-item__logo">
                    <span class="class-item__name">${grupo.nombre}</span>
                    <div class="class-item__actions">
                        <button onclick="verClase(${grupo.idGrupo})" class="class-item__button">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                    </div>
                `;
                classListContainer.appendChild(classItem);

                if (grupo.idGrupo == idGrupo) {
                    classItem.style.backgroundColor = "#f0f0f0";
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

function verClase(idGrupo) {
    console.log(`Viendo la clase con ID: ${idGrupo}`);
    localStorage.setItem("idGrupo", idGrupo);
    window.location.href = `./verTareasClase.html?idGrupo=${idGrupo}&rol=docente`;
}

