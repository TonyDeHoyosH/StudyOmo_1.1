document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // --- SECCIÓN 1: LÓGICA DEL MODAL PARA MATERIAL DE TRABAJO ---
    // ===================================================================

    // Referencias a los elementos del Modal
    const materialBtn = document.getElementById('material-btn');
    const materialModal = document.getElementById('materialModal');
    const closeModalBtn = document.querySelector('.close-button');
    const fileInput = document.getElementById('file-input');
    const urlInput = document.getElementById('url-input');
    const saveUrlBtn = document.getElementById('save-url-btn');
    const materialDisplay = document.getElementById('material-display');

    // Comprobamos si los elementos del modal existen para evitar errores en otras páginas
    if (materialModal) {
        // Función para abrir el modal
        const openModal = () => {
            materialModal.classList.add('active');
        };

        // Función para cerrar el modal
        const closeModal = () => {
            materialModal.classList.remove('active');
        };

        // Asignar eventos al botón para abrir/cerrar
        materialBtn.addEventListener('click', openModal);
        closeModalBtn.addEventListener('click', closeModal);

        // Cerrar el modal si se hace clic fuera del contenido
        window.addEventListener('click', (event) => {
            if (event.target === materialModal) {
                closeModal();
            }
        });

        // Evento cuando se selecciona un archivo
        fileInput.addEventListener('change', () => {
            if (fileInput.files.length > 0) {
                const fileName = fileInput.files[0].name;
                materialDisplay.innerHTML = `Archivo adjunto: <strong>${fileName}</strong>`;
                materialDisplay.style.display = 'block'; // Mostrar el contenedor
                closeModal();
            }
        });

        // Evento para guardar la URL
        saveUrlBtn.addEventListener('click', () => {
            const url = urlInput.value.trim();
            if (url) {
                // Se crea un enlace (<a>) para que la URL sea clickeable
                materialDisplay.innerHTML = `Enlace: <a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
                materialDisplay.style.display = 'block'; // Mostrar el contenedor
                urlInput.value = ''; // Limpiar el input
                closeModal();
            } else {
                alert('Por favor, introduce una URL válida.');
            }
        });
    }


    // ===================================================================
    // --- SECCIÓN 2: LÓGICA DEL TEMPORIZADOR Y OBJETIVO ---
    // ===================================================================
    
    // Referencias a los elementos del DOM para el temporizador
    const startButton = document.getElementById('start-objective-btn');
    
    // Comprobamos si el botón de iniciar objetivo existe para evitar errores
    if (startButton) {
        // Referencias a los inputs y displays de tiempo
        const pomodoroInput = document.getElementById('pomodoro-time-input');
        const breakInput = document.getElementById('break-time-input');
        const limitInput = document.getElementById('limit-time-input');
        const totalInput = document.getElementById('total-time-input');
        const attemptsInput = document.getElementById('attempts-input'); // Asumiendo que ahora es un input
        
        // Estado del temporizador
        let pomodoroTimeLeft;
        let breakTimeLeft;
        let attempts = 0;
        let isRunning = false;
        let isBreak = false;
        let timerInterval = null;

        // Función para formatear segundos a un formato legible
        function formatTime(seconds) {
            if (isNaN(seconds) || seconds < 0) return "00:00";
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        // Función principal del temporizador
        function runTimer() {
            if (isBreak) {
                breakTimeLeft--;
                document.title = `Descanso: ${formatTime(breakTimeLeft)} - StudyOmo`;
                if (breakTimeLeft < 0) {
                    isBreak = false;
                    const pomodoroMinutes = parseInt(pomodoroInput.value, 10) || 25;
                    pomodoroTimeLeft = pomodoroMinutes * 60;
                    alert("¡El descanso ha terminado! Es hora de concentrarse.");
                }
            } else {
                pomodoroTimeLeft--;
                document.title = `Foco: ${formatTime(pomodoroTimeLeft)} - StudyOmo`;
                if (pomodoroTimeLeft < 0) {
                    attempts++;
                    // Si tienes un display de intentos, lo actualizas aquí
                    if(attemptsInput) attemptsInput.value = attempts; 
                    
                    isBreak = true;
                    const breakMinutes = parseInt(breakInput.value, 10) || 5;
                    breakTimeLeft = breakMinutes * 60;
                    alert("¡Buen trabajo! Has completado un Pomodoro. Tomate un descanso.");
                }
            }
        }

        // Event listener para el botón de inicio
        startButton.addEventListener('click', () => {
            if (isRunning) return;

            // Leer los valores de los inputs en minutos
            const pomodoroMinutes = parseInt(pomodoroInput.value, 10);
            const breakMinutes = parseInt(breakInput.value, 10);
            
            // Validar y establecer duraciones en segundos (con valores por defecto)
            const POMODORO_DURATION = (pomodoroMinutes > 0 ? pomodoroMinutes : 25) * 60;
            const BREAK_DURATION = (breakMinutes > 0 ? breakMinutes : 5) * 60;
            
            // Inicializar los contadores de tiempo
            pomodoroTimeLeft = POMODORO_DURATION;
            breakTimeLeft = BREAK_DURATION;

            // Actualizar estado y UI
            isRunning = true;
            startButton.textContent = "Objetivo en curso...";
            startButton.disabled = true;
            
            // Deshabilitar inputs para no cambiar los tiempos a mitad de la sesión
            pomodoroInput.disabled = true;
            breakInput.disabled = true;
            if (limitInput) limitInput.disabled = true;
            if (totalInput) totalInput.disabled = true;
            if (attemptsInput) attemptsInput.disabled = true;

            // Iniciar el temporizador
            timerInterval = setInterval(runTimer, 1000);
            alert("¡Objetivo iniciado! El tiempo se mostrará en la pestaña del navegador.");
        });
    }
});


 const startButton = document.getElementById('start-objective-btn');
    const creationView = document.getElementById('creation-view');
    const timerView = document.getElementById('timer-view');

    // 2. Comprobar que todos los elementos existen para evitar errores
    if (startButton && creationView && timerView) {
        
        // 3. Añadir el "escuchador de eventos" al botón
        startButton.addEventListener('click', () => {

            console.log("Botón 'Crear Objetivo' presionado. Cambiando a la vista del temporizador.");

            // 4. Ocultar la vista de creación
            creationView.classList.add('hidden');

            // 5. Mostrar la vista del temporizador
            timerView.classList.remove('hidden');

            // Opcional: Aquí podrías iniciar la lógica de tu temporizador
            // por ejemplo, llamando a una función como iniciarPomodoro();
        });
    } else {
        // Mensaje de error si no se encuentra alguno de los elementos necesarios
        console.error("No se pudo encontrar uno de los elementos necesarios: start-objective-btn, creation-view o timer-view.");
    }
    
    