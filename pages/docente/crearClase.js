document.addEventListener("DOMContentLoaded", () => {
    const crearClaseButton = document.getElementById("crearClaseBtn");
    const classNameInput = document.getElementById("class-name");

    // Generar código único para la clase
    const generateRandomCode = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let codeChars = [];

        for (let i = 0; i < 3; i++) {
            codeChars.push(numbers[Math.floor(Math.random() * numbers.length)]);
        }
        for (let i = 0; i < 3; i++) {
            codeChars.push(letters[Math.floor(Math.random() * letters.length)]);
        }

        // Mezclar caracteres generados
        for (let i = codeChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [codeChars[i], codeChars[j]] = [codeChars[j], codeChars[i]];
        }

        return codeChars.join('');
    };

    // Lógica para cuando se hace clic en el botón de "Crear Clase"
    crearClaseButton.addEventListener("click", async () => {
        const className = classNameInput.value.trim(); // Recuperamos el valor y eliminamos espacios al inicio y final.

        // Verificar que el nombre de la clase no esté vacío.
        if (!className) {
            alert("Por favor, ingresa un nombre para la clase.");
            return; // Si el nombre está vacío, detenemos la ejecución aquí y no enviamos la solicitud.
        }

        const code = generateRandomCode(); // Generamos un código único para la clase.
        const idUsuario = localStorage.getItem("idUsuario");

        if (!idUsuario) {
            alert("No has iniciado sesión.");
            window.location.href = "/login"; // O la URL correcta de login
            return;
        }

        // Datos para enviar a la API
        const classData = {
            nombre: className,
            codigoUnico: code,
            idUsuarioCreador: parseInt(idUsuario),  // Convertimos el idUsuario a número
        };

        try {
            // Hacemos la solicitud POST para crear la clase
            const response = await fetch("http://localhost:7000/grupos", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(classData),
            });

            // Leemos la respuesta del servidor como texto
            const responseText = await response.text();  // Obtenemos la respuesta como texto

            // Intentamos convertir la respuesta en JSON solo si es válida
            let responseData;
            try {
                responseData = JSON.parse(responseText);
            } catch (e) {
                responseData = { message: responseText };  // Si no es JSON, lo tratamos como texto
            }

            // Si la respuesta contiene éxito (mensaje de grupo creado)
            if (response.ok) {
                console.log("Clase creada con éxito:", responseData);
                alert("Clase creada exitosamente!");

                // Aquí, guardamos solo el idGrupo del grupo recién creado en el localStorage
                const idGrupo = responseData.idGrupo;  // Solo extraemos el idGrupo
                localStorage.setItem("idGrupo", idGrupo);  // Guardamos solo el ID del grupo recién creado

                // Redirigir a la vista de "Mis clases"
                window.location.href = "/StudyOmo/pages/Docente/verClase.html";  // Redirige a la vista de Mis Clases
            } else {
                // Si la respuesta no es OK, mostramos el error
                console.error("Error en la creación de la clase:", responseData);
                alert("Error al crear la clase: " + responseData.message);
            }
        } catch (error) {
            console.error("Error al conectar con la API:", error);
            alert("Error en la conexión con el servidor");
        }
    });
});
