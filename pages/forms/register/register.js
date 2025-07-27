        // Seleccionamos el formulario por su clase
        const registerForm = document.querySelector('.auth-form');

        registerForm.addEventListener('submit', (event) => {
            // 1. Prevenimos el comportamiento por defecto de recargar la página
            event.preventDefault();

            // 2. Obtenemos los valores de los inputs por su ID
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // 3. Creamos el objeto de datos que enviaremos a la API
            const data = {
                nombre: username,
                email: email,
                password: password
            };

            // 4. Realizamos la petición fetch a la API de registro
            fetch('http://100.29.28.174:7000/usuarios/register', {
                method: 'POST', // Método POST para crear un nuevo recurso
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // Convertimos el objeto JS a una cadena JSON
            })
            .then(response => {
                // Si la respuesta no es 'ok' (ej. status 400, 500), lanzamos un error
                if (!response.ok) {
                    // Intentamos leer el cuerpo del error para un mensaje más claro
                    return response.text().then(errorText => {
                    const mensaje = errorText.trim() || 'Ocurrió un error en el registro.';
                    throw new Error(mensaje);
                });
                }
                // Si la respuesta es 'ok', la convertimos a JSON
                return response.text() 
            })
            .then(responseData => {
                // 5. Manejamos la respuesta exitosa
                console.log('Registro exitoso:', responseData);
                alert('¡Cuenta creada exitosamente! Ahora serás redirigido para iniciar sesión.');

                // 6. Redirigimos al usuario a la página de inicio de sesión
                // El `window.location.href` se ejecuta después de que el usuario cierre la alerta.
                window.location.href = '../log-in/log-in.html'; // Cambia esto si tu archivo de login tiene otro nombre
            })
            .catch(error => {
                // 7. Manejamos cualquier error que ocurra durante el proceso
                console.error('Error en el registro:', error);
                alert(`Error al crear la cuenta: ${error.message}`);
            });

            
        });