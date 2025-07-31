document.addEventListener('DOMContentLoaded', () => {

  // (Opcional) validar sesión
  const idUsuario = localStorage.getItem('idUsuario');
  if (!idUsuario) {
    window.location.href = './../forms/log-in/log-in.html'; // o la ruta que uses
    return;
  }
})