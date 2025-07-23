document.addEventListener('DOMContentLoaded', () => {

    // --- ANIMACIÓN DEL COHETE AL HACER SCROLL ---
    const rocket = document.querySelector('.rocket-icon');

    if (rocket) {
        window.addEventListener('scroll', () => {
            // Obtenemos la posición del scroll vertical
            const scrollPosition = window.scrollY;

            // Calculamos los nuevos valores de transformación.
            // Movemos el cohete hacia la derecha (X) y hacia arriba (-Y)
            // La velocidad del movimiento se reduce dividiendo la posición del scroll
            const moveX = scrollPosition * .7; // Movimiento horizontal
            const moveY = -scrollPosition * 0.7; // Movimiento vertical ascendente

            // Aplicamos la transformación al cohete
            rocket.style.transform = `translate(${moveX}px, ${moveY}px) rotate(15deg)`;
        });
    }


    // --- APARICIÓN DE ELEMENTOS CON INTERSECTION OBSERVER ---
    // Seleccionamos todos los elementos que queremos animar
    const elementsToReveal = document.querySelectorAll('.reveal-on-scroll');

    // Opciones para el Intersection Observer:
    // La animación se disparará cuando el 15% del elemento sea visible
    const observerOptions = {
        root: null, // Observa la intersección con el viewport
        threshold: 0.15,
    };

    // Creamos el observador
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            // Si el elemento está en la pantalla (intersecting)
            if (entry.isIntersecting) {
                // Le añadimos la clase que lo hace visible
                entry.target.classList.add('is-visible');
                // Dejamos de observar este elemento para no repetir la animación
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Hacemos que el observador vigile cada uno de los elementos seleccionados
    elementsToReveal.forEach(element => {
        observer.observe(element);
    });

});