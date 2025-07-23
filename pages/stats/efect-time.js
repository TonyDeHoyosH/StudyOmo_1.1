document.addEventListener('DOMContentLoaded', () => {
    // El ID del usuario debe estar disponible en localStorage
    const idUsuario = localStorage.getItem('idUsuario');
    if (!idUsuario) {
        alert('No has iniciado sesión. Redirigiendo...');
        window.location.href = '/login';  // Cambia la ruta de login si es necesario
        return;
    }

    // Endpoint para obtener los datos de tiempo por día
    const endpoint = `http://localhost:7000/estadisticas/${idUsuario}/tiempo-por-dia`;

    // Hacemos la solicitud a la API
    fetch(endpoint)
        .then(res => res.json())  // Convertimos la respuesta a JSON
        .then(data => {
            // Imprimir la respuesta para ver qué datos se están recibiendo
            console.log("Respuesta de la API:", data);

            // Verificamos si 'data.data' y 'data.labels' existen en la respuesta de la API
            if (!data.data || !data.labels) {
                console.error('Los datos de la API no están bien formateados:', data);
                alert('Datos incompletos de la API. Revisa la consola.');
                return;
            }

            // Obtener el nombre del usuario desde localStorage
            const nombreUsuario = localStorage.getItem('usuarioNombre') || "Usuario Desconocido"; // Valor por defecto si no se encuentra

            // Verificar si el array 'data' tiene los suficientes elementos (7 días)
            if (data.data.length < 7) {
                console.error('El array de tiempo no tiene suficientes días:', data.data);
                alert('Datos incompletos para mostrar la gráfica.');
                return;
            }

            // Verificar que el canvas existe en el DOM
            const canvas = document.getElementById('weekly-chart');  // Verifica que el ID aquí sea correcto
            if (!canvas) {
                console.error('El elemento canvas no fue encontrado');
                alert('No se pudo encontrar el canvas para la gráfica.');
                return;
            }

            const ctx = canvas.getContext('2d');  // Intentamos obtener el contexto

            // Configuración para la gráfica y el total de tiempo
            const etiquetasDias = data.labels; // Etiquetas de días provenientes de la API
            const totalTiempo = data.data.reduce((total, actual) => total + actual, 0); // Calculamos el total de tiempo de la semana

            // Mostrar los datos del usuario y el total de tiempo en la interfaz
            document.getElementById('user-info').textContent = `Usuario: ${nombreUsuario}`;  // Mostrar el nombre del usuario
            document.getElementById('effective-time').textContent = totalTiempo;  // Mostrar el total de tiempo

            // Crear la gráfica
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: etiquetasDias,
                    datasets: [{
                        label: 'Tiempo Estudiado',
                        data: data.data,
                        backgroundColor: 'rgba(54, 162, 235, 0.7)',  // Color de las barras
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Tiempo Estudiado por Día',
                            font: { size: 20 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        })
        .catch(err => {
            console.error('ERROR al conectar con la API:', err);
            alert('No se pudo obtener la data. Revisa consola.');
        });
});
