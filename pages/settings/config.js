document.addEventListener('DOMContentLoaded', () => {
    // --- SIMULACIÓN DE DATOS DE CONFIGURACIÓN ---
    let configuracionUsuario = {
        "volumenNotificacion": 75, // Valor inicial del volumen (0-100)
        "mostrarPopups": true     // true para "Sí", false para "No"
    };

    // Recupera valor del volumen desde localStorage si existe
    const savedVolume = localStorage.getItem('volumenNotificacion');
    if (savedVolume !== null) {
        configuracionUsuario.volumenNotificacion = parseInt(savedVolume);
    }

    // --- ELEMENTOS DEL DOM ---
    const soundVolumeSlider = document.getElementById('sound-volume');
    const popupYesButton = document.getElementById('popup-yes');
    const popupNoButton = document.getElementById('popup-no');
    const deleteAccountButton = document.getElementById('delete-account-button');

    // --- FUNCIONES ---

    function cargarConfiguracion() {
        soundVolumeSlider.value = configuracionUsuario.volumenNotificacion;
        actualizarRastroSlider(configuracionUsuario.volumenNotificacion);

        if (configuracionUsuario.mostrarPopups) {
            popupYesButton.classList.add('selected');
            popupNoButton.classList.remove('selected');
        } else {
            popupYesButton.classList.remove('selected');
            popupNoButton.classList.add('selected');
        }
    }

    function manejarCambioVolumen() {
        const value = parseInt(soundVolumeSlider.value);
        configuracionUsuario.volumenNotificacion = value;

        localStorage.setItem('volumenNotificacion', value);
        actualizarRastroSlider(value);
        console.log("Volumen de notificación cambiado a:", value);
    }

    function actualizarRastroSlider(value) {
        const porcentaje = value / 100;
        soundVolumeSlider.style.background = `linear-gradient(to right, var(--slider-thumb) 0%, var(--slider-thumb) ${value}%, var(--slider-track) ${value}%, var(--slider-track) 100%)`;
    }

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
    }

    function simularEnvioBackend(datos) {
        console.log("Enviando configuración al backend:", datos);
        alert('¡Configuración guardada con éxito! (Simulado)');
    }

    function manejarEliminarCuenta() {
        if (confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.")) {
            console.log("Usuario ha confirmado eliminar cuenta.");
            alert("¡Tu cuenta ha sido eliminada! (Simulado)");
        }
    }

    // --- EVENTOS ---
    soundVolumeSlider.addEventListener('input', manejarCambioVolumen);
    popupYesButton.addEventListener('click', () => seleccionarPopup(true));
    popupNoButton.addEventListener('click', () => seleccionarPopup(false));
    deleteAccountButton.addEventListener('click', manejarEliminarCuenta);

    // --- INICIO ---
    cargarConfiguracion();
});