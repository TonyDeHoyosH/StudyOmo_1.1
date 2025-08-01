document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("objective-form");
    const inputNombre = document.getElementById("objective-name");
    const inputDescripcion = document.getElementById("objective-description");
    const inputPomodoros = document.getElementById("total-pomodoros");
    const inputPomodoroTime = document.getElementById("pomodoro-time");
    const inputBreakTime = document.getElementById("break-time");

    formulario.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Recuperar el idUsuario del localStorage
        const idUsuario = localStorage.getItem("idUsuario");

        if (!idUsuario) {
            alert("No has iniciado sesión. Redirigiendo...");
            window.location.href = '/pages/forms/log-in/log-in.html';
            return;
        }

        // Obtener los valores seleccionados del formulario y convertir a float
        let pomodoroTime = parseFloat(inputPomodoroTime.value);
        let breakTime = parseFloat(inputBreakTime.value);

        // Verificar si el valor es un número válido (no NaN)
        if (isNaN(pomodoroTime) || isNaN(breakTime)) {
            alert('Por favor ingresa un valor numérico válido');
            return;
        }

        console.log('Duración Pomodoro:', pomodoroTime);
        console.log('Duración Descanso:', breakTime);

        // Crear el objeto con los datos del formulario
        const objetivoData = {
            idUsuario: parseInt(idUsuario),
            nombre: inputNombre.value,
            descripcion: inputDescripcion.value,
            totalPomodoros: parseInt(inputPomodoros.value),
            duracionPomodoro: pomodoroTime, // Tiempo de pomodoro elegido
            duracionDescanso: breakTime // Tiempo de descanso elegido
        };

        // Enviar los datos a la API
        try {
            const response = await fetch('http://100.29.28.174:7000/objetivos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(objetivoData),
            });

            if (response.ok) {
                const data = await response.json();
                alert('Objetivo creado exitosamente');
                console.log(data); // Muestra la respuesta de la API (incluye idObjetivo y idSesion)

                // Guardar idObjetivo en localStorage
                localStorage.setItem('idObjetivo', data.idObjetivo);
                localStorage.setItem('pomodoroTime', objetivoData.duracionPomodoro);
                localStorage.setItem('breakTime', objetivoData.duracionDescanso);
                localStorage.setItem('totalPomodoros', objetivoData.totalPomodoros);
                localStorage.setItem('objectiveName', objetivoData.nombre);

                console.log('idObjetivo guardado en localStorage:', data.idObjetivo);

                // Redirigir a la página de detalles del objetivo con el id del objetivo creado
                window.location.href = `/pages/objective/objective.html?id=${data.idObjetivo}`;

            } else {
                const errorData = await response.json();
                alert('Error al crear el objetivo: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error al enviar los datos:', error);
            alert('Error en la conexión con el servidor');
        }
    });
});

