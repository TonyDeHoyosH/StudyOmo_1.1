document.addEventListener('DOMContentLoaded', async () => {
    
    const urlParams = new URLSearchParams(window.location.search);
    const idTarea = urlParams.get('idTarea');
    const idGrupo = urlParams.get('idGrupo');

    const idUsuario = localStorage.getItem("idUsuario");

    // Limpiar el ID de tarea si tiene formato incorrecto
    if (idTarea && idTarea.includes('-')) {
        idTarea = idTarea.split('-')[0];
        console.log('ID de tarea limpiado:', idTarea);
    }

    console.log('Datos del localStorage:', {
        idUsuario,
        idTarea,
        idGrupo
    });

    // Verificar que existan los datos necesarios
    if (!idUsuario || !idTarea || !idGrupo) {
        console.error('Faltan datos en localStorage');
        alert('Error: No se encontraron los datos necesarios. Por favor, regrese a la página anterior.');
        return;
    }

    // Referencias a elementos del DOM
    const grupoNombre = document.getElementById('grupo-nombre');
    const tareaTitulo = document.getElementById('tarea-titulo');
    const tareaDescripcion = document.getElementById('tarea-descripcion');
    const fechaLimite = document.getElementById('fecha-limite');
    const tiempoPomodoro = document.getElementById('tiempo-pomodoro');
    const tiempoDescanso = document.getElementById('tiempo-descanso');
    const totalPomodoros = document.getElementById('total-pomodoros');
    const materialBtn = document.getElementById('material-btn');
    const startBtn = document.getElementById('start-objective-btn');
    const mensajeVencida = document.getElementById('mensaje-vencida');

    // Variable para almacenar la URL del recurso
    let recursoUrl = null;

    try {
        // Hacer fetch para obtener la información de la tarea
        const response = await fetch(`http://100.29.28.174:7000/tareas/${idTarea}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`La tarea con ID ${idTarea} no existe`);
            }
            throw new Error(`Error ${response.status} al obtener la información de la tarea`);
        }

        const tareaData = await response.json();
        console.log('Datos de la tarea:', tareaData);
        console.log('Fecha de entrega recibida:', tareaData.fechaEntrega);
        console.log('Tipo de fechaEntrega:', typeof tareaData.fechaEntrega);

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

        // Guardar datos importantes
        recursoUrl = tareaData.recursoURL; // Cambiar de 'recurso' a 'recursoURL'
        
        // Parsear la fecha - viene como array [año, mes, día, hora, minuto]
        let fechaEntrega;
        try {
            if (Array.isArray(tareaData.fechaEntrega)) {
                const [año, mes, dia, hora, minuto] = tareaData.fechaEntrega;
                // Nota: En JavaScript, los meses van de 0-11, por eso restamos 1
                fechaEntrega = new Date(año, mes - 1, dia, hora, minuto);
            } else {
                // Si por alguna razón viene en otro formato
                fechaEntrega = new Date(tareaData.fechaEntrega);
            }
        } catch (error) {
            console.error('Error al parsear fecha:', error);
            fechaEntrega = new Date(); // Fecha actual como fallback
        }
        
        const fechaActual = new Date();

        // Renderizar información básica
        tareaTitulo.textContent = tareaData.titulo;
        tareaDescripcion.textContent = tareaData.descripcion;
        
        // Formatear y mostrar fecha límite
        const opcionesFecha = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        
        // Verificar que la fecha sea válida antes de formatear
        if (!isNaN(fechaEntrega.getTime())) {
            fechaLimite.textContent = fechaEntrega.toLocaleDateString('es-ES', opcionesFecha);
        } else {
            fechaLimite.textContent = 'Fecha no disponible';
        }
        
        // Mostrar información de pomodoros
        tiempoPomodoro.textContent = `${tareaData.duracionPomodoro} minutos`;
        tiempoDescanso.textContent = `${tareaData.duracionDescanso} minutos`;
        totalPomodoros.textContent = `${tareaData.totalPomodoros} pomodoros`;

        // Verificar si la tarea está vencida
        if (fechaActual > fechaEntrega) {
            // Tarea vencida - deshabilitar botones y mostrar mensaje
            materialBtn.disabled = true;
            startBtn.disabled = true;
            mensajeVencida.style.display = 'block';
        } else {
            // Tarea vigente - habilitar botones
            materialBtn.disabled = false;
            startBtn.disabled = false;
            
            // Configurar el botón de material
            if (recursoUrl) {
                materialBtn.addEventListener('click', () => {
                    // Reemplazar "recursos" por "archivos" en la URL
                    const urlCompleta = `http://100.29.28.174:7000/archivos/${recursoUrl}`;
                    
                    // Descargar y abrir el recurso en nueva pestaña
                    window.open(urlCompleta, '_blank');
                });
            } else {
                // Si no hay recurso, deshabilitar el botón
                materialBtn.disabled = true;
                materialBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Sin material disponible
                `;
            }

            // Configurar el botón de iniciar objetivo
            startBtn.addEventListener('click', () => {
                // Guardar información adicional en localStorage para la página del cronómetro
                localStorage.setItem('tareaInfo', JSON.stringify({
                    titulo: tareaData.titulo,
                    descripcion: tareaData.descripcion,
                    duracionPomodoro: tareaData.duracionPomodoro,
                    duracionDescanso: tareaData.duracionDescanso,
                    totalPomodoros: tareaData.totalPomodoros,
                    fechaEntrega: tareaData.fechaEntrega
                }));

                // Redirigir a la página del cronómetro con el ID como parámetro
                // Ajusta la ruta según tu estructura de archivos
                window.location.href = `./../groupObjective/groupObjective.html?idTarea=${idTarea}`;
            });
        }

    } catch (error) {
        console.error('Error al cargar la información de la tarea:', error);
        
        let mensajeError = 'Error al cargar la información de la tarea.';
        if (error.message.includes('no existe')) {
            mensajeError = error.message;
        }
        
        alert(mensajeError + ' Por favor, verifique el ID de la tarea.');
        
        // Mostrar mensaje de error en la interfaz
        grupoNombre.textContent = 'Error';
        tareaTitulo.textContent = 'Tarea no encontrada';
        tareaDescripcion.textContent = error.message;
        fechaLimite.textContent = '-';
        tiempoPomodoro.textContent = '-';
        tiempoDescanso.textContent = '-';
        totalPomodoros.textContent = '-';
        
        // Deshabilitar botones
        materialBtn.disabled = true;
        startBtn.disabled = true;
    }
});