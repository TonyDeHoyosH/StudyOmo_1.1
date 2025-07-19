document.addEventListener('DOMContentLoaded', () => {

    // --- SIMULACIÓN DE DATOS DE CONFIGURACIÓN ---
    // En una aplicación real, estos datos vendrían del backend.
    let configuracionUsuario = {
        "volumenNotificacion": 75, // Valor inicial del volumen (0-100)
        "mostrarPopups": true     // true para "Sí", false para "No"
    };

    // --- ELEMENTOS DEL DOM ---
    const soundVolumeSlider = document.getElementById('sound-volume');
    const popupYesButton = document.getElementById('popup-yes');
    const popupNoButton = document.getElementById('popup-no');
    const deleteAccountButton = document.getElementById('delete-account-button');

    // --- FUNCIONES ---

    /**
     * Carga la configuración actual del usuario en la interfaz.
     */
    function cargarConfiguracion() {
        soundVolumeSlider.value = configuracionUsuario.volumenNotificacion;

        if (configuracionUsuario.mostrarPopups) {
            popupYesButton.classList.add('selected');
            popupNoButton.classList.remove('selected');
        } else {
            popupYesButton.classList.remove('selected');
            popupNoButton.classList.add('selected');
        }
    }

    /**
     * Maneja el cambio del volumen.
     */
    function manejarCambioVolumen() {
        configuracionUsuario.volumenNotificacion = parseInt(soundVolumeSlider.value);
        console.log("Volumen de notificación cambiado a:", configuracionUsuario.volumenNotificacion);
        // Aquí podrías guardar esto automáticamente o esperar un botón de "Guardar cambios"
        // simularEnvioBackend(configuracionUsuario); // Descomentar si quieres auto-guardar
    }

    /**
     * Maneja la selección de la opción de pop-up.
     * @param {boolean} opcion - true para "Sí", false para "No".
     */
    function seleccionarPopup(opcion) {
        configuracionUsuario.mostrarPopups = opcion;
        if (opcion) {
            popupYesButton.classList.add('selected');
            popupNoButton.classList.remove('selected');
        } else {
            popupYesButton.classList.remove('selected');
            popupNoButton.classList.add('selected');
        }
        console.log("Mostrar Pop-ups:", configuracionUsuario.mostrarPopups);
        // Aquí podrías guardar esto automáticamente o esperar un botón de "Guardar cambios"
        // simularEnvioBackend(configuracionUsuario); // Descomentar si quieres auto-guardar
    }

    /**
     * Simula el envío de los datos de configuración al backend.
     * @param {object} datos - El objeto de configuración a enviar.
     */
    function simularEnvioBackend(datos) {
        console.log("Enviando configuración al backend:", datos);
        // Aquí harías una llamada a la API, por ejemplo con fetch:
        /*
        fetch('/api/guardarConfiguracion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Respuesta del backend:', data);
            alert('¡Configuración guardada con éxito!');
        })
        .catch((error) => {
            console.error('Error al guardar la configuración:', error);
            alert('Hubo un error al guardar la configuración.');
        });
        */
        alert('¡Configuración guardada con éxito! (Simulado)');
    }

    /**
     * Maneja la acción de eliminar cuenta (simulado).
     */
    function manejarEliminarCuenta() {
        if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
            console.log("Usuario ha confirmado eliminar cuenta.");
            // Aquí enviarías una solicitud al backend para eliminar la cuenta
            // simularEnvioBackend({ accion: "eliminarCuenta", userId: "ID_DEL_USUARIO" });
            alert("¡Tu cuenta ha sido eliminada! (Simulado)");
            // Opcional: Redirigir al usuario a la página de inicio de sesión o a otra página.
            // window.location.href = '/login';
        }
    }

    // --- EVENT LISTENERS ---
    soundVolumeSlider.addEventListener('input', manejarCambioVolumen); // 'input' para actualización en tiempo real
    popupYesButton.addEventListener('click', () => seleccionarPopup(true));
    popupNoButton.addEventListener('click', () => seleccionarPopup(false));
    deleteAccountButton.addEventListener('click', manejarEliminarCuenta);

    // --- INICIALIZACIÓN ---
    cargarConfiguracion(); // Carga la configuración al inicio
});