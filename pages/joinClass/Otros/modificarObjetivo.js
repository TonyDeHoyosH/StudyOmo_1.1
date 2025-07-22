document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SELECCIÓN DE ELEMENTOS ---
    const taskForm = document.getElementById('task-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const totalTimeInput = document.getElementById('total-time-text');
    const feedbackDisplay = document.getElementById('calculated-time-feedback');

    /**
     * Función inteligente para convertir un texto de duración (ej: "1h 30m") a minutos totales.
     * @param {string} text - El texto introducido por el usuario.
     * @returns {number} - El número total de minutos calculados.
     */
    function parseTimeToMinutes(text) {
        let totalMinutes = 0;
        text = text.toLowerCase(); // Convertimos a minúsculas para que sea insensible a mayúsculas

        // Expresión regular para encontrar las horas (ej: 1h, 2 horas, 3hora)
        const hourMatch = text.match(/(\d+)\s*(h|hora|horas)/);
        if (hourMatch) {
            totalMinutes += parseInt(hourMatch[1], 10) * 60;
        }

        // Expresión regular para encontrar los minutos (ej: 30m, 15min, 45 minutos)
        const minuteMatch = text.match(/(\d+)\s*(m|min|minuto|minutos)/);
        if (minuteMatch) {
            totalMinutes += parseInt(minuteMatch[1], 10);
        }

        // Si no se encontraron "h" o "m", y el texto es solo un número, lo tomamos como minutos.
        if (!hourMatch && !minuteMatch && /^\d+$/.test(text.trim())) {
            totalMinutes = parseInt(text.trim(), 10);
        }

        return totalMinutes;
    }

    // --- 2. LÓGICA DE FEEDBACK EN TIEMPO REAL ---
    if (totalTimeInput && feedbackDisplay) {
        // El evento 'input' se dispara cada vez que el usuario escribe algo.
        totalTimeInput.addEventListener('input', () => {
            const inputText = totalTimeInput.value;
            const calculatedMinutes = parseTimeToMinutes(inputText);

            if (calculatedMinutes > 0) {
                feedbackDisplay.textContent = `Total calculado: ${calculatedMinutes} minutos`;
            } else {
                feedbackDisplay.textContent = ''; // Limpiar si no se reconoce nada
            }
        });
    }


    // --- 3. LÓGICA DEL FORMULARIO ---
    if (taskForm) {
        taskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Calculamos el valor final al momento de guardar
            const totalMinutes = parseTimeToMinutes(totalTimeInput.value);

            const objectiveData = {
                name: document.getElementById('task-name').value.trim(),
                totalTimeInMinutes: totalMinutes, // Guardamos el valor calculado
                pomodoroTime: document.getElementById('pomodoro-time').value,
                breakTime: document.getElementById('break-time').value,
            };

            // Validación
            if (!objectiveData.name || objectiveData.totalTimeInMinutes <= 0) {
                alert('Por favor, ingresa un nombre y un tiempo válido (ej: "1h 30m").');
                return;
            }

            console.log('Datos del objetivo guardados:', objectiveData);
            alert(`Objetivo guardado con un total de ${objectiveData.totalTimeInMinutes} minutos.`);
            
            taskForm.reset();
            feedbackDisplay.textContent = ''; // Limpiar también el feedback
        });
    }

    // --- 4. LÓGICA DEL BOTÓN CANCELAR ---
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            taskForm.reset();
            feedbackDisplay.textContent = '';
            alert('Creación de objetivo cancelada.');
        });
    }
});