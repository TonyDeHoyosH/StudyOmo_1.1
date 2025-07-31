document.addEventListener('DOMContentLoaded', () => {

    // Referencia al botón de salir
    const exitButton = document.getElementById('exit-button');
    
    // Si el botón existe, le añade un evento de clic
    if (exitButton) {
        exitButton.addEventListener('click', () => {
            alert('Saliendo de la tarea...');
            // En una aplicación real, esto podría llevarte a la página anterior:
            // window.history.back();
        });
    }
});