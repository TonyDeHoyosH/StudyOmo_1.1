// Espera a que todo el contenido de la página (DOM) se cargue por completo.
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------
    // LÓGICA PARA LA PÁGINA "MIS CLASES" (verClase.html)
    // -------------------------------------------------------------------
    // Esta sección solo se ejecutará si encuentra elementos '.class-item'
    const classItems = document.querySelectorAll('.class-item');
    if (classItems.length > 0) {
        console.log("Inicializando lógica para la lista de clases.");
        classItems.forEach(item => {
            item.addEventListener('click', (event) => {
                if (event.target.closest('.class-item__button')) {
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
    // LÓGICA PARA EL BOTÓN "CREAR CLASE" (CORREGIDO Y UNIFICADO)
    // -------------------------------------------------------------------
    // Esta sección solo se ejecutará si encuentra el botón '#crearClaseBtn'
    const crearClaseButton = document.getElementById('crearClaseBtn');
    if (crearClaseButton) {
        console.log("Inicializando lógica del botón 'Crear Clase'.");

        // Se añade UN SOLO evento de clic para manejar toda la lógica.
        crearClaseButton.addEventListener('click', (event) => {
            // Previene el comportamiento por defecto del botón (como enviar un formulario).
            event.preventDefault();
 
            // 1. OBTENER Y VALIDAR EL NOMBRE DE LA CLASE
            const classNameInput = document.getElementById('class-name');
            const className = classNameInput.value.trim(); // .trim() elimina espacios en blanco

            // 2. VERIFICAR SI EL CAMPO ESTÁ VACÍO
            if (className === '') {
                // Si está vacío, muestra una alerta y DETIENE la ejecución.
                alert('Por favor, ingresa el nombre de la clase para continuar.');
                return; // Importante: el 'return' evita que el código de abajo se ejecute.
            }

            // 3. SI LA VALIDACIÓN ES EXITOSA, CONTINUAR
            // Si el código llega hasta aquí, significa que el nombre de la clase es válido.
            console.log(`Nombre de clase válido: "${className}". Redirigiendo a la siguiente página.`);
            
            // Aquí puedes guardar el nombre de la clase en localStorage si lo necesitas en la otra página
            // localStorage.setItem('nueva_clase_nombre', className);

            // Redirige a la página para ver las clases.
            window.location.href = 'verClase.html';
        });
    }

    // -------------------------------------------------------------------
    // LÓGICA PARA LA PÁGINA DE GENERACIÓN DE CÓDIGO
    // -------------------------------------------------------------------
    // Esta sección solo se ejecutará si encuentra el elemento '.code-number'
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