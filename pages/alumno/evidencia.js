document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadButtonLabel = document.getElementById('upload-button-label');
    const fileNameDisplay = document.getElementById('file-name-display');
    const completeButton = document.getElementById('complete-button');
    
    let selectedFile = null;

    fileInput.addEventListener('change', (event) => {
        if (event.target.files.length > 0) {
            selectedFile = event.target.files[0];
            fileNameDisplay.textContent = selectedFile.name;

            // ¡AQUÍ ESTÁ LA MAGIA! Cambia el estilo del botón a verde
            uploadButtonLabel.style.borderColor = 'var(--button-success-bg)';
            uploadButtonLabel.style.color = 'var(--button-success-bg)';
            uploadButtonLabel.querySelector('svg').style.stroke = 'var(--button-success-bg)';

            console.log('Archivo seleccionado:', selectedFile);
        }
    });

    completeButton.addEventListener('click', () => {
        if (selectedFile) {
            alert(`Completando tarea con el archivo: ${selectedFile.name}`);
            // Aquí iría tu lógica para subir el archivo.
        } else {
            alert('Por favor, sube un archivo para completar la tarea.');
        }
    });
});