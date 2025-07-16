document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('home-view');
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
            timerInterval: null,
            totalSeconds: 0,
            status: 'idle', // idle, running, paused, break, completed
            isBreak: false,
            pomodorosDone: 0,
            objective: {}
        };
    };

    const switchView = (viewToShow) => {
        homeView.classList.toggle('hidden', viewToShow !== homeView);
        timerView.classList.toggle('hidden', viewToShow !== timerView);
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
            case 'running':
                taskCard.classList.add('task-card--activo');
                break;
            case 'break':
                taskCard.classList.add('task-card--descanso');
                break;
            case 'paused':
                taskCard.classList.add('task-card--pausado');
                break;
            case 'completed':
                taskCard.classList.add('task-card--finalizado');
                break;
        }
    };

    const updateControlButtonsUI = () => {
        const playBtn = timerView.querySelector('[data-action="start-timer"]');
        const pauseBtn = timerView.querySelector('[data-action="pause-timer"]');
        const restartBtn = timerView.querySelector('[data-action="restart-timer"]');
        const stopBtn = timerView.querySelector('[data-action="stop-timer"]');
        const statusMessage = timerView.querySelector('#status-message');

        const isTimerActive = state.status === 'running' || state.status === 'break';
        const isCompleted = state.status === 'completed';

        playBtn.classList.toggle('hidden', isTimerActive);
        pauseBtn.classList.toggle('hidden', !isTimerActive);
        
        restartBtn.classList.toggle('hidden', state.status === 'idle' || isCompleted);
        
        stopBtn.classList.toggle('hidden', isCompleted);
        
        if (isCompleted) {
            statusMessage.textContent = '¡Objetivo completado!';
        }
        statusMessage.classList.toggle('hidden', !isCompleted);
        
        updateTaskCardUI();
    };

    const startTimer = () => {
        // CORRECCIÓN 1: Si se reanuda desde una pausa, el objetivo se reinicia por completo.
        if (state.status === 'paused') {
            state.pomodorosDone = 0;    // Se resetea el progreso de pomodoros.
            setupSession(false);        // Se prepara el primer pomodoro.
        }

        if (state.timerInterval) return;
        
        state.status = state.isBreak ? 'break' : 'running';
        
        state.timerInterval = setInterval(() => {
            state.totalSeconds--;
            updateTimerUI();
            if (state.totalSeconds <= 0) {
                handleTimerEnd();
            }
        }, 1000);
        
        updateControlButtonsUI();
    };

    const pauseTimer = () => {
        if (!state.timerInterval) return;
        clearInterval(state.timerInterval);
        state.timerInterval = null; 
        state.status = 'paused';
        updateControlButtonsUI();
    };

    const stopAndExitConfirmed = () => {
        hideConfirmationModal();
        resetState();
        renderHome();
    };

    const handleTimerEnd = () => {
        clearInterval(state.timerInterval);
        state.timerInterval = null;

        if (!state.isBreak) { // Fin de un pomodoro
            state.pomodorosDone++;
            if (state.pomodorosDone >= state.objective.totalPomodoros) {
                state.status = 'completed';
                updateControlButtonsUI();
            } else {
                setupSession(true); 
                startTimer();       
            }
        } else { // Fin de un descanso
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

    const renderForm = () => {
        const contentWrapper = homeView.querySelector('#content-wrapper');
        contentWrapper.innerHTML = `
            <form data-action="create-objective" class="objective-form">
                <div class="objective-form__group">
                    <label for="objective-name">Nombre:</label>
                    <input type="text" id="objective-name" placeholder="Escribe el nombre del Objetivo" required maxlength="100">
                </div>
                <div class="objective-form__group">
                    <label for="pomodoro-time">Tiempo Pomodoro:</label>
                    <select id="pomodoro-time" required>
                        <option value="1">1 min</option><option value="10">10 min</option><option value="15">15 min</option>
                        <option value="20">20 min</option><option value="25" selected>25 min</option>
                    </select>
                </div>
                <div class="objective-form__group">
                    <label for="break-time">Tiempo de descanso:</label>
                    <select id="break-time" required>
                        <option value="1">1 min</option><option value="2">2 min</option><option value="5" selected>5 min</option>
                    </select>
                </div>
                <div class="objective-form__group">
                    <label for="total-pomodoros">Total de Pomodoros:</label>
                    <input type="number" id="total-pomodoros" min="1" max="10" value="4" required>
                </div>
                <div class="objective-form__buttons">
                    <button type="button" data-action="cancel-form" class="objective-form__button objective-form__button--cancel">Cancelar</button>
                    <button type="submit" class="objective-form__button objective-form__button--save">Guardar</button>
                </div>
            </form>`;
    };
    
    const renderHome = () => {
        switchView(homeView);
        homeView.innerHTML = `
            <section class="focus-prompt">
                <div class="focus-prompt__card">
                    <div class="focus-prompt__logo-container">
                        <img src="../../assets/images/logo_StudyOmo.png" class="focus-prompt__logo" viewBox="0 0 100 100">
                    </div>
                    <div class="focus-prompt__content-wrapper" id="content-wrapper">
                        <div class="initial-view">
                            <h2 class="initial-view__title">Comienza una sesión de concentración... <br>Haz click en el siguiente botón y crea un objetivo </h2>
                            <p class="initial-view__description"></p>
                            <button data-action="show-form" class="initial-view__button">Crear Objetivo</button>
                        </div>
                    </div>
                </div>
            </section>`;
    };

    document.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const action = actionTarget.dataset.action;

        switch (action) {
            case 'show-form': renderForm(); break;
            case 'cancel-form': renderHome(); break;
            case 'start-timer': startTimer(); break;
            case 'pause-timer': pauseTimer(); break;
            case 'restart-timer':
                state.pomodorosDone = 0;    
                setupSession(false);        
                state.status = 'paused';    
                updateControlButtonsUI();   
                break;
            case 'stop-timer': showConfirmationModal(); break;
            case 'confirm-delete': stopAndExitConfirmed(); break;
            case 'cancel-delete': hideConfirmationModal(); break;
        }
    });

    homeView.addEventListener('submit', (e) => {
        if (e.target.dataset.action === 'create-objective') {
            e.preventDefault();
            resetState();
            state.objective = {
                name: e.target.querySelector('#objective-name').value || 'Sin Nombre',
                pomodoroTime: parseInt(e.target.querySelector('#pomodoro-time').value),
                breakTime: parseInt(e.target.querySelector('#break-time').value),
                totalPomodoros: parseInt(e.target.querySelector('#total-pomodoros').value),
            };
            const totalMinutes = (state.objective.pomodoroTime * state.objective.totalPomodoros) + (state.objective.breakTime * (state.objective.totalPomodoros - 1));
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            
            timerView.querySelector('#task-name').textContent = state.objective.name;
            timerView.querySelector('#task-total-time').textContent = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
            
            setupSession(false);
            switchView(timerView);
        }
    });
    
    const initApp = () => {
        timerView.querySelector('[data-action="start-timer"]').innerHTML = ICONS.play;
        timerView.querySelector('[data-action="pause-timer"]').innerHTML = ICONS.pause;
        timerView.querySelector('[data-action="restart-timer"]').innerHTML = ICONS.restart;
        timerView.querySelector('[data-action="stop-timer"]').innerHTML = ICONS.stop;
        
        resetState();
        renderHome();
    };
    
    initApp();
});