document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SIMULACIÓN DE DATOS RECIBIDOS (JSON) ---
    const datosIntentos = {
        usuario: {
            nombre: "Tony DHH",
            id: "243776"
        },
        // Conteo de intentos fallidos por día
        intentosSemanales: [1, 2, 0, 1, 0, 0, 2], // L, M, M, J, V, S, D
    };

    // --- 2. PREPARAR DATOS Y ACTUALIZAR HTML ---
    
    const etiquetasDias = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    // Calculamos el total de intentos de la semana
    const totalIntentos = datosIntentos.intentosSemanales.reduce((total, actual) => total + actual, 0);

    // Actualizar el nombre de usuario y el CONTEO TOTAL de intentos
    document.getElementById('user-info').textContent = `Usuario: ${datosIntentos.usuario.nombre} | ${datosIntentos.usuario.id}`;
    document.getElementById('intentos-total').textContent = String(totalIntentos); // No se necesita padStart para números bajos

    // --- 3. CONFIGURAR Y RENDERIZAR LA GRÁFICA ---

    const ctx = document.getElementById('intentos-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetasDias,
            datasets: [{
                label: 'Intentos',
                data: datosIntentos.intentosSemanales,
                backgroundColor: '#A9CCE3', 
                hoverBackgroundColor: '#2980B9', 
                borderRadius: 5,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#34495E',
                    titleFont: { size: 0 },
                    bodyFont: { size: 14, weight: 'bold', family: 'Nunito' },
                    displayColors: false,
                    // El tooltip ahora muestra "intento(s)"
                    callbacks: {
                        label: function(context) {
                            const count = context.raw;
                            return `${count} ${count === 1 ? 'intento fallido' : 'intentos fallidos'}`;
                        }
                    }
                }
            },
            scales: {
                x: { // Eje X (días)
                    grid: { display: false },
                    ticks: {
                        font: { size: 14, family: 'Nunito', weight: 'bold' },
                        color: '#566573'
                    }
                },
                y: { // Eje Y (conteo de intentos)
                    beginAtZero: true,
                    max: 5, // Un máximo de 5 es razonable para fallos
                    grid: {
                        color: '#EAECEE',
                        drawBorder: false,
                        borderDash: [5, 5],
                    },
                    ticks: {
                        stepSize: 1, // Marcas de 1 en 1
                        padding: 10,
                        color: '#566573',
                        font: { family: 'Nunito', weight: '600' },
                        callback: function(value) {
                            if (Number.isInteger(value)) {
                                return value;
                            }
                        }
                    }
                }
            }
        }
    });
});