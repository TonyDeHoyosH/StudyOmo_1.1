document.addEventListener('DOMContentLoaded', () => {

    // --- MODIFICACIÓN: Leer 'idGrupo' y 'rol' de la URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const idGrupo = urlParams.get('idGrupo');
    const rol = urlParams.get('rol'); // Leemos el rol

    // Verificamos que ambos parámetros existan
    if (!idGrupo || !rol) {
        alert('Error: Faltan parámetros esenciales (ID de grupo o rol) en la URL.');
        const formContainer = document.getElementById('create-task-form');
        formContainer.innerHTML = '<p style="text-align: center; color: red; font-weight: bold;">Falta el ID del grupo o el rol. Por favor, accede a esta página desde la vista de un grupo.</p>';
        return;
    }
    // --- FIN DE LA MODIFICACIÓN ---


    // --- Selección de Elementos del DOM (sin cambios) ---
    const taskForm = document.getElementById('create-task-form');
    // ... (resto de la selección de elementos sin cambios)
    const uploadButton = document.getElementById('upload-resource-btn');
    const fileInput = document.getElementById('recurso');
    const fileNameDisplay = document.getElementById('file-name-display');

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = `Archivo seleccionado: ${fileInput.files[0].name}`;
        } else {
            fileNameDisplay.textContent = '';
        }
    });


    // --- Lógica para el envío del formulario (sin cambios en la lógica principal) ---
    taskForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // ... (resto del código para obtener los datos del formulario es el mismo)
        const formData = new FormData();
        const titulo = document.getElementById('titulo').value;
        const descripcion = document.getElementById('descripcion').value;
        const fechaEntregaInput = document.getElementById('fechaEntrega').value;
        const duracionPomodoro = document.getElementById('duracionPomodoro').value;
        const duracionDescanso = document.getElementById('duracionDescanso').value;
        const intentos = document.getElementById('intentos').value;
        const recursoFile = fileInput.files[0];
        
        if (!titulo || !descripcion || !fechaEntregaInput || !recursoFile) {
            alert('Por favor, completa todos los campos y selecciona un archivo PDF.');
            return;
        }
        
        const fechaEntrega = `${fechaEntregaInput}:00`;

        formData.append('titulo', titulo);
        formData.append('descripcion', descripcion);
        formData.append('fechaEntrega', fechaEntrega);
        formData.append('idGrupo', idGrupo);
        formData.append('duracionPomodoro', duracionPomodoro);
        formData.append('duracionDescanso', duracionDescanso);
        formData.append('intentos', intentos);
        formData.append('recurso', recursoFile);

        const apiUrl = 'http://100.29.28.174:7000/tareas';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert('¡Tarea creada con éxito! Serás redirigido a la lista de tareas.');

                // --- MODIFICACIÓN: Añadir 'rol' a la URL de redirección ---
                const redirectUrl = `./verTareasClase.html?idGrupo=${idGrupo}&rol=${rol}`;
                
                window.location.href = redirectUrl;
            } else {
                // ... (manejo de errores sin cambios)
                const errorData = await response.json();
                console.error('Error del servidor:', errorData);
                alert(`Error al crear la tarea: ${errorData.message || 'Error desconocido'}`);
            }
        } catch (error) {
            // ... (manejo de errores sin cambios)
            console.error('Error de red o de conexión:', error);
            alert('No se pudo conectar con el servidor. Revisa tu conexión o la URL de la API.');
        }
    });
});