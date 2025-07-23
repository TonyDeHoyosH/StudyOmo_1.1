document.addEventListener('DOMContentLoaded', () => {
    const timerView = document.getElementById('timer-view');
    const taskName = document.getElementById('task-name');
    const taskTotalTime = document.getElementById('task-total-time');
    const taskPomodoros = document.getElementById('task-pomodoros');
    const timerDisplay = document.getElementById('timer-display');
    const statusMessage = document.getElementById('status-message');
    
    let state = {};

    // Recuperar los valores de localStorage
    const loadObjectiveFromLocalStorage = () => {
        const pomodoroTime = parseFloat(localStorage.getItem('pomodoroTime')) || 25; // valor por defecto
        const breakTime = parseFloat(localStorage.getItem('breakTime')) || 5; // valor por defecto
        const totalPomodoros = parseInt(localStorage.getItem('totalPomodoros')) || 2; // valor por defecto
        const objectiveName = localStorage.getItem('objectiveName') || 'Estudio de Pomodoro'; // Nombre del objetivo

        return {
            pomodoroTime,
            breakTime,
            totalPomodoros,
            objectiveName
        };
    };

    const objective = loadObjectiveFromLocalStorage();  // Obtener los datos del objetivo almacenados

    const resetState = () => {
        clearInterval(state.timerInterval);
        state = {
            timerInterval: null,
            totalSeconds: 0,
            status: 'idle',
            isBreak: false,
            pomodorosDone: 0,
            objective: objective,  // Asignar el objetivo con los valores dinámicos
            sessionActive: false
        };
    };

    // Mostrar el nombre del objetivo en la interfaz
    taskName.textContent = objective.objectiveName;  // Mostrar el nombre del objetivo en la vista

    // Mostrar el tiempo total en la interfaz (en formato horas y minutos)
    const totalMinutes = (objective.pomodoroTime * objective.totalPomodoros) + 
                         (objective.breakTime * (objective.totalPomodoros - 1));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    taskTotalTime.textContent = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;

    const updateTimerUI = () => {
        const minutes = String(Math.floor(state.totalSeconds / 60)).padStart(2, '0');
        const seconds = String(state.totalSeconds % 60).padStart(2, '0');
        timerDisplay.textContent = `${minutes}:${seconds}`;

        const progressRing = timerView.querySelector('#progress-ring-indicator');
        const ringRadius = progressRing.r.baseVal.value;
        const ringCircumference = 2 * Math.PI * ringRadius;
        progressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;

        const duration = state.isBreak ? state.objective.breakTime * 60 : state.objective.pomodoroTime * 60;
        const percent = duration > 0 ? (duration - state.totalSeconds) / duration * 100 : 0;
        const offset = ringCircumference - (percent / 100) * ringCircumference;
        progressRing.style.strokeDashoffset = offset;
    };

    const setupSession = (isBreak) => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.isBreak = isBreak;

        if (isBreak) {
            state.totalSeconds = state.objective.breakTime * 60;
            state.status = 'break';
            taskPomodoros.textContent = `Descanso`;
        } else {
            state.totalSeconds = state.objective.pomodoroTime * 60;
            state.status = 'idle';
            taskPomodoros.textContent = `${state.pomodorosDone + 1}/${state.objective.totalPomodoros} Pomodoros`;
        }

        updateTimerUI();
    };

    const startTimer = () => {
        if (state.timerInterval) return;

        state.status = state.isBreak ? 'break' : 'running';
        state.sessionActive = true; // Marcar sesión como activa

        state.timerInterval = setInterval(() => {
            state.totalSeconds--;
            updateTimerUI();
            if (state.totalSeconds < 0) {
                handleTimerEnd();
            }
        }, 1000);
    };

    const handleTimerEnd = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;

        if (!state.isBreak) {
            state.pomodorosDone++;
            if (state.pomodorosDone >= state.objective.totalPomodoros) {
                // Objetivo completado
                state.status = 'completed';
                state.sessionActive = false;
                state.totalSeconds = 0;
                updateTimerUI();
            } else {
                setupSession(true);  // Iniciar descanso
                startTimer();
            }
        } else {
            setupSession(false);  // Iniciar nuevo pomodoro
            startTimer();
        }
    };

    const pauseTimer = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.sessionActive = false;
        statusMessage.textContent = "Intento fallido"; // Mostrar mensaje de intento fallido
        statusMessage.classList.remove('hidden');
        updateTimerUI();
    };

    const cancelTimer = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.sessionActive = false;
        statusMessage.classList.add('hidden'); // Ocultar el mensaje
        resetState(); // Reiniciar el temporizador
        updateTimerUI();
    };

    // Vincular el evento del botón "Pausar"
    const pauseButton = timerView.querySelector('#pause-btn');
    pauseButton.addEventListener('click', pauseTimer);

    // Vincular el evento del botón "Iniciar"
    const startButton = timerView.querySelector('#start-btn');
    startButton.addEventListener('click', startTimer);

    // Vincular el evento del botón "Cancelar"
    const stopButton = timerView.querySelector('#stop-btn');
    stopButton.addEventListener('click', cancelTimer);

    // Inicializar la aplicación con los datos dinámicos
    resetState();
    setupSession(false);  // Iniciar con la primera sesión de pomodoro
});
