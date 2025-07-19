        // Seleccionamos el formulario por su clase
        const loginForm = document.querySelector('.auth-form');

        // Añadimos un 'escuchador' para el evento 'submit' del formulario
        loginForm.addEventListener('submit', (event) => {
            // 1. Prevenimos el comportamiento por defecto del formulario (que es recargar la página)
            event.preventDefault();

            // 2. Obtenemos los elementos de input por su ID
            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');

            // 3. Extraemos los valores (el texto) de los inputs
            const email = emailInput.value;
            const password = passwordInput.value;

            // 4. Creamos el objeto de datos para enviar en formato JSON
            const data = {
                email: email,
                password: password
            };

            // 5. Realizamos la petición fetch a la API
            fetch('http://localhost:7000/usuarios/login', {
                method: 'POST', // Especificamos que el método es POST
                headers: {
                    // Especificamos que el contenido que estamos enviando es de tipo JSON
                    'Content-Type': 'application/json'
                },
                // Convertimos nuestro objeto de JavaScript a una cadena de texto en formato JSON
                body: JSON.stringify(data)
            })
            .then(response => {
                // Verificamos si la respuesta de la red fue exitosa (status 200-299)
                if (!response.ok) {
                    // Si no fue exitosa, lanzamos un error para ser capturado por el .catch()
                    throw new Error(`Error HTTP! estado: ${response.status}`);
                }
                // Si la respuesta es exitosa, la convertimos a JSON
                return response.json();
            })
            .then(data => {
                // Manejamos la respuesta exitosa de la API
                console.log('Inicio de sesión exitoso:', data);
                // Aquí puedes realizar acciones como redirigir al usuario, guardar un token, etc.
                alert('¡Inicio de sesión exitoso!');
            })
            .catch(error => {
                // Manejamos cualquier error que ocurra durante la petición fetch
                console.error('Hubo un problema con la operación de fetch:', error);
                alert('Error al iniciar sesión. Revisa la consola para más detalles.');
            });
        });