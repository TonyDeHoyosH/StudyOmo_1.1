document.addEventListener('DOMContentLoaded', () => {
    function guardarIdUsuarioYRedirigir(urlDeRedireccion) {
        // A. Asumimos que los datos del usuario están guardados en localStorage después del login.
        // La clave que usamos aquí es 'studyomo_user'. ¡Cámbiala si en tu app se llama diferente!
        const datosUsuarioString = localStorage.getItem('usuario');

        // B. Verificamos si existen datos del usuario.
        if (!datosUsuarioString) {
            alert('Error: No se encontraron datos de la sesión de usuario. Por favor, inicia sesión de nuevo.');
            return; // Detenemos la ejecución si no hay usuario logueado.
        }

        // C. Convertimos la cadena de texto de vuelta a un objeto JavaScript.
        const usuario = JSON.parse(datosUsuarioString);

        // D. Extraemos el idUsuario del objeto.
        // ¡Asegúrate de que la propiedad en tu objeto de usuario se llame 'idUsuario'!
        const idUsuario = usuario.idUsuario;

        // E. Verificamos que el idUsuario exista en el objeto.
        if (!idUsuario) {
            alert('Error: No se pudo obtener el identificador de usuario. Por favor, intenta iniciar sesión de nuevo.');
            return; // Detenemos la ejecución.
        }

        // F. Si todo es correcto, guardamos el idUsuario en localStorage para uso futuro.
        // Usamos una nueva clave para no sobreescribir el objeto de usuario completo.
        localStorage.setItem('studyomo_currentUserId', idUsuario);
        console.log(`ID de usuario "${idUsuario}" guardado correctamente en localStorage.`);

        window.location.href = urlDeRedireccion;
    }


    // -------------------------------------------------------------------
    // LÓGICA PARA UNIRSE A UNA CLASE (PÁGINA CON EL INPUT DE CÓDIGO)
    // -------------------------------------------------------------------
    const joinButton = document.getElementById('join-class-button');
    const codeInput = document.getElementById('class-code-input');

    if (joinButton && codeInput) {
        joinButton.addEventListener('click', () => {
            // 1. Obtener el código ingresado por el usuario.
            const enteredCode = codeInput.value.trim().toUpperCase();

            // 2. Validar que el usuario haya escrito algo.
            if (enteredCode === '') {
                alert('Por favor, ingresa un código de clase.');
                return;
            }

            // 3. Obtener los códigos válidos de localStorage.
            const validCodes = JSON.parse(localStorage.getItem('studyomo_class_codes')) || [];

            // 4. Verificar si el código ingresado existe en la lista de códigos válidos.
            if (validCodes.includes(enteredCode)) {
                // ¡ÉXITO! El código es válido.
                console.log(`Código "${enteredCode}" válido. Procediendo a guardar datos y redirigir...`);

                // 5. LLAMADA A LA NUEVA FUNCIÓN para guardar el idUsuario y redirigir.
                guardarIdUsuarioYRedirigir('./misClases.html');
                
            } else {
                // ERROR: El código no es válido.
                console.error(`Intento de unirse con código inválido: "${enteredCode}"`);
                alert('El código de la clase no es válido. Por favor, verifica e inténtalo de nuevo.');
            }
        });
    }

    // -------------------------------------------------------------------
    // LÓGICA PARA HACER CLIC EN ITEMS DE CLASE EXISTENTES
    // -------------------------------------------------------------------
    const classItems = document.querySelectorAll('.class-item');
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
});