document.addEventListener('DOMContentLoaded', () => {
    
  const joinButton = document.getElementById('join-class-button');
  const codeInput = document.getElementById('class-code-input');

  if (!joinButton || !codeInput) return;

  joinButton.addEventListener('click', async () => {
    const enteredCode = codeInput.value.trim().toUpperCase();
    const idUsuario = localStorage.getItem("idUsuario");

    if (!enteredCode) {
      alert('Por favor, ingresa un código de clase.');
      return;
    }

    if (!idUsuario) {
      alert('No se ha encontrado el usuario. Asegúrate de haber iniciado sesión.');
      return;
    }

    try {
      const response = await fetch('http://100.29.28.174:7000/grupos/unirse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          codigoUnico: enteredCode,
          idUsuario: parseInt(idUsuario)
        })
      });

      if (response.ok) {
        alert('¡Te has unido exitosamente a la clase!');
        window.location.href = '/pages/docente/verClase.html'; // redirige a tu vista de grupos
      } else {
        const errorMsg = await response.text();
        alert(`Error: ${errorMsg}`);
      }

    } catch (error) {
      console.error('Error al intentar unirse al grupo:', error);
      alert('Hubo un problema al conectar con el servidor.');
    }
  });
});
