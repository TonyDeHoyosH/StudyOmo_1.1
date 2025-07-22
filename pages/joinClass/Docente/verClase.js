document.addEventListener('DOMContentLoaded', () => {
    // Selecciona todos los contenedores de clase
    const classItems = document.querySelectorAll('.class-item');

    classItems.forEach(item => {
        item.addEventListener('click', (event) => {
            // Evita que el clic en los botones internos propague el evento al contenedor
            if (event.target.closest('.class-item__button')) {
                return;
            }

            // Obtiene la URL del atributo data-url
            const url = item.getAttribute('data-url');

            // Redirige a la página especificada si la URL existe
            if (url) {
                window.location.href = url;
            }
        });
    });
});