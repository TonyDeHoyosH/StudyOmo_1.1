document.addEventListener("DOMContentLoaded", () => {
    // Contenedor principal donde se mostrarán las clases del usuario.
    const classListContainer = document.querySelector(".class-list");

    // --- PASO 1: OBTENER EL ID DEL USUARIO LOGUEADO ---
    // Recuperamos el objeto de usuario completo que se guardó durante el login.
    const datosUsuarioString = localStorage.getItem('usuario');
    if (!datosUsuarioString) {
        // Si no hay datos de usuario, no podemos continuar.
        classListContainer.innerHTML = '<p class="error-message">No se encontraron datos de sesión. Por favor, <a href="/ruta/a/tu/login.html">inicia sesión</a> de nuevo.</p>';
        return; // Detenemos la ejecución.
    }

    const usuario = JSON.parse(datosUsuarioString);
    const idUsuario = usuario.idUsuario; // Extraemos el idUsuario.

    if (!idUsuario) {
        classListContainer.innerHTML = '<p class="error-message">No se pudo obtener tu identificador. Por favor, intenta iniciar sesión de nuevo.</p>';
        return;
    }

    // --- PASO 2: FUNCIÓN PARA OBTENER Y MOSTRAR LAS CLASES DEL USUARIO ---
    // Hacemos esta función 'async' para poder usar 'await' y esperar la respuesta de la API.
    const cargarClasesDelUsuario = async () => {
        // Mostramos un mensaje de carga mientras se obtienen los datos.
        classListContainer.innerHTML = '<p class="loading-message">Cargando tus clases...</p>';
        
        // ¡IMPORTANTE! Este es el EndPoint que tu backend debe tener para devolver
        // todas las clases (grupos) a las que pertenece un usuario específico.
        const endpoint = `http://100.29.28.174:7000/grupo/${idGrupo}`;

        try {
            const response = await fetch(endpoint);

            if (response.ok) {
                const clases = await response.json(); // Convertimos la respuesta en un array de objetos.
                
                // Limpiamos el mensaje de "Cargando...".
                classListContainer.innerHTML = ''; 

                if (clases.length === 0) {
                    // Si el usuario no está en ninguna clase, mostramos un mensaje amigable.
                    classListContainer.innerHTML = '<p class="info-message">Aún no te has unido a ninguna clase. ¡Usa el código de tu profesor para empezar!</p>';
                } else {
                    // Si hay clases, las recorremos y creamos una tarjeta para cada una.
                    clases.forEach(clase => {
                        const claseElement = document.createElement('div');
                        claseElement.className = 'class-item'; // Usamos una clase para darle estilo.
                        
                        // Añadimos un atributo 'data-id-grupo' para saber a qué clase corresponde.
                        claseElement.setAttribute('data-id-grupo', clase.idGrupo);

                        // Esta es la estructura interna de la tarjeta de clase.
                        // Puedes personalizarla como quieras.
                        claseElement.innerHTML = `
                            <h3 class="class-item__title">${clase.nombre}</h3>
                            <p class="class-item__code">Código: ${clase.codigoUnico}</p>
                            <span class="class-item__cta">Ver objetivos →</span>
                        `;

                        // Añadimos la nueva tarjeta de clase al contenedor.
                        classListContainer.appendChild(claseElement);
                    });
                }
            } else {
                // Si la respuesta del servidor es un error (ej. 404, 500).
                const errorData = await response.json();
                classListContainer.innerHTML = `<p class="error-message">Error al cargar tus clases: ${errorData.message || 'Inténtalo de nuevo más tarde.'}</p>`;
            }
        } catch (error) {
            // Si hay un error de red (ej. el servidor no responde).
            console.error("Error de conexión:", error);
            classListContainer.innerHTML = '<p class="error-message">No se pudo conectar con el servidor. Revisa tu conexión a internet.</p>';
        }
    };

    // --- PASO 3: MANEJAR CLICS EN LAS CLASES ---
    // Usamos 'event delegation': un solo listener en el contenedor padre.
    classListContainer.addEventListener('click', (event) => {
        // 'closest' busca el ancestro más cercano que coincida con el selector '.class-item'.
        const classItemClicked = event.target.closest('.class-item');

        if (classItemClicked) {
            // Si se hizo clic en una tarjeta de clase, obtenemos su ID de grupo.
            const idGrupoSeleccionado = classItemClicked.getAttribute('data-id-grupo');
            
            if (idGrupoSeleccionado) {
                console.log(`Clase seleccionada. ID de Grupo: ${idGrupoSeleccionado}`);

                // Guardamos el ID del grupo en localStorage para que la siguiente página lo pueda usar.
                localStorage.setItem('idGrupoActual', idGrupoSeleccionado);

                // Redirigimos a la página que mostrará los objetivos de esa clase.
                // Asegúrate de que esta URL sea la correcta.
                window.location.href = './verObjetivos.html'; 
            }
        }
    });

    cargarClasesDelUsuario();
});