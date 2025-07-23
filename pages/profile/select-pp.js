document.addEventListener('DOMContentLoaded', () => {

    // --- DATOS SIMULADOS ---
    // Avatares disponibles (rutas de imagen)
    const avatars = [
        "../../assets/icons/logo_StudyOmo_azul.png",       // Avatar original del usuario
        "../../assets/icons/logo_StudyOmo_verde.png",      // Avatar adicional 1
        "../../assets/icons/logo_StudyOmo_amarillo.png",      // Avatar adicional 2
        "../../assets/icons/logo_StudyOmo_naranja.png",      // Avatar adicional 3
        "../../assets/icons/logo_StudyOmo_rojo.png",      // Avatar adicional 4
        "../../assets/icons/logo_StudyOmo_rosa.png",      // Avatar adicional 5
        "../../assets/icons/logo_StudyOmo_morado.png",      // Avatar adicional 6
        "../../assets/icons/logo_StudyOmo_gris.png",      // Avatar adicional 7
        "../../assets/icons/logo_StudyOmo_gei.png"       // Avatar adicional 8
    ];

    // Simular el avatar actual del usuario (podría venir del backend)
    let currentAvatarUrl = "https://i.ibb.co/6rD3rC1/avatar.png"; // Avatar predeterminado

    // --- ELEMENTOS DEL DOM ---
    const avatarGrid = document.getElementById('avatar-grid');
    const currentSelectedAvatar = document.getElementById('current-selected-avatar');
    const saveAvatarButton = document.getElementById('save-avatar-button');
    const navbarAvatar = document.getElementById('navbar-avatar');

    // --- FUNCIONES ---

    /**
     * Carga los avatares en la cuadrícula y establece el avatar actual.
     */
    function loadAvatars() {
        // Establecer el avatar actual al cargar
        currentSelectedAvatar.src = currentAvatarUrl;
        navbarAvatar.src = currentAvatarUrl;

        avatarGrid.innerHTML = ''; // Limpiar la cuadrícula antes de añadir
        avatars.forEach(avatarUrl => {
            const img = document.createElement('img');
            img.src = avatarUrl;
            img.alt = 'Avatar seleccionable';
            img.classList.add('avatar-selection-card__option');
            
            // Marcar el avatar actual como seleccionado al cargar la página
            if (avatarUrl === currentAvatarUrl) {
                img.classList.add('selected');
            }

            img.addEventListener('click', () => selectAvatar(img, avatarUrl));
            avatarGrid.appendChild(img);
        });
    }

    /**
     * Maneja la selección de un avatar.
     * @param {HTMLElement} selectedImg - La imagen del avatar seleccionada.
     * @param {string} avatarUrl - La URL del avatar seleccionado.
     */
    function selectAvatar(selectedImg, avatarUrl) {
        // Remover la clase 'selected' de todos los avatares
        document.querySelectorAll('.avatar-selection-card__option').forEach(img => {
            img.classList.remove('selected');
        });

        // Añadir la clase 'selected' al avatar clickeado
        selectedImg.classList.add('selected');

        // Actualizar la imagen grande del avatar actual
        currentSelectedAvatar.src = avatarUrl;
        currentAvatarUrl = avatarUrl; // Actualizar la URL del avatar actual
    }

    /**
     * Guarda el avatar seleccionado y lo envía al backend.
     */
    function saveAvatar() {
        // En una aplicación real, enviarías currentAvatarUrl al backend.
        const dataToSend = {
            userId: "243776", // Simular un ID de usuario
            avatarUrl: currentAvatarUrl
        };

        console.log("Datos del avatar a enviar al backend:", dataToSend);

        // Aquí harías una llamada a la API, por ejemplo con fetch:
        /*
        fetch('/api/guardarAvatar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del backend:', data);
            alert('¡Avatar guardado con éxito!');
            // Opcional: Redirigir o actualizar la UI
        })
        .catch((error) => {
            console.error('Error al guardar el avatar:', error);
            alert('Hubo un error al guardar el avatar.');
        });
        */

        // Actualizar el avatar de la navbar una vez guardado (simulado)
        navbarAvatar.src = currentAvatarUrl;
        alert('¡Avatar guardado con éxito! (Simulado)');
    }

    // --- EVENT LISTENERS ---
    saveAvatarButton.addEventListener('click', saveAvatar);

    // --- INICIALIZACIÓN ---
    loadAvatars();
});