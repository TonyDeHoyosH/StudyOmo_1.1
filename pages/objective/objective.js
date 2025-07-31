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

    // ✅ NUEVO: Variables para datos de sesión previa
    let sessionData = {
        duracionRealPrevia: 0,
        descansoRealPrevio: 0,
        intentosPrevios: 0,
        pomodorosPrevios: 0 // ✅ CORREGIDO: Cambiar nombre para claridad
    };

    // ✅ CORREGIDO: Obtener IDs al inicio
    const urlParams = new URLSearchParams(window.location.search);
    const objectiveId = urlParams.get('id');
    let sessionId = urlParams.get('idSesion') || localStorage.getItem('idSesion');

    if (!objectiveId) {
        alert('No se encontró el ID del objetivo');
        window.location.href = '/home/home.html';
        return;
    }

    // ✅ NUEVO: Log para debugging
    console.log('objectiveId:', objectiveId);
    console.log('sessionId obtenido:', sessionId);
    console.log('sessionId desde URL:', urlParams.get('idSesion'));
    console.log('sessionId desde localStorage:', localStorage.getItem('idSesion'));

    // ✅ FUNCIÓN CORREGIDA: Cargar datos de sesión previa con logs detallados
    const loadSessionDataFromAPI = async () => {
        console.log('🔍 === INICIANDO CARGA DE DATOS DE SESIÓN ===');
        console.log('sessionId disponible:', sessionId);
        
        if (!sessionId) {
            console.log('❌ No hay idSesion, iniciando sesión nueva');
            console.log('sessionData se mantiene:', sessionData);
            return;
        }

        try {
            const url = `http://100.29.28.174:7000/sesiones/${sessionId}`;
            console.log('🌐 Haciendo GET a:', url);
            
            const response = await fetch(url);
            console.log('📡 Respuesta del GET:', response.status, response.statusText);
            
            if (!response.ok) {
                console.warn('⚠️ No se pudo cargar la sesión previa, iniciando nueva');
                console.log('sessionData se mantiene:', sessionData);
                return;
            }
            
            const data = await response.json();
            console.log('📋 DATOS COMPLETOS recibidos del GET:', data);
            
            // Verificar que los campos existen
            console.log('🔍 Verificando campos individuales:');
            console.log('  data.duracionReal:', data.duracionReal, typeof data.duracionReal);
            console.log('  data.descansoReal:', data.descansoReal, typeof data.descansoReal);
            console.log('  data.intentos:', data.intentos, typeof data.intentos);
            console.log('  data.pomodoros:', data.pomodoros, typeof data.pomodoros);
            
            // Guardar datos previos con conversión explícita
            const duracionPrev = parseInt(data.duracionReal) || 0;
            const descansoPrev = parseInt(data.descansoReal) || 0;
            const intentosPrev = parseInt(data.intentos) || 0;
            const pomodorosPrev = parseInt(data.pomodoros) || 0;
            
            console.log('🔢 Valores convertidos:');
            console.log('  duracionPrev:', duracionPrev);
            console.log('  descansoPrev:', descansoPrev);
            console.log('  intentosPrev:', intentosPrev);
            console.log('  pomodorosPrev:', pomodorosPrev);
            
            // Actualizar sessionData
            sessionData.duracionRealPrevia = duracionPrev;
            sessionData.descansoRealPrevio = descansoPrev;
            sessionData.intentosPrevios = intentosPrev;
            sessionData.pomodorosPrevios = pomodorosPrev; // ✅ CORREGIDO: Ahora se suma
            
            console.log('✅ sessionData ACTUALIZADO:', sessionData);
            
        } catch (error) {
            console.error('❌ Error al cargar datos de sesión previa:', error);
            console.log('sessionData se mantiene:', sessionData);
        }
        
        console.log('🔍 === FIN CARGA DE DATOS DE SESIÓN ===');
    };

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

    // ✅ FUNCIÓN CORREGIDA: Sumar correctamente los datos previos + actuales (incluyendo pomodoros)
    const enviarMetricasAlBackend = async (estado) => {
        if (!sessionId) {
            console.warn('No hay idSesion, no se pueden enviar métricas');
            return;
        }

        // ✅ PASO 1: Obtener datos actuales de la sesión en curso
        let duracionActual = sessionMetrics.tiempoEfectivo;
        let descansoActual = sessionMetrics.objetivoAlcanzado ? 1 : 0;
        let intentosActuales = sessionMetrics.intentosFallidos;
        let pomodorosActuales = sessionMetrics.pomodorosCompletados; // ✅ NUEVO: Pomodoros de esta sesión

        console.log('=== CÁLCULO DE MÉTRICAS ===');
        console.log('Datos PREVIOS de la sesión (del GET):', sessionData);
        console.log('Datos ACTUALES de esta sesión:', {
            duracionActual,
            descansoActual, 
            intentosActuales,
            pomodorosActuales, // ✅ NUEVO
            estado
        });

        // ✅ PASO 2: Sumar datos previos + datos actuales (TODOS los campos)
        const duracionRealFinal = sessionData.duracionRealPrevia + duracionActual;
        const descansoRealFinal = sessionData.descansoRealPrevio + descansoActual;
        const intentosFinal = sessionData.intentosPrevios + intentosActuales;
        const pomodorosFinal = sessionData.pomodorosPrevios + pomodorosActuales; // ✅ NUEVO: Sumar pomodoros
        
        // ✅ PASO 3: Preparar datos para el PUT
        const datosAEnviar = {
            duracionReal: duracionRealFinal.toString(),
            descansoReal: descansoRealFinal.toString(), 
            intentos: intentosFinal.toString(),
            estado: estado, // Este se reemplaza, no se suma
            pomodoros: pomodorosFinal.toString() // ✅ CORREGIDO: Ahora se suma
        };

        console.log('Datos FINALES a enviar (PREVIOS + ACTUALES):', datosAEnviar);
        console.log('Cálculos:');
        console.log(`  duracionReal: ${sessionData.duracionRealPrevia} + ${duracionActual} = ${duracionRealFinal}`);
        console.log(`  descansoReal: ${sessionData.descansoRealPrevio} + ${descansoActual} = ${descansoRealFinal}`);
        console.log(`  intentos: ${sessionData.intentosPrevios} + ${intentosActuales} = ${intentosFinal}`);
        console.log(`  pomodoros: ${sessionData.pomodorosPrevios} + ${pomodorosActuales} = ${pomodorosFinal}`); // ✅ NUEVO

        try {
            // ✅ PASO 4: Enviar PUT con datos sumados
            const response = await fetch(`http://100.29.28.174:7000/sesiones/${sessionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datosAEnviar)
            });

            if (response.ok) {
                console.log('✅ Métricas actualizadas exitosamente');
                
                // ✅ PASO 5: CRUCIAL - Actualizar TODOS los datos previos para próxima sesión
                sessionData.duracionRealPrevia = duracionRealFinal;
                sessionData.descansoRealPrevio = descansoRealFinal;
                sessionData.intentosPrevios = intentosFinal;
                sessionData.pomodorosPrevios = pomodorosFinal; // ✅ NUEVO: Actualizar pomodoros previos
                
                console.log('🔄 Datos previos actualizados para próxima sesión:', sessionData);
            } else {
                console.error('❌ Error al actualizar las métricas');
            }
        } catch (error) {
            console.error('❌ Error al conectar con el backend:', error);
        }
    };

    // ✅ NUEVA FUNCIÓN: Registrar actividad diaria para racha
    const registrarActividadDiaria = async () => {
        const idUsuario = localStorage.getItem('idUsuario');
        
        if (!idUsuario) {
            console.warn('❌ No se encontró idUsuario para registrar actividad');
            return;
        }

        try {
            console.log('🗓 Registrando actividad diaria para racha...');
            
            const response = await fetch('http://100.29.28.174:7000/actividad', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    idUsuario: parseInt(idUsuario)
                })
            });

            if (response.ok) {
                console.log('✅ Actividad registrada correctamente para racha (OBJETIVO)');
            } else {
                console.error('❌ Error al registrar actividad para racha');
            }
        } catch (error) {
            console.error('❌ Error de red al registrar racha:', error);
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

        // ✅ IMPORTANTE: Solo reiniciar sessionMetrics (datos de la sesión actual)
        // NO reiniciar sessionData (datos previos acumulados)
        sessionMetrics = {
            tiempoEfectivo: 0,
            pomodorosCompletados: 0,
            intentosFallidos: 0,
            objetivoAlcanzado: false,
            tiempoInicioPomodoro: null,
            tiempoAcumulado: 0
        };

        console.log('🔄 Estado reiniciado - sessionData preservado:', sessionData);
        console.log('🔄 sessionMetrics reiniciado:', sessionMetrics);

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
        const stopBtn = document.getElementById('stop-btn');
        
        if (state.status === 'running' || state.status === 'break') {
            startBtn.classList.add('hidden');
            restartBtn.classList.remove('hidden');
            stopBtn.classList.remove('hidden');
        } else if (state.status === 'completed') {
            startBtn.classList.remove('hidden');
            restartBtn.classList.add('hidden');
            stopBtn.classList.add('hidden');
        } else {
            startBtn.classList.remove('hidden');
            restartBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
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

        const minInterval = 5 * 1000;
        const maxInterval = 10 * 1000;

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
        
        // Si el objetivo está completado, crear nueva sesión
        if (state.status === 'completed') {
            // Reiniciar métricas para nueva sesión
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
                
                // ✅ NUEVO: Registrar actividad diaria para racha después de completar objetivo
                registrarActividadDiaria();
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

    const showDeleteModal = () => {
        if (state.status === 'completed') {
            showStatusMessage('❌ No se puede cancelar un objetivo ya completado', 3000);
            return;
        }
        modal.classList.add('visible');
    };

    const hideDeleteModal = () => modal.classList.remove('visible');

    const stopTimer = () => {
        if (state.status === 'completed') {
            showStatusMessage('❌ No se puede cancelar un objetivo ya completado', 3000);
            hideDeleteModal();
            return;
        }
        
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
        console.log('🚀 === INICIALIZANDO APLICACIÓN ===');
        console.log('objectiveId:', objectiveId);
        console.log('sessionId al inicializar:', sessionId);
        
        await requestNotificationPermission();
        
        console.log('📡 Cargando datos de sesión previa...');
        await loadSessionDataFromAPI();
        
        console.log('🎯 Inicializando estado del objetivo...');
        await resetState();
        
        console.log('✅ Aplicación inicializada correctamente');
    };

    initializeApp();
});