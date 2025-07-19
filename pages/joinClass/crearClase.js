// Espera a que todo el contenido de la página (DOM) se cargue por completo.
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------
    // LÓGICA PARA LA PÁGINA "MIS CLASES" (verClase.html)
    // -------------------------------------------------------------------
    const classItems = document.querySelectorAll('.class-item');

    if (classItems.length > 0) {
        console.log("Inicializando lógica para la lista de clases.");
        classItems.forEach(item => {
            // Este evento es para hacer clic en TODA la fila
            item.addEventListener('click', (event) => {
                // Si el clic fue en un botón (ojo o play), no hacemos nada aquí
                if (event.target.closest('.class-item__button')) {
                    console.log("Clic en un botón de acción, no en la fila.");
                    return;
                }
                const url = item.getAttribute('data-url');
                if (url) {
                    window.location.href = url;
                }
            });
        });
    }

    // -------------------------------------------------------------------
    // LÓGICA PARA EL BOTÓN "CREAR CLASE" (CORREGIDO)
    // -------------------------------------------------------------------
    const crearClaseButton = document.getElementById('crearClaseBtn');

    if (crearClaseButton) {
        console.log("Inicializando botón para ir a 'verClase.html'.");
        // Se añade el parámetro (event) para poder acceder al evento del clic.
        crearClaseButton.addEventListener('click', (event) => {
            
            // --- ¡AQUÍ ESTÁ LA CORRECCIÓN! ---
            // Esta línea previene el comportamiento por defecto del botón (enviar el formulario).
            event.preventDefault();
            
            // Ahora la redirección se ejecutará sin problemas.
            window.location.href = './verClase.html';
        });
    }

    // -------------------------------------------------------------------
    // LÓGICA PARA LA PÁGINA DE GENERACIÓN DE CÓDIGO
    // -------------------------------------------------------------------
    const codeDisplayElement = document.querySelector('.code-number');

    if (codeDisplayElement) {
        console.log("Inicializando generador de código para la clase.");

        function generateRandomCode() {
            const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const numbers = '0123456789';
            let codeChars = [];

            for (let i = 0; i < 3; i++) {
                codeChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
            }
            for (let i = 0; i < 3; i++) {
                codeChars.push(letters[Math.floor(Math.random() * letters.length)]);
            }

            for (let i = codeChars.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [codeChars[i], codeChars[j]] = [codeChars[j], codeChars[i]];
            }
            return codeChars.join('');
        }

        const storedCodes = JSON.parse(localStorage.getItem('studyomo_class_codes')) || [];
        let newCode;

        do {
            newCode = generateRandomCode();
        } while (storedCodes.includes(newCode));

        codeDisplayElement.textContent = newCode;
        
        storedCodes.push(newCode);
        localStorage.setItem('studyomo_class_codes', JSON.stringify(storedCodes));
        
        console.log(`Código nuevo "${newCode}" fue generado y guardado.`);
    }
});