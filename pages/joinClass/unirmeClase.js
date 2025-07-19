document.addEventListener('DOMContentLoaded', () => {
    const joinButton = document.getElementById('join-class-button');
    const classCodeInput = document.getElementById('class-code-input');

    /**
     * Valida si el código de la clase tiene el formato correcto (3 letras, 3 números, 6 total).
     */
    function hasValidFormat(code) {
        if (code.length !== 6) return false;
        const letters = code.match(/[a-zA-Z]/g) || [];
        const numbers = code.match(/[0-9]/g) || [];
        return letters.length === 3 && numbers.length === 3;
    }

    joinButton.addEventListener('click', () => {
        const inputCode = classCodeInput.value.trim();
        const inputCodeUpper = inputCode.toUpperCase(); // Convertimos a mayúsculas para comparar

        // --- VALIDACIÓN EN DOS PASOS ---

        // 1. ¿Tiene el formato correcto?
        if (!hasValidFormat(inputCode)) {
            alert('El código no es válido. Debe contener exactamente 3 letras y 3 números.');
            return; // Detenemos la ejecución si el formato es incorrecto.
        }

        // 2. Si el formato es correcto, ¿el código existe en nuestra "base de datos" (localStorage)?
        const validCodes = JSON.parse(localStorage.getItem('studyomo_class_codes')) || [];
        
        if (validCodes.includes(inputCodeUpper)) {
            // ¡Éxito! El código tiene buen formato Y existe.
            alert(`¡Te has unido exitosamente a la clase con el código: ${inputCodeUpper}!`);
            classCodeInput.value = ''; // Limpiamos el campo
        } else {
            // El formato es bueno, pero el código no existe.
            alert('El código tiene el formato correcto, pero no corresponde a ninguna clase existente.');
        }
    });
});