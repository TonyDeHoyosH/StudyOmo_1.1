document.addEventListener('DOMContentLoaded', () => {

    // --- 1. SIMULACIÓN DE DATOS RECIBIDOS (JSON) ---
    // Estos datos vendrían de tu base de datos.
    const datosGrafica = {
        usuario: {
            nombre: "Tony DHH",
            id: "243776"
        },
        // Datos de la semana en minutos
        tiempoSemanal: [115, 40, 75, 45, 90, 35, 70], // L, M, M, J, V, S, D
        diaSeleccionadoIndex: 4 // El 5to día (Viernes) es el seleccionado
    };

    // --- 2. PREPARAR DATOS PARA LA GRÁFICA ---

    const etiquetasDias = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; // Corresponde a la imagen
    const tiempoEfectivoTotal = datosGrafica.tiempoSemanal[datosGrafica.diaSeleccionadoIndex];
    const horas = Math.floor(tiempoEfectivoTotal / 60);
    const minutos = tiempoEfectivoTotal % 60;
    
    // Formatear el tiempo total para mostrarlo
    const tiempoFormateado = `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;

    // --- 3. ACTUALIZAR LA INFO DEL USUARIO EN EL HTML ---

    document.getElementById('user-info').textContent = `Usuario: ${datosGrafica.usuario.nombre} | ${datosGrafica.usuario.id}`;
    document.getElementById('effective-time').textContent = tiempoFormateado;

    // --- 4. CONFIGURAR Y RENDERIZAR LA GRÁFICA ---

    const ctx = document.getElementById('weekly-chart').getContext('2d');

    // Colores para las barras: uno para el día activo, otro para el resto.
    const barColors = datosGrafica.tiempoSemanal.map((_, index) => 
        index === datosGrafica.diaSeleccionadoIndex ? '#2980B9' : '#A9CCE3'
    );
     const hoverBarColors = datosGrafica.tiempoSemanal.map((_, index) => 
        index === datosGrafica.diaSeleccionadoIndex ? '#2471A3' : '#85B4D5'
    );

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: etiquetasDias,
            datasets: [{
                label: 'Tiempo de Estudio',
                data: datosGrafica.tiempoSemanal,
                backgroundColor: barColors,
                hoverBackgroundColor: hoverBarColors,
                borderRadius: 5,
                borderSkipped: false, // Para que el borde redondeado se aplique a todo
                barPercentage: 0.6, // Ancho de las barras
                categoryPercentage: 0.7 // Espacio entre grupos de barras
            }]
        },
        options: {
            maintainAspectRatio: false, // Permite que la gráfica se ajuste al contenedor
            responsive: true,
            plugins: {
                // Ocultar el título de la leyenda superior
                legend: {
                    display: false
                },
                // Personalizar el tooltip que aparece al pasar el ratón
                tooltip: {
                    enabled: true,
                    backgroundColor: '#34495E',
                    titleFont: { size: 0 }, // Ocultar título del tooltip
                    bodyFont: { size: 14, weight: 'bold', family: 'Nunito' },
                    displayColors: false, // No mostrar el cuadrito de color
                    callbacks: {
                        label: function(context) {
                            const totalMinutes = context.raw;
                            const hrs = Math.floor(totalMinutes / 60);
                            const mins = totalMinutes % 60;
                            // Devuelve solo el tiempo formateado
                            return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
                        }
                    }
                }
            },
            scales: {
                // Configuración del eje X (días de la semana)
                x: {
                    grid: {
                        display: false, // Ocultar líneas de la cuadrícula vertical
                    },
                    ticks: {
                         font: {
                            size: 14,
                            family: 'Nunito',
                            weight: 'bold'
                        },
                        color: '#566573'
                    }
                },
                // Configuración del eje Y (tiempo)
                y: {
                    beginAtZero: true,
                    max: 120, // Máximo de 2 horas (120 minutos) como en la imagen
                    grid: {
                        color: '#EAECEE', // Color de las líneas horizontales
                        drawBorder: false, // No dibujar el eje Y
                        borderDash: [5, 5], // Líneas punteadas
                    },
                    ticks: {
                        stepSize: 30, // Intervalos de 30 minutos
                        padding: 10,
                        color: '#566573',
                         font: {
                            family: 'Nunito',
                            weight: '600'
                        },
                        // Formatear las etiquetas del eje Y para que muestren "30 min", "1 hra", etc.
                        callback: function(value) {
                            if (value === 30) return '30 min';
                            if (value === 60) return '1 hra';
                            if (value === 120) return '2 hra';
                            return null; // Ocultar otros ticks como 0, 90
                        }
                    }
                }
            }
        }
    });
});