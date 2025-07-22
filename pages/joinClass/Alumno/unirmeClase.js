document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los contenedores de clase
    const classItems = document.querySelectorAll('.class-item');

    classItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Evita que el clic en los botones internos propague el evento al contenedor
            if (event.target.closest('.class-item__button')) {
                return;
            }

            // Obtiene la URL del atributo data-url
            const url = item.getAttribute('data-url');

            // Redirige a la página especificada si la URL existe
            if (url) {
                window.location.href = url;
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Seleccionar los elementos del DOM
    const joinButton = document.getElementById('join-class-button');
    const codeInput = document.getElementById('class-code-input');

    // Asegurarse de que el botón y el input existen en la página actual
    if (joinButton && codeInput) {
        
        // Agregar un evento de 'click' al botón
        joinButton.addEventListener('click', () => {
            
            // 1. Obtener el código ingresado por el usuario
            // .trim() para quitar espacios en blanco al inicio y al final
            // .toUpperCase() para que la comparación no distinga entre mayúsculas y minúsculas (ej. "abc" será igual a "ABC")
            const enteredCode = codeInput.value.trim().toUpperCase();

            // 2. Validar que el usuario haya escrito algo
            if (enteredCode === '') {
                alert('Por favor, ingresa un código de clase.');
                return; // Detiene la ejecución si no hay nada escrito
            }

            // 3. Obtener los códigos válidos de localStorage
            // El '|| []' es un truco: si no hay nada en localStorage, usa un array vacío para evitar errores.
            const validCodes = JSON.parse(localStorage.getItem('studyomo_class_codes')) || [];

            // 4. Verificar si el código ingresado existe en la lista de códigos válidos
            if (validCodes.includes(enteredCode)) {
                // Si el código es válido:
                console.log(`Código "${enteredCode}" válido. Uniéndose a la clase...`);
                // Redirigir a la siguiente página
                window.location.href = './misClases.html';
            } else {
                // Si el código NO es válido:
                console.error(`Intento de unirse con código inválido: "${enteredCode}"`);
                // Mostrar un mensaje de error al usuario
                alert('El código de la clase no es válido. Por favor, verifica e inténtalo de nuevo.');
                // La página no se redirigirá.
            }
        });
    }
});