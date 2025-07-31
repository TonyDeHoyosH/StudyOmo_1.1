document.addEventListener('DOMContentLoaded', () => {
    const idUsuario = localStorage.getItem('idUsuario');
    const nombreUsuario = localStorage.getItem('usuarioNombre') || "Usuario";

    if (!idUsuario) {
        alert('No se encontró el ID del usuario. Inicia sesión.');
        return;
    }

    fetch(`http://100.29.28.174:7000/estadisticas/${idUsuario}`)
        .then(res => res.json())
        .then(datos => {
            // Obtener elementos
            const nombreEl = document.getElementById('userData-name');
            const tiempoEl = document.getElementById('userData-time');
            const pomodorosEl = document.getElementById('userData-pomodoros');
            const objetivosEl = document.getElementById('userData-goals');
            const fallidosEl = document.getElementById('userData-fails');

            // Mostrar nombre sin el ID
            nombreEl.textContent = `Usuario: ${nombreUsuario}`;

            // Mostrar datos desde la API
            const horas = parseInt(datos.tiempoEfectivo);
            const minutos = Math.round((datos.tiempoEfectivo - horas) * 60);

            tiempoEl.textContent = `${horas}h:${String(minutos).padStart(2, '0')}m`;
            pomodorosEl.textContent = String(datos.pomodorosTerminados).padStart(2, '0');
            objetivosEl.textContent = String(datos.objetivosAlcanzados).padStart(2, '0');
            fallidosEl.textContent = String(datos.intentosFallidos).padStart(2, '0');
        })
        .catch(error => {
            console.error('Error al cargar estadísticas:', error);
            alert('No se pudieron cargar tus estadísticas.');
        });

});
