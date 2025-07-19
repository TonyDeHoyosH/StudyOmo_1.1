document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SIMULACIÓN DE DATOS RECIBIDOS (JSON) ---
    const datosPomodoros = {
        usuario: {
            nombre: "Tony DHH",
            id: "243776"
        },
        // Conteo de pomodoros terminados por día
        pomodorosSemanales: [8, 3, 5, 4, 7, 2, 6], // L, M, M, J, V, S, D
    };

    // --- 2. PREPARAR DATOS Y ACTUALIZAR HTML ---
    
    const etiquetasDias = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    // Calculamos el total de pomodoros de la semana
    const totalPomodoros = datosPomodoros.pomodorosSemanales.reduce((total, actual) => total + actual, 0);

    // Actualizar el nombre de usuario y el CONTEO TOTAL de pomodoros
    document.getElementById('user-info').textContent = `Usuario: ${datosPomodoros.usuario.nombre} | ${datosPomodoros.usuario.id}`;
    document.getElementById('pomodoros-total').textContent = String(totalPomodoros).padStart(2, '0');

    // --- 3. CONFIGURAR Y RENDERIZAR LA GRÁFICA ---

    const ctx = document.getElementById('pomodoros-chart').getContext('2d');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetasDias,
            datasets: [{
                label: 'Pomodoros',
                data: datosPomodoros.pomodorosSemanales,
                // **CORRECCIÓN PRINCIPAL AQUÍ**
                // Un solo color de fondo para todas las barras.
                backgroundColor: '#A9CCE3', 
                // Un solo color de hover, se aplicará a la barra que tenga el cursor encima.
                hoverBackgroundColor: '#2980B9', 
                borderRadius: 5,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.7
            }]
        },
        options: {
            // Las opciones de la gráfica (escalas, tooltips, etc.) se mantienen igual.
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
                    callbacks: {
                        label: function(context) {
                            return `${context.raw} pomodoros`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { size: 14, family: 'Nunito', weight: 'bold' },
                        color: '#566573'
                    }
                },
                y: {
                    beginAtZero: true,
                    max: 10,
                    grid: {
                        color: '#EAECEE',
                        drawBorder: false,
                        borderDash: [5, 5],
                    },
                    ticks: {
                        stepSize: 2,
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