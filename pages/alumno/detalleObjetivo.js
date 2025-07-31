// --- FUNCIÓN AUXILIAR PARA FORMATEAR FECHA Y HORA (SIN CAMBIOS) ---
function formatLocalDateTime(dateArray) {
  if (!Array.isArray(dateArray) || dateArray.length < 5) {
    return "Fecha no disponible";
  }
  const date = new Date(
    dateArray[0], dateArray[1] - 1, dateArray[2],
    dateArray[3], dateArray[4]
  );
  if (isNaN(date.getTime())) {
    return "Fecha inválida";
  }
  return date.toLocaleString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}


document.addEventListener('DOMContentLoaded', async () => {

    // 1. Leemos los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idObjetivo = urlParams.get('idObjetivo');
    const idSesion = urlParams.get('idSesion');

    // Verificamos que existan los datos necesarios
    if (!idObjetivo || !idSesion) {
        alert('Error: Faltan el ID del objetivo o de la sesión en la URL.');
        return;
    }

    // 2. Referencias a los elementos del DOM que vamos a rellenar
    const objetivoNombre = document.getElementById('objetivo-nombre');
    const objetivoDescripcion = document.getElementById('objetivo-descripcion');
    const fechaCreacion = document.getElementById('fecha-creacion');
    const tiempoPomodoro = document.getElementById('tiempo-pomodoro');
    const tiempoDescanso = document.getElementById('tiempo-descanso');
    const totalPomodoros = document.getElementById('total-pomodoros');
    const startBtn = document.getElementById('start-objective-btn');

    try {
        // 3. Hacemos fetch para obtener la información del objetivo
        // SUPOSICIÓN: El endpoint para un objetivo es /objetivos/{id}
        const response = await fetch(`http://100.29.28.174:7000/objetivos/${idObjetivo}`);
        
        if (!response.ok) {
            throw new Error(`Error ${response.status} al obtener los datos del objetivo.`);
        }

        const objetivoData = await response.json();

        // 4. Rellenamos la tarjeta con los datos obtenidos
        objetivoNombre.textContent = objetivoData.nombre;
        objetivoDescripcion.textContent = objetivoData.descripcion;
        fechaCreacion.textContent = formatLocalDateTime(objetivoData.fechaCreacion);
        tiempoPomodoro.textContent = `${objetivoData.duracionPomodoro} minutos`;
        tiempoDescanso.textContent = `${objetivoData.duracionDescanso} minutos`;
        totalPomodoros.textContent = `${objetivoData.totalPomodoros} pomodoros`;
        
        // 5. Configuramos el botón de "Iniciar Objetivo"
        startBtn.addEventListener('click', () => {
            // Redirigimos a la siguiente página (el cronómetro) pasando ambos IDs
            // Ajusta la ruta a tu página de cronómetro si es diferente
            window.location.href = `./../objective/objective.html?idObjetivo=${idObjetivo}&idSesion=${idSesion}`;
        });

    } catch (error) {
        console.error('Error al cargar la información del objetivo:', error);
        alert('Error al cargar la información del objetivo. Por favor, intente de nuevo.');
        // Mostramos un mensaje de error en la interfaz
        objetivoNombre.textContent = 'Error al cargar';
        objetivoDescripcion.textContent = 'No se pudo obtener la información del objetivo.';
    }
});