// Espera a que todo el contenido HTML esté cargado antes de ejecutar el script.
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN DE MEDALLAS ---
    // Define las URLs de las imágenes y los umbrales para cada categoría de medalla.
    // Esto centraliza la configuración y facilita futuras modificaciones.
    const MEDAL_CONFIG = {
        locked: 'https://i.ibb.co/L8yX2N3/medal-locked.png', // Imagen para medallas no obtenidas

        tiempo: { // Categoría: Tiempo Efectivo
            oro:    { threshold: 12, img: 'https://i.ibb.co/GcvJ2kJ/tiempo-oro.png' },
            plata:  { threshold: 6,  img: 'https://i.ibb.co/2Z5Yx0f/tiempo-plata.png' },
            bronce: { threshold: 2,  img: 'https://i.ibb.co/Qn3cFN3/tiempo-bronce.png' }
        },
        pmdro: { // Categoría: Pomodoros Terminados
            oro:    { threshold: 100, img: 'https://i.ibb.co/P9gNfrH/pmdro-oro.png' },
            plata:  { threshold: 50,  img: 'https://i.ibb.co/cQhB9V5/pmdro-plata.png' },
            bronce: { threshold: 10,  img: 'https://i.ibb.co/mHq3w5W/pmdro-bronce.png' }
        },
        objetivo: { // Categoría: Objetivos Alcanzados
            oro:    { threshold: 50, img: 'https://i.ibb.co/3k9Yv1Q/objetivo-oro.png' },
            plata:  { threshold: 30, img: 'https://i.ibb.co/8N1cM4Y/objetivo-plata.png' },
            bronce: { threshold: 10, img: 'https://i.ibb.co/j3B1tY0/objetivo-bronce.png' }
        },
        intento: { // Categoría: Intentos Fallidos
            oro:    { threshold: 50, img: 'https://i.ibb.co/z5pB0QJ/intento-oro.png' },
            plata:  { threshold: 30, img: 'https://i.ibb.co/tCg9Hk0/intento-plata.png' },
            bronce: { threshold: 10, img: 'https://i.ibb.co/Jqf9VZN/intento-bronce.png' }
        }
    };

    // --- SIMULACIÓN DE DATOS DEL BACKEND ---
    // En una aplicación real, obtendrías este objeto desde tu API.
    // Nota la nueva estructura del objeto "estadisticas".
    const datosUsuarioJSON = {
        "nombre": "Tony DHH",
        "estadisticas": {
            "tiempoEfectivoHoras": 7,   // Debería mostrar la medalla de plata
            "pomodorosTerminados": 101, // Debería mostrar la medalla de oro
            "objetivosAlcanzados": 12,  // Debería mostrar la medalla de bronce
            "intentosFallidos": 5       // No alcanza el bronce, mostrará la medalla bloqueada
        },
        "diasRacha": 7
    };
    
    // --- LÓGICA DE LA APLICACIÓN ---

    /**
     * Determina la URL de la imagen de la medalla a mostrar según el valor y la categoría.
     * @param {string} categoria - El nombre de la categoría (ej. 'tiempo', 'pmdro').
     * @param {number} valor - El valor numérico del usuario para esa categoría.
     * @returns {string} La URL de la imagen de la medalla correspondiente.
     */
    function obtenerMedallaSrc(categoria, valor) {
        const config = MEDAL_CONFIG[categoria];
        if (valor >= config.oro.threshold) return config.oro.img;
        if (valor >= config.plata.threshold) return config.plata.img;
        if (valor >= config.bronce.threshold) return config.bronce.img;
        return MEDAL_CONFIG.locked; // Devuelve la imagen "bloqueada" si no se alcanza ningún umbral.
    }
    
    /**
     * Carga todos los datos del perfil del usuario en los elementos HTML correspondientes.
     * @param {object} datos - El objeto con los datos del usuario.
     */
    function cargarDatosDePerfil(datos) {
        // 1. Cargar nombre de usuario y racha
        document.getElementById('userData-name').textContent = `Usuario: ${datos.nombre} | ${datos.idUsuario}`;
        document.getElementById('userData-streak').textContent = datos.diasRacha;

        // 2. Cargar las medallas correctas para cada categoría
        const stats = datos.estadisticas;
        document.getElementById('medal-img-tiempo').src = obtenerMedallaSrc('tiempo', stats.tiempoEfectivoHoras);
        document.getElementById('medal-img-pmdro').src = obtenerMedallaSrc('pmdro', stats.pomodorosTerminados);
        document.getElementById('medal-img-objetivo').src = obtenerMedallaSrc('objetivo', stats.objetivosAlcanzados);
        document.getElementById('medal-img-intento').src = obtenerMedallaSrc('intento', stats.intentosFallidos);
    }

    // 3. Llamar a la función principal con los datos simulados para poblar la página.
    cargarDatosDePerfil(datosUsuarioJSON);

});