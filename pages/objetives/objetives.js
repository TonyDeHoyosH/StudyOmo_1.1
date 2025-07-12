document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS PRINCIPALES DEL DOM ---
    const appContent = document.getElementById('app-content');
    const timerView = document.getElementById('timer-view');
    const modalOverlay = document.getElementById('modal-overlay');

    // --- PLANTILLAS HTML ---
    const templates = {
        home: document.getElementById('template-home-view'),
        form: document.getElementById('template-form-view'),
        objectivesList: document.getElementById('template-objectives-list-view'),
        objectiveItem: document.getElementById('template-objective-item'),
    };

    // --- ESTADO GLOBAL DE LA APLICACIÓN ---
    let state = {};
    let savedObjectives = [];

    const resetState = () => {
        clearInterval(state.timerInterval);
        state = {
            timerInterval: null,
            totalSeconds: 0,
            status: 'idle',
            isBreak: false,
            pomodorosDone: 0,
            currentObjectiveId: null,
        };
    };

    // --- LÓGICA DE RENDERIZADO DE VISTAS ---
    const render = (template, container) => {
        container.innerHTML = '';
        container.appendChild(template.content.cloneNode(true));
    };

    const renderHome = () => {
        switchView(appContent);
        render(templates.home, appContent);
    };

    const renderForm = () => {
        switchView(appContent);
        render(templates.form, appContent);
    };

    const renderObjectivesList = () => {
        switchView(appContent);
        render(templates.objectivesList, appContent);
        const listContainer = appContent.querySelector('.objectives-list');
        listContainer.innerHTML = ''; 

        if (savedObjectives.length === 0) {
            listContainer.innerHTML = '<p style="color: white; text-align: center;">Aún no tienes objetivos guardados.</p>';
            return;
        }

        savedObjectives.forEach(obj => {
            const itemClone = templates.objectiveItem.content.cloneNode(true);
            const itemElement = itemClone.querySelector('.objective-item');
            
            itemElement.dataset.id = obj.id;
            itemClone.querySelector('.objective-item__name').textContent = obj.name;
            const details = itemClone.querySelectorAll('.objective-item__detail');
            details[0].textContent = `${obj.totalHours} Horas`;
            details[1].textContent = `${obj.totalPomodoros} Pomodoros`;

            listContainer.appendChild(itemClone);
        });
    };

    // --- LÓGICA DEL TEMPORIZADOR ---
    const setupTimerView = (objective) => {
        resetState();
        state.currentObjectiveId = objective.id;

        const timerName = timerView.querySelector('#task-name');
        const timerTime = timerView.querySelector('#task-total-time');
        const timerPoms = timerView.querySelector('#task-pomodoros');

        timerName.textContent = objective.name;
        timerTime.textContent = `${objective.totalHours} Horas`;
        timerPoms.textContent = `${objective.totalPomodoros} Pomodoros`;
        
        setupSession(false);
        switchView(timerView);
    };
    
    // ... (El resto de las funciones del temporizador: startTimer, handleTimerEnd, setupSession, etc. se mantienen igual que en la respuesta anterior) ...
    // Se omiten aquí por brevedad, pero están incluidas en el bloque de código final.

    // --- MANEJADOR DE EVENTOS PRINCIPAL (DELEGACIÓN DE EVENTOS) ---
    document.addEventListener('click', (e) => {
        const actionTarget = e.target.closest('[data-action]');
        if (!actionTarget) return;

        const action = actionTarget.dataset.action;

        switch (action) {
            case 'go-home': renderHome(); break;
            case 'show-form': renderForm(); break;
            case 'add-objective': renderForm(); break;
            case 'show-objectives': renderObjectivesList(); break;
            case 'edit-objective': {
                // Lógica para editar (puede ser mostrar el formulario con datos)
                renderForm();
                break;
            }
            case 'play-objective': {
                const objectiveId = parseInt(actionTarget.closest('.objective-item').dataset.id);
                const objectiveToPlay = savedObjectives.find(obj => obj.id === objectiveId);
                if (objectiveToPlay) setupTimerView(objectiveToPlay);
                break;
            }
            case 'start-timer': startTimer(); break;
            case 'restart-timer': setupSession(state.isBreak); break;
            case 'stop-timer': showConfirmationModal(); break;
            case 'confirm-delete': stopAndExitConfirmed(); break;
            case 'cancel-delete': hideConfirmationModal(); break;
        }
    });

    appContent.addEventListener('submit', (e) => {
        if (e.target.dataset.action === 'create-objective') {
            e.preventDefault();
            const form = e.target;
            const pomodoros = parseInt(form.querySelector('#total-pomodoros').value);
            const pomodoroTime = parseInt(form.querySelector('#pomodoro-time').value);
            const breakTime = parseInt(form.querySelector('#break-time').value);

            const totalMinutes = (pomodoroTime * pomodoros) + (breakTime * (pomodoros > 1 ? pomodoros - 1 : 0));
            
            const newObjective = {
                id: Date.now(),
                name: form.querySelector('#objective-name').value || 'Sin Nombre',
                pomodoroTime: pomodoroTime,
                breakTime: breakTime,
                totalPomodoros: pomodoros,
                totalHours: Math.floor(totalMinutes / 60),
            };
            
            savedObjectives.push(newObjective);
            setupTimerView(newObjective);
        }
    });

    // --- INICIALIZACIÓN ---
    const initApp = () => {
        resetState();
        renderHome();
    };
    
    initApp();
});