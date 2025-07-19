document.addEventListener('DOMContentLoaded', () => {

    // --- Seleccionar elementos del DOM ---
    const addObjectiveBtn = document.getElementById('add-objective-btn');
    const modal = document.getElementById('objective-modal');
    const closeModalBtn = modal.querySelector('.close-button');
    const objectiveForm = document.getElementById('objective-form');
    const objectiveDescriptionInput = document.getElementById('objective-description');
    const charCounter = document.getElementById('char-counter');
    const classList = document.getElementById('class-list');

    // --- Funciones para abrir y cerrar el modal ---
    const openModal = () => modal.style.display = 'flex';
    const closeModal = () => modal.style.display = 'none';

    // --- Asignar eventos ---
    addObjectiveBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // --- Lógica del contador de caracteres ---
    objectiveDescriptionInput.addEventListener('input', () => {
        const remaining = 100 - objectiveDescriptionInput.value.length;
        charCounter.textContent = remaining;
    });

    // --- Lógica para guardar el nuevo objetivo ---
    objectiveForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Evitar que la página se recargue

        // Obtener los valores del formulario
        const name = document.getElementById('objective-name').value.trim();
        const description = objectiveDescriptionInput.value.trim();

        if (!name) {
            alert('Por favor, ingresa un nombre para el objetivo.');
            return;
        }

        // Crear el nuevo elemento HTML para el objetivo
        const newObjectiveElement = document.createElement('div');
        newObjectiveElement.className = 'class-item';
        newObjectiveElement.innerHTML = `
            <img src="../../assets/images/logo_StudyOmo.png" alt="Logo Clase" class="class-item__logo">
            <div class="class-item__details">
                <span class="class-item__name">${name}</span>
                <p class="class-item__description">${description}</p>
            </div>
            <div class="class-item__actions">
                <button class="class-item__button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
                <button class="class-item__button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </button>
            </div>
        `;

        // Añadir el nuevo objetivo a la lista
        classList.appendChild(newObjectiveElement);

        // Limpiar el formulario y cerrar el modal
        objectiveForm.reset();
        charCounter.textContent = '100';
        closeModal();
    });
});