// Espera a que todo el contenido de la página (DOM) se cargue por completo.
document.addEventListener('DOMContentLoaded', () => {

    // -------------------------------------------------------------------
    // --- LÓGICA EXISTENTE: Para la página que muestra la lista de clases ---
    // -------------------------------------------------------------------
    const classItems = document.querySelectorAll('.class-item');

    // Este código solo se ejecutará si encuentra elementos con la clase '.class-item'
    if (classItems.length > 0) {
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
    }


    // -------------------------------------------------------------------
    // --- NUEVA LÓGICA: Para la página de "Unirse a Clase" ---
    // -------------------------------------------------------------------
    const joinForm = document.getElementById('join-class-form');

    // Este código solo se ejecutará si encuentra el formulario con el id 'join-class-form'
    if (joinForm) {
        
        joinForm.addEventListener('submit', (event) => {
            // Prevenir que el formulario recargue la página
            event.preventDefault();

            // 1. Obtener los elementos necesarios del DOM
            const codeInput = document.getElementById('class-code-input');
            const errorMessage = document.getElementById('error-message');
            
            // 2. Obtener el código que el usuario escribió (y pasarlo a mayúsculas)
            const userCode = codeInput.value.trim().toUpperCase();

            // 3. Cargar la lista de códigos válidos desde localStorage
            // (Esta es la lista que se genera en tu página "Crear Clase")
            const validCodes = JSON.parse(localStorage.getItem('studyomo_class_codes')) || [];
            
            // --- AQUÍ ESTÁ LA CONDICIÓN DE VALIDACIÓN ---
            // 4. Comprobar si el código del usuario está en la lista de códigos válidos
            if (validCodes.includes(userCode)) {
                // Si el código es VÁLIDO:
                console.log(`Código válido "${userCode}". Redirigiendo...`);
                errorMessage.textContent = ''; // Limpiar cualquier mensaje de error previo
                
                // Redirigir a la página de "Mis Clases" o a la clase específica
                window.location.href = './verClase.html';  
            } else {
                // Si el código es INVÁLIDO:
                console.error(`Código inválido: "${userCode}"`);
                
                // Mostrar un mensaje de error al usuario y NO redirigir
                errorMessage.textContent = 'El código de la clase no es válido. Por favor, inténtalo de nuevo.';
                
                // Opcional: Agitar el input para dar feedback visual
                codeInput.classList.add('shake-error');
                setTimeout(() => {
                    codeInput.classList.remove('shake-error');
                }, 500);
            }
        });
    }
});