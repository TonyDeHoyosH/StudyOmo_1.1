document.addEventListener('DOMContentLoaded', () => {
    const timerView = document.getElementById('timer-view');
    const taskCard = document.getElementById('task-card');
    const statusMessage = document.getElementById('status-message');
    const modal = document.getElementById('modal-overlay');

    let state = {};
    let notificationCheckInterval = null;
    
    // Variables para el seguimiento de métricas
    let sessionMetrics = {
        tiempoEfectivo: 0, // Tiempo efectivo en segundos
        pomodorosCompletados: 0, // Cantidad de pomodoros terminados
        intentosFallidos: 0, // Cantidad de intentos fallidos
        objetivoAlcanzado: false, // Si se completó el objetivo sin interrupciones
        tiempoInicioPomodoro: null, // Timestamp cuando inicia un pomodoro
        tiempoAcumulado: 0 // Tiempo acumulado de pomodoros anteriores
    };

    // Obtener el ID del objetivo de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const objectiveId = urlParams.get('id');

    if (!objectiveId) {
        alert('No se encontró el ID del objetivo');
        window.location.href = '/home/home.html';
        return;
    }

    // Solicitar permiso para notificaciones al cargar
    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted') {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    alert('El permiso para notificaciones es necesario para la verificación de actividad.');
                }
            }
        } else {
            alert('Este navegador no soporta notificaciones.');
        }
    };

    const loadObjectiveFromAPI = async () => {
        try {
            const response = await fetch(`http://100.29.28.174:7000/objetivos/${objectiveId}`);
            if (!response.ok) throw new Error('Error al cargar el objetivo');
            const objectiveData = await response.json();
            return {
                nombre: objectiveData.nombre,
                pomodoroTime: objectiveData.duracionPomodoro,
                breakTime: objectiveData.duracionDescanso,
                totalPomodoros: objectiveData.totalPomodoros
            };
        } catch (error) {
            console.error('Error al cargar el objetivo:', error);
            alert('Error al cargar el objetivo. Redirigiendo...');
            window.location.href = '/pages/home/home/home.html';
            return null;
        }
    };

    // Función para enviar las métricas al backend
    const enviarMetricasAlBackend = async (estado) => {
        const datosAEnviar = {
            duracionReal: sessionMetrics.tiempoEfectivo.toString(),
            descansoReal: sessionMetrics.objetivoAlcanzado ? "1" : "0",
            intentos: sessionMetrics.intentosFallidos.toString(),
            estado: estado,
            pomodoros: sessionMetrics.pomodorosCompletados.toString()
        };

        console.log('Enviando métricas al backend:', datosAEnviar);

        try {
            const response = await fetch('http://100.29.28.174:7000/sesiones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosAEnviar)
            });

            if (response.ok) {
                console.log('Métricas enviadas exitosamente');
            } else {
                console.error('Error al enviar las métricas');
            }
        } catch (error) {
            console.error('Error al conectar con el backend:', error);
        }
    };

    const resetState = async () => {
        clearInterval(state.timerInterval);
        if (notificationCheckInterval) clearTimeout(notificationCheckInterval);

        const objective = await loadObjectiveFromAPI();
        if (!objective) return;

        state = {
            timerInterval: null,
            totalSeconds: objective.pomodoroTime * 60,
            status: 'idle',
            isBreak: false,
            pomodorosDone: 0,
            objective: objective,
            sessionActive: false
        };

        // Reiniciar métricas al reiniciar el estado
        sessionMetrics = {
            tiempoEfectivo: 0,
            pomodorosCompletados: 0,
            intentosFallidos: 0,
            objetivoAlcanzado: false,
            tiempoInicioPomodoro: null,
            tiempoAcumulado: 0
        };

        document.getElementById('task-name').textContent = objective.nombre;
        updateUI();
    };

    const calculateTotalTime = () => {
        const { pomodoroTime, breakTime, totalPomodoros } = state.objective;
        const totalWorkTime = pomodoroTime * totalPomodoros;
        const totalBreakTime = breakTime * (totalPomodoros > 1 ? totalPomodoros - 1 : 0);
        return totalWorkTime + totalBreakTime;
    };

    const updateTimerDisplay = () => {
        const minutes = String(Math.floor(state.totalSeconds / 60)).padStart(2, '0');
        const seconds = String(state.totalSeconds % 60).padStart(2, '0');
        document.getElementById('timer-display').textContent = `${minutes}:${seconds}`;
    };

    const updateProgressRing = () => {
        const progressRing = document.getElementById('progress-ring-indicator');
        const ringRadius = progressRing.r.baseVal.value;
        const ringCircumference = 2 * Math.PI * ringRadius;
        progressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
        const duration = state.isBreak ? state.objective.breakTime * 60 : state.objective.pomodoroTime * 60;
        const percent = duration > 0 ? (duration - state.totalSeconds) / duration * 100 : 0;
        const offset = ringCircumference - (percent / 100) * ringCircumference;
        progressRing.style.strokeDashoffset = offset;
    };

    const updateTaskInfo = () => {
        const totalTime = calculateTotalTime();
        const totalTimeDisplay = document.getElementById('task-total-time');
        if (state.isBreak) {
            document.getElementById('task-pomodoros').textContent = 'Descanso';
        } else {
            const currentPomodoro = Math.min(state.pomodorosDone + 1, state.objective.totalPomodoros);
            document.getElementById('task-pomodoros').textContent = `${currentPomodoro}/${state.objective.totalPomodoros} Pomodoros`;
        }
        totalTimeDisplay.textContent = `${totalTime} min total`;
    };

    const updateTaskCardState = () => {
        taskCard.classList.remove('task-card--activo', 'task-card--pausado', 'task-card--descanso', 'task-card--finalizado');
        switch (state.status) {
            case 'running': taskCard.classList.add('task-card--activo'); break;
            case 'paused': taskCard.classList.add('task-card--pausado'); break;
            case 'break': taskCard.classList.add('task-card--descanso'); break;
            case 'completed': taskCard.classList.add('task-card--finalizado'); break;
        }
    };

    const updateButtons = () => {
        const startBtn = document.getElementById('start-btn');
        const restartBtn = document.getElementById('restart-btn');
        if (state.status === 'running' || state.status === 'break') {
            startBtn.classList.add('hidden');
            restartBtn.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
            restartBtn.classList.add('hidden');
        }
    };

    const showStatusMessage = (message, duration = 3000) => {
        statusMessage.textContent = message;
        statusMessage.classList.remove('hidden');
        setTimeout(() => statusMessage.classList.add('hidden'), duration);
    };

    const updateUI = () => {
        updateTimerDisplay();
        updateProgressRing();
        updateTaskInfo();
        updateTaskCardState();
        updateButtons();
    };
    
    const handleActivityCheck = () => {
        if (!state.sessionActive || Notification.permission !== 'granted') return;

        const notification = new Notification('¿Sigues ahí?', {
            body: 'Interactúa con esta notificación para confirmar que sigues activo.',
            requireInteraction: true 
        });

        let hasBeenHandled = false;

        const interactionTimeout = setTimeout(() => {
            if (hasBeenHandled) return;
            hasBeenHandled = true;

            notification.close();
            
            // Actualizar el tiempo efectivo antes de reiniciar
            if (sessionMetrics.tiempoInicioPomodoro && !state.isBreak) {
                const tiempoTranscurrido = Math.floor((Date.now() - sessionMetrics.tiempoInicioPomodoro) / 1000);
                sessionMetrics.tiempoEfectivo = sessionMetrics.tiempoAcumulado + tiempoTranscurrido;
            }
            
            // Incrementar intentos fallidos
            sessionMetrics.intentosFallidos++;
            
            // Enviar métricas antes de reiniciar
            enviarMetricasAlBackend('iniciado');
            
            restartTimer();
            showStatusMessage('Objetivo reiniciado por inactividad. 🔄', 5000);
        }, 20000);

        notification.onclick = () => {
            if (hasBeenHandled) return;
            hasBeenHandled = true;

            clearTimeout(interactionTimeout);
            notification.close();
            scheduleNextActivityCheck();
        };
        
        notification.onclose = () => {
            if (hasBeenHandled) return;
            hasBeenHandled = true;

            clearTimeout(interactionTimeout);
            scheduleNextActivityCheck(); 
        };
    };
    
    const scheduleNextActivityCheck = () => {
        if (notificationCheckInterval) clearTimeout(notificationCheckInterval);
        if (!state.sessionActive) return;

        const minInterval = 5 * 1000;      // 30 segundos
        const maxInterval = 10 * 1000;    // 1 minuto

        const randomInterval = Math.floor(Math.random() * (maxInterval - minInterval + 1)) + minInterval;

        notificationCheckInterval = setTimeout(handleActivityCheck, randomInterval);
    };

    const setupSession = (isBreak) => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.isBreak = isBreak;

        if (isBreak) {
            state.totalSeconds = state.objective.breakTime * 60;
            state.status = 'break';
            showStatusMessage('¡Tiempo de descanso! 🎉');
        } else {
            state.totalSeconds = state.objective.pomodoroTime * 60;
            state.status = 'idle';
            if (state.pomodorosDone > 0) showStatusMessage('¡Continuemos! 💪');
        }
        updateUI();
    };

    const startTimer = () => {
        if (state.timerInterval) return;
        
        if (state.status === 'completed') {
            state.pomodorosDone = 0;
            state.isBreak = false;
            state.totalSeconds = state.objective.pomodoroTime * 60;
            updateUI();
        }
        
        // Si estamos iniciando un pomodoro (no descanso), guardar el tiempo de inicio
        if (!state.isBreak) {
            sessionMetrics.tiempoInicioPomodoro = Date.now();
        }
        
        state.status = state.isBreak ? 'break' : 'running';
        state.sessionActive = true;
        updateUI();

        state.timerInterval = setInterval(() => {
            state.totalSeconds--;
            updateUI();
            if (state.totalSeconds <= 0) handleTimerEnd();
        }, 1000);

        showStatusMessage(state.isBreak ? 'Descanso iniciado ☕' : 'Pomodoro iniciado! 🍅');
        scheduleNextActivityCheck();
    };

    const restartTimer = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        if (notificationCheckInterval) clearTimeout(notificationCheckInterval);
        
        // Actualizar el tiempo efectivo si estábamos en un pomodoro
        if (sessionMetrics.tiempoInicioPomodoro && !state.isBreak) {
            const tiempoTranscurrido = Math.floor((Date.now() - sessionMetrics.tiempoInicioPomodoro) / 1000);
            sessionMetrics.tiempoEfectivo = sessionMetrics.tiempoAcumulado + tiempoTranscurrido;
        }
        
        // Incrementar intentos fallidos
        sessionMetrics.intentosFallidos++;
        
        // Enviar métricas
        enviarMetricasAlBackend('iniciado');
        
        // Reiniciar métricas para la nueva sesión
        sessionMetrics = {
            tiempoEfectivo: 0,
            pomodorosCompletados: 0,
            intentosFallidos: 0,
            objetivoAlcanzado: false,
            tiempoInicioPomodoro: null,
            tiempoAcumulado: 0
        };
        
        state.pomodorosDone = 0;
        state.isBreak = false;
        state.totalSeconds = state.objective.pomodoroTime * 60;
        state.status = 'idle';
        state.sessionActive = false;
        
        updateUI();
        showStatusMessage('Timer reiniciado al inicio 🔄');
    };

    const handleTimerEnd = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;

        if (!state.isBreak) {
            // Actualizar tiempo efectivo del pomodoro completado
            if (sessionMetrics.tiempoInicioPomodoro) {
                const tiempoTranscurrido = Math.floor((Date.now() - sessionMetrics.tiempoInicioPomodoro) / 1000);
                sessionMetrics.tiempoAcumulado += tiempoTranscurrido;
                sessionMetrics.tiempoEfectivo = sessionMetrics.tiempoAcumulado;
                sessionMetrics.tiempoInicioPomodoro = null;
            }
            
            state.pomodorosDone++;
            sessionMetrics.pomodorosCompletados++;
            
            if (state.pomodorosDone >= state.objective.totalPomodoros) {
                // Objetivo completado exitosamente
                state.status = 'completed';
                state.sessionActive = false;
                state.totalSeconds = 0;
                if (notificationCheckInterval) clearTimeout(notificationCheckInterval);
                
                sessionMetrics.objetivoAlcanzado = true;
                
                updateUI();
                showStatusMessage('¡Objetivo completado! 🎉🏆', 5000);
                updateObjectiveStatus('completado');
                
                // Enviar métricas como completado
                enviarMetricasAlBackend('completado');
            } else {
                setupSession(true);
                startTimer();
            }
        } else {
            setupSession(false);
            startTimer();
        }
    };
    
    const updateObjectiveStatus = async (status) => {
        try {
            console.log(`Objetivo ${objectiveId} marcado como ${status}`);
            // Aquí la llamada a tu API
        } catch (error) {
            console.error('Error al actualizar el estado del objetivo:', error);
        }
    };

    const showDeleteModal = () => modal.classList.add('visible');
    const hideDeleteModal = () => modal.classList.remove('visible');

    const stopTimer = () => {
        clearInterval(state.timerInterval);
        if (notificationCheckInterval) clearTimeout(notificationCheckInterval);
        
        // Actualizar el tiempo efectivo antes de cancelar
        if (sessionMetrics.tiempoInicioPomodoro && !state.isBreak) {
            const tiempoTranscurrido = Math.floor((Date.now() - sessionMetrics.tiempoInicioPomodoro) / 1000);
            sessionMetrics.tiempoEfectivo = sessionMetrics.tiempoAcumulado + tiempoTranscurrido;
        }
        
        // Incrementar intentos fallidos por cancelación
        sessionMetrics.intentosFallidos++;
        
        // Enviar métricas antes de salir
        enviarMetricasAlBackend('iniciado');
        
        hideDeleteModal();
        window.location.href = '/pages/objetivos/objetivos.html';
    };

    // Event listeners
    document.getElementById('start-btn').addEventListener('click', startTimer);
    document.getElementById('restart-btn').addEventListener('click', restartTimer);
    document.getElementById('stop-btn').addEventListener('click', showDeleteModal);
    document.querySelector('[data-action="cancel-delete"]').addEventListener('click', hideDeleteModal);
    document.querySelector('[data-action="confirm-delete"]').addEventListener('click', stopTimer);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('visible')) hideDeleteModal();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideDeleteModal();
    });

    // Inicializar la aplicación
    const initializeApp = async () => {
        await requestNotificationPermission();
        await resetState();
    };

    initializeApp();
});