
        // Espera a que todo el contenido HTML esté cargado antes de ejecutar el script.
        document.addEventListener('DOMContentLoaded', () => {

            // --- SIMULACIÓN DE DATOS JSON ---
            // En una aplicación real, obtendrías este objeto desde tu base de datos
            // usando una llamada de red (API), por ejemplo con fetch().
            const datosUsuarioJSON = {
                "nombre": "Ana Sofia",
                "idUsuario": "981245",
                "tiempoEfectivo": "12h:35m",
                "pomodorosTerminados": 15,
                "objetivosAlcanzados": 4,
                "intentosFallidos": 2
            };

            // Función para cargar los datos en el HTML
            function cargarDatos(datos) {
                // 1. Seleccionar los elementos del HTML por su ID
                const nombreEl = document.getElementById('userData-name');
                const tiempoEl = document.getElementById('userData-time');
                const pomodorosEl = document.getElementById('userData-pomodoros');
                const objetivosEl = document.getElementById('userData-goals');
                const fallidosEl = document.getElementById('userData-fails');

                // 2. Actualizar el contenido de cada elemento con los datos del JSON
                nombreEl.textContent = `Usuario: ${datos.nombre} | ${datos.idUsuario}`;
                tiempoEl.textContent = datos.tiempoEfectivo;
                pomodorosEl.textContent = String(datos.pomodorosTerminados).padStart(2, '0'); // Añade un 0 si es menor a 10
                objetivosEl.textContent = String(datos.objetivosAlcanzados).padStart(2, '0');
                fallidosEl.textContent = datos.intentosFallidos;
            }

            // 3. Llamar a la función con los datos simulados
            cargarDatos(datosUsuarioJSON);

        });

