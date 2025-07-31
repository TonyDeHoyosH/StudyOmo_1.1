document.addEventListener('DOMContentLoaded', async () => {

    // Obtener datos del localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const idTarea = urlParams.get('idTarea');
    const idGrupo = urlParams.get('idGrupo');

    const idUsuario = urlParams.get('idUsuario');

    console.log('Datos iniciales:', { idUsuario, idTarea, idGrupo });

    // Verificar que existan los datos necesarios
    if (!idUsuario || !idTarea || !idGrupo) {
        console.error('Faltan datos en localStorage');
        alert('Error: No se encontraron los datos necesarios.');
        window.location.href = '/home/home.html';
        return;
    }

    // Referencias a elementos del DOM
    const alumnoNombre = document.getElementById('alumno-nombre');
    const tareaTitulo = document.getElementById('tarea-titulo');
    const tareaDescripcion = document.getElementById('tarea-descripcion');
    const fechaLimite = document.getElementById('fecha-limite');
    const tiempoTotal = document.getElementById('tiempo-total');
    const tiempoPomodoro = document.getElementById('tiempo-pomodoro');
    const tiempoDescanso = document.getElementById('tiempo-descanso');
    const intentos = document.getElementById('intentos');
    const evidenciaBtn = document.getElementById('evidencia-btn');

    // Variables para almacenar datos
    let evidenciaUrl = null;
    let nombreUsuario = '';

    try {
        // Obtener información del usuario
        const userResponse = await fetch(`http://100.29.28.174:7000/usuarios/${idUsuario}`);
        if (userResponse.ok) {
            const userData = await userResponse.json();
            nombreUsuario = userData.nombre;
            alumnoNombre.textContent = `${nombreUsuario} | ${userData.idUsuario || idUsuario}`;
        } else {
            alumnoNombre.textContent = `Usuario ${idUsuario}`;
        }

        // Hacer fetch para obtener la información de la tarea
        const response = await fetch(`http://100.29.28.174:7000/tareas/${idTarea}`);

        if (!response.ok) {
            throw new Error('Error al obtener la información de la tarea');
        }

        const tareaData = await response.json();
        console.log('Datos de la tarea:', tareaData);

        // Renderizar información de la tarea
        tareaTitulo.textContent = tareaData.titulo;
        tareaDescripcion.textContent = tareaData.descripcion;

        console.log('Datos de duración:', {
            duracionPomodoro: tareaData.duracionPomodoro,
            duracionDescanso: tareaData.duracionDescanso,
            totalPomodoros: tareaData.totalPomodoros
        });

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

        // Formatear fecha y hora
        if (!isNaN(fechaEntrega.getTime())) {
            const horas = String(fechaEntrega.getHours()).padStart(2, '0');
            const minutos = String(fechaEntrega.getMinutes()).padStart(2, '0');
            fechaLimite.textContent = `${horas}h:${minutos}m`;
        } else {
            fechaLimite.textContent = '00h:00m';
        }

        // IMPORTANTE: Los valores vienen como float donde 1 = 1 minuto
        // Convertir correctamente los valores decimales a minutos
        const duracionPomodoroMin = parseFloat(tareaData.duracionPomodoro) || 0;
        const duracionDescansoMin = parseFloat(tareaData.duracionDescanso) || 0;
        const totalPomodorosNum = parseInt(tareaData.totalPomodoros) || 0;

        // Calcular tiempo total
        const totalMinutos = totalPomodorosNum * duracionPomodoroMin;
        const horas = Math.floor(totalMinutos / 60);
        const mins = Math.floor(totalMinutos % 60);
        tiempoTotal.textContent = `${String(horas).padStart(2, '0')}h:${String(mins).padStart(2, '0')}m`;

        // Mostrar información de pomodoros
        // Si el valor es menor a 1, convertirlo a segundos para mostrar
        if (duracionPomodoroMin < 1) {
            const segundos = Math.round(duracionPomodoroMin * 60);
            tiempoPomodoro.textContent = `${segundos}s`;
        } else {
            tiempoPomodoro.textContent = `${Math.floor(duracionPomodoroMin)}min`;
        }

        if (duracionDescansoMin < 1) {
            const segundos = Math.round(duracionDescansoMin * 60);
            tiempoDescanso.textContent = `${segundos}s`;
        } else {
            tiempoDescanso.textContent = `${Math.floor(duracionDescansoMin)}min`;
        }

        // Obtener información de la evidencia
        try {
            const evidenciaResponse = await fetch(`http://100.29.28.174:7000/tarea/${idTarea}/usuario/${idUsuario}/evidencia`);

            if (evidenciaResponse.ok) {
                const evidenciaData = await evidenciaResponse.json();
                console.log('Datos de evidencia:', evidenciaData);

                evidenciaUrl = evidenciaData.fileURL;


                if (evidenciaUrl) {
                    evidenciaBtn.className = 'btn btn--secondary material-entregado';
                    evidenciaBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
    Material Entregado
`;
                } else {
                    evidenciaBtn.className = 'btn btn--secondary sin-evidencia';
                    evidenciaBtn.innerHTML = 'Sin evidencia';
                    evidenciaBtn.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error al obtener evidencia:', error);
            evidenciaBtn.disabled = true;
            evidenciaBtn.textContent = 'Error al cargar evidencia';
        }

    } catch (error) {
        console.error('Error al cargar la información:', error);
        alert('Error al cargar la información de la tarea.');

        // Mostrar mensaje de error en la interfaz
        alumnoNombre.textContent = 'Error';
        tareaTitulo.textContent = 'Error al cargar';
        tareaDescripcion.textContent = 'No se pudo obtener la información';
        fechaLimite.textContent = '-';
        tiempoTotal.textContent = '-';
        tiempoPomodoro.textContent = '-';
        tiempoDescanso.textContent = '-';
        intentos.textContent = '-';
    }

    // Event listener para ver evidencia
    evidenciaBtn.addEventListener('click', () => {
        if (evidenciaUrl) {
            // Construir la URL completa para ver la evidencia
            const urlCompleta = `http://100.29.28.174:7000/archivos/${evidenciaUrl}`;
            window.open(urlCompleta, '_blank');
        } else {
            alert('No se encontró la evidencia o hubo un error al cargarla.');
        }
    });
});