document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('home-view');
    const timerView = document.getElementById('timer-view');
    const modalOverlay = document.getElementById('modal-overlay');

    let state = {};

    const ICONS = {
        play: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
        restart: '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
        stop: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
    };

    const resetState = () => {
        clearInterval(state.timerInterval);
        state = {
            timerInterval: null,
            totalSeconds: 0,
            status: 'idle',
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
        const percent = duration > 0 ? (state.totalSeconds / duration) * 100 : 0;
        const offset = ringCircumference - (percent / 100) * ringCircumference;
        progressRing.style.strokeDashoffset = offset;
    };

    const updateControlButtonsUI = () => {
        const playBtn = timerView.querySelector('[data-action="start-timer"]');
        const restartBtn = timerView.querySelector('[data-action="restart-timer"]');
        const stopBtn = timerView.querySelector('[data-action="stop-timer"]');
        const taskCard = timerView.querySelector('#task-card');
        const statusMessage = timerView.querySelector('#status-message');

        const isRunning = state.status === 'running' || state.status === 'break';
        const isCompleted = state.status === 'completed';

        playBtn.classList.toggle('hidden', isRunning || isCompleted);
        restartBtn.classList.toggle('hidden', isCompleted);
        stopBtn.classList.toggle('hidden', isCompleted);
        
        taskCard.classList.remove('task-card--completed');
        if (isCompleted) {
            taskCard.classList.add('task-card--completed');
            statusMessage.textContent = '¡Objetivo completado!';
        }
        statusMessage.classList.toggle('hidden', !isCompleted);
    };

    const startTimer = () => {
        if (state.status === 'running') return;
        state.status = 'running';
        
        state.timerInterval = setInterval(() => {
            state.totalSeconds--;
            updateTimerUI();
            if (state.totalSeconds <= 0) handleTimerEnd();
        }, 1000);
        
        updateControlButtonsUI();
    };

    const stopAndExitConfirmed = () => {
        hideConfirmationModal();
        resetState();
        renderHome();
    };

    const handleTimerEnd = () => {
        clearInterval(state.timerInterval);
        if (!state.isBreak) {
            state.pomodorosDone++;
            if (state.pomodorosDone >= state.objective.totalPomodoros) {
                state.status = 'completed';
                updateControlButtonsUI();
            } else {
                setupSession(true);
                startTimer();
            }
        } else {
            setupSession(false);
        }
    };

    const setupSession = (isBreak) => {
        clearInterval(state.timerInterval);
        state.isBreak = isBreak;
        
        if (isBreak) {
            state.status = 'break';
            state.totalSeconds = state.objective.breakTime * 60;
            timerView.querySelector('#task-pomodoros').textContent = 'Descanso';
        } else {
            state.status = 'idle';
            state.totalSeconds = state.objective.pomodoroTime * 60;
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
                <div class="objective-form__group"><label for="objective-name">Nombre:</label><input type="text" id="objective-name" placeholder="Leer Libro" required maxlength="30"></div>
                <div class="objective-form__group"><label for="pomodoro-time">Tiempo Pomodoro:</label><div><input type="number" id="pomodoro-time" min="1" max="60" value="25" required><span>min</span></div></div>
                <div class="objective-form__group"><label for="break-time">Tiempo de descanso:</label><div><input type="number" id="break-time" min="1" max="30" value="5" required><span>min</span></div></div>
                <div class="objective-form__group"><label for="total-pomodoros">Total de Pomodoros:</label><div><input type="number" id="total-pomodoros" min="1" max="10" value="4" required></div></div>
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
                    <div class="focus-prompt__logo-container"><svg class="focus-prompt__logo" viewBox="0 0 100 100"><defs><clipPath id="circleClip"><circle cx="50" cy="50" r="50" /></clipPath></defs><g clip-path="url(#circleClip)"><rect width="100" height="100" fill="#aed6f1"/><path d="M -10 110 C 20 20, 70 40, 50 110" fill="#2e86c1"/><path d="M 110 -10 C 40 40, 80 80, 110 50" fill="#4b9dde"/><path d="M -10 -10 C 30 50, 50 20, 110 -10" fill="#fff"/><path d="M -10 110 C 50 50, 20 80, -10 40" fill="#fff"/></g></svg></div>
                    <div class="focus-prompt__content-wrapper" id="content-wrapper">
                        <div class="initial-view">
                            <h2 class="initial-view__title">Comienza una sesión de concentración...</h2>
                            <p class="initial-view__description">Haz click en el siguiente botón y crea un objetivo.</p>
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
            case 'restart-timer': setupSession(state.isBreak); break;
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
            timerView.querySelector('#task-total-time').textContent = `${hours}h ${minutes}m`;
            
            setupSession(false);
            switchView(timerView);
        }
    });
    
    const initApp = () => {
        timerView.querySelector('[data-action="start-timer"]').innerHTML = ICONS.play;
        timerView.querySelector('[data-action="restart-timer"]').innerHTML = ICONS.restart;
        timerView.querySelector('[data-action="stop-timer"]').innerHTML = ICONS.stop;
        
        resetState();
        renderHome();
    };
    
    initApp();
});