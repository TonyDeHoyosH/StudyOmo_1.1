document.addEventListener('DOMContentLoaded', () => {
    const timerView = document.getElementById('timer-view');
    const modalOverlay = document.getElementById('modal-overlay');

    let state = {};

    const ICONS = {
        play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        restart: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
        stop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    };

    const resetState = () => {
        clearInterval(state.timerInterval);
        state = {
            timerInterval: null, totalSeconds: 0,
            status: 'idle', isBreak: false,
            pomodorosDone: 0, objective: {}
        };
    };

    const updateTimerUI = () => {
        const minutes = String(Math.floor(state.totalSeconds / 60)).padStart(2, '0');
        const seconds = String(state.totalSeconds % 60).padStart(2, '0');
        timerView.querySelector('#timer-display').textContent = `${minutes}:${seconds}`;
        const progressRing = timerView.querySelector('#progress-ring-indicator');
        const ringRadius = progressRing.r.baseVal.value;
        const ringCircumference = 2 * Math.PI * ringRadius;
        progressRing.style.strokeDasharray = `${ringCircumference} ${ringCircumference}`;
        const duration = state.isBreak ? state.objective.breakTime * 60 : state.objective.pomodoroTime * 60;
        const percent = duration > 0 ? (duration - state.totalSeconds) / duration * 100 : 0;
        const offset = ringCircumference - (percent / 100) * ringCircumference;
        progressRing.style.strokeDashoffset = offset;
    };
    
    const updateTaskCardUI = () => {
        const taskCard = timerView.querySelector('#task-card');
        taskCard.classList.remove('task-card--activo', 'task-card--pausado', 'task-card--descanso', 'task-card--finalizado');
        switch (state.status) {
            case 'running': taskCard.classList.add('task-card--activo'); break;
            case 'break': taskCard.classList.add('task-card--descanso'); break;
            case 'paused': taskCard.classList.add('task-card--pausado'); break;
            case 'completed': taskCard.classList.add('task-card--finalizado'); break;
        }
    };

    const updateControlButtonsUI = () => {
        const playBtn = timerView.querySelector('[data-action="start-timer"]');
        const pauseBtn = timerView.querySelector('[data-action="pause-timer"]');
        const restartBtn = timerView.querySelector('[data-action="restart-timer"]');
        const stopBtn = timerView.querySelector('[data-action="stop-timer"]');
        const statusMessage = timerView.querySelector('#status-message');
        const isTimerActive = state.status === 'running' || state.status === 'break';
        // En estado 'completed', el botón de play debe aparecer para reiniciar el ciclo.
        const isCompleted = state.status === 'completed';
        playBtn.classList.toggle('hidden', isTimerActive);
        pauseBtn.classList.toggle('hidden', !isTimerActive);
        // Ocultar los botones de control cuando el objetivo se completa.
        restartBtn.classList.toggle('hidden', isCompleted || state.status === 'idle');
        stopBtn.classList.toggle('hidden', isCompleted || state.status === 'idle');
        statusMessage.textContent = isCompleted ? '¡Objetivo completado!' : '';
        statusMessage.classList.toggle('hidden', !isCompleted);
        updateTaskCardUI();
    };

    const startTimer = () => {
        if (state.timerInterval) return;
        state.status = state.isBreak ? 'break' : 'running';
        state.timerInterval = setInterval(() => {
            state.totalSeconds--;
            updateTimerUI();
            if (state.totalSeconds < 0) { // Cambio a < 0 por si acaso
                handleTimerEnd();
            }
        }, 1000);
        updateControlButtonsUI();
    };

    const resetObjectiveToPausedState = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.pomodorosDone = 0;
        state.isBreak = false;
        state.status = 'paused';
        state.totalSeconds = state.objective.pomodoroTime * 60;
        timerView.querySelector('#task-pomodoros').textContent = `1/${state.objective.totalPomodoros} Pomodoros`;
        updateTimerUI();
        updateControlButtonsUI();
    };

    const stopAndExitConfirmed = () => {
        hideConfirmationModal();
        loadInitialObjective();
    };

    const handleTimerEnd = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        if (!state.isBreak) {
            state.pomodorosDone++;
            if (state.pomodorosDone >= state.objective.totalPomodoros) {
                // Evento Fin de Objetivo
                state.status = 'completed';
                state.totalSeconds = 0; // Asegurar que el tiempo sea 0
                updateTimerUI();
                updateControlButtonsUI();
            } else {
                setupSession(true);
                startTimer();       
            }
        } else {
            setupSession(false);
            startTimer();
        }
    };

    const setupSession = (isBreak) => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.isBreak = isBreak;
        if (isBreak) {
            state.totalSeconds = state.objective.breakTime * 60;
            state.status = 'break';
            timerView.querySelector('#task-pomodoros').textContent = `Descanso`;
        } else {
            state.totalSeconds = state.objective.pomodoroTime * 60;
            state.status = 'idle';
            timerView.querySelector('#task-pomodoros').textContent = `${state.pomodorosDone + 1}/${state.objective.totalPomodoros} Pomodoros`;
        }
        updateTimerUI();
        updateControlButtonsUI();
    };
    
    const showConfirmationModal = () => modalOverlay.classList.add('visible');
    const hideConfirmationModal = () => modalOverlay.classList.remove('visible');

    document.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;
        const action = actionTarget.dataset.action;
        switch (action) {
            case 'start-timer':
                // Si el objetivo ya se completó, reinícialo antes de empezar de nuevo.
                if (state.status === 'completed') {
                    loadInitialObjective();
                }
                startTimer();
                break;
            case 'pause-timer': resetObjectiveToPausedState(); break;
            case 'restart-timer': resetObjectiveToPausedState(); break;
            case 'stop-timer': showConfirmationModal(); break;
            case 'confirm-delete': stopAndExitConfirmed(); break;
            case 'cancel-delete': hideConfirmationModal(); break;
        }
    });
    
    // Funciona como el "Evento de Inicio de Objetivo"
    const loadInitialObjective = () => {
        resetState();
        state.objective = {
            name: 'Estudiar JS',
            pomodoroTime: .25, breakTime: .25, totalPomodoros: 2,
        };
        const totalMinutes = (state.objective.pomodoroTime * state.objective.totalPomodoros) + (state.objective.breakTime * (state.objective.totalPomodoros - 1));
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        timerView.querySelector('#task-name').textContent = state.objective.name;
        timerView.querySelector('#task-total-time').textContent = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
        setupSession(false);
    };

    const initApp = () => {
        timerView.querySelector('[data-action="start-timer"]').innerHTML = ICONS.play;
        timerView.querySelector('[data-action="pause-timer"]').innerHTML = ICONS.pause;
        timerView.querySelector('[data-action="restart-timer"]').innerHTML = ICONS.restart;
        timerView.querySelector('[data-action="stop-timer"]').innerHTML = ICONS.stop;
        loadInitialObjective();
    };
    
    initApp();
});