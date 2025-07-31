document.addEventListener('DOMContentLoaded', async () => {
    
    // Obtener el ID de la tarea de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idTarea = urlParams.get('idTarea');
    const idGrupo = urlParams.get('idGrupo');

    const idUsuario = localStorage.getItem("idUsuario");

    if (!idUsuario || !idTarea) {
        alert('Faltan datos importantes. Redirigiendo...');
       // window.location.href = '/home/home.html';
        return;
    }

    // Referencias del DOM
    const grupoNombre = document.getElementById('grupo-nombre');
    const tareaTitulo = document.getElementById('tarea-titulo');
    const tareaDescripcion = document.getElementById('tarea-descripcion');
    const fechaLimite = document.getElementById('fecha-limite');
    const tiempoPomodoro = document.getElementById('tiempo-pomodoro');
    const tiempoDescanso = document.getElementById('tiempo-descanso');
    const totalPomodoros = document.getElementById('total-pomodoros');

    // Referencias para el modal y evidencia
    const fileInput = document.getElementById('file-input');
    const completarBtn = document.getElementById('start-objective-btn');
    const modal = document.getElementById('materialModal');
    const openModalBtn = document.getElementById('material-btn');
    const closeBtn = document.querySelector('.close-button');
    const materialDisplay = document.getElementById('material-display');

    // Estado de evidencia
    let selectedFile = null;

    // Cargar datos de la tarea
    try {
        // Fetch para obtener información de la tarea
        const response = await fetch(`http://100.29.28.174:7000/tareas/${idTarea}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar la tarea');
        }

        const tareaData = await response.json();
        console.log('Datos de la tarea:', tareaData);

        // Hacer fetch para obtener el nombre del grupo
        try {
            const grupoResponse = await fetch(`http://100.29.28.174:7000/grupos/${tareaData.idGrupo}`);
            if (grupoResponse.ok) {
                const grupoData = await grupoResponse.json();
                grupoNombre.textContent = grupoData.nombre;
            } else {
                grupoNombre.textContent = `Grupo ${tareaData.idGrupo}`;
            }
        } catch (error) {
            console.error('Error al obtener información del grupo:', error);
            grupoNombre.textContent = `Grupo ${tareaData.idGrupo}`;
        }

        // Renderizar información básica
        tareaTitulo.textContent = tareaData.titulo;
        tareaDescripcion.textContent = tareaData.descripcion;
        
        // Parsear y formatear fecha límite
        let fechaEntrega;
        try {
            if (Array.isArray(tareaData.fechaEntrega)) {
                const [año, mes, dia, hora, minuto] = tareaData.fechaEntrega;
                fechaEntrega = new Date(año, mes - 1, dia, hora, minuto);
            } else {
                fechaEntrega = new Date(tareaData.fechaEntrega);
            }
        } catch (error) {
            console.error('Error al parsear fecha:', error);
            fechaEntrega = new Date();
        }
        
        // Formatear y mostrar fecha límite
        const opcionesFecha = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        if (!isNaN(fechaEntrega.getTime())) {
            fechaLimite.textContent = fechaEntrega.toLocaleDateString('es-ES', opcionesFecha);
        } else {
            fechaLimite.textContent = 'Fecha no disponible';
        }
        
        // Mostrar información de pomodoros
        tiempoPomodoro.textContent = `${tareaData.duracionPomodoro} minutos`;
        tiempoDescanso.textContent = `${tareaData.duracionDescanso} minutos`;
        totalPomodoros.textContent = `${tareaData.totalPomodoros} pomodoros`;

    } catch (error) {
        console.error('Error al cargar la información de la tarea:', error);
        alert('Error al cargar la información de la tarea. Por favor, intente nuevamente.');
        
        // Mostrar mensaje de error en la interfaz
        grupoNombre.textContent = 'Error';
        tareaTitulo.textContent = 'Error al cargar';
        tareaDescripcion.textContent = 'No se pudo obtener la información de la tarea';
        fechaLimite.textContent = '-';
        tiempoPomodoro.textContent = '-';
        tiempoDescanso.textContent = '-';
        totalPomodoros.textContent = '-';
    }

    // Funcionalidad del modal
    openModalBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        // Limpiar selección
        fileInput.value = '';
    });

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Subir archivo PDF
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Validar que sea un PDF
            if (file.type !== 'application/pdf') {
                alert('Solo se permiten archivos PDF');
                fileInput.value = '';
                return;
            }
            
            // Validar tamaño (opcional - ejemplo: máximo 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                alert('El archivo PDF no debe superar los 10MB');
                fileInput.value = '';
                return;
            }
            
            selectedFile = file;
            materialDisplay.innerHTML = `<strong>PDF seleccionado:</strong> ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;
            materialDisplay.style.display = 'block';
            modal.classList.remove('active');
            console.log('PDF seleccionado:', selectedFile);
        }
    });

    // Completar tarea (enviar evidencia)
    completarBtn.addEventListener('click', async () => {
        if (!selectedFile) {
            alert('Por favor, sube un archivo PDF como evidencia');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('idUsuario', idUsuario);

        try {
            // Mostrar loading
            completarBtn.disabled = true;
            completarBtn.textContent = 'Enviando...';

            const response = await fetch(`http://100.29.28.174:7000/tarea/${idTarea}/evidencia`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('¡Tarea completada exitosamente! 🎉');
                // Redirigir al home o a la lista de tareas
                window.location.href = '/home/home.html';
            } else {
                const errorText = await response.text();
                console.error('Error al enviar evidencia:', errorText);
                alert('Error al enviar la evidencia. Por favor, intente nuevamente.');
                
                // Restaurar botón
                completarBtn.disabled = false;
                completarBtn.textContent = 'Completar';
            }
        } catch (error) {
            console.error('Error de conexión:', error);
            alert('No se pudo conectar con el servidor. Por favor, verifique su conexión.');
            
            // Restaurar botón
            completarBtn.disabled = false;
            completarBtn.textContent = 'Completar';
        }
    });
});