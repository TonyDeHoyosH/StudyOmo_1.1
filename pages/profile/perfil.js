// Espera a que todo el contenido HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- SIMULACIÓN DE DATOS JSON ---
    // En una aplicación real, obtendrías este objeto desde tu base de datos
    // usando una llamada de red (API), por ejemplo con fetch().
    const datosUsuarioJSON = {
        "nombre": "Tony DHH",
        "idUsuario": "243776",
        "medallas": 4, // Número de medallas a mostrar
        "diasRacha": 10 // Días de racha
    };

    // Función para cargar los datos en el HTML
    function cargarDatos(datos) {
        // 1. Seleccionar los elementos del HTML por su ID
        const nombreUsuarioEl = document.getElementById('userData-name');
        const medallasContainerEl = document.getElementById('userData-medals');
        const diasRachaEl = document.getElementById('userData-streak');

        // 2. Actualizar el contenido de cada elemento con los datos del JSON
        nombreUsuarioEl.textContent = `Usuario: ${datos.nombre} | ${datos.idUsuario}`;
        diasRachaEl.textContent = datos.diasRacha;

        // Insertar las medallas dinámicamente
        medallasContainerEl.innerHTML = ''; // Limpiar cualquier contenido previo
        const medalSVG = `<img src="https://i.ibb.co/k2c505r/medal-gold.png" alt="Medalla" class="stats-card__medal-icon">`; // URL de la medalla de oro
        for (let i = 0; i < datos.medallas; i++) {
            medallasContainerEl.insertAdjacentHTML('beforeend', medalSVG);
        }
    }

    // 3. Llamar a la función con los datos simulados
    cargarDatos(datosUsuarioJSON);

});