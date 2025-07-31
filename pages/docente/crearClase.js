/* crearClase.js - versión corregida con payload válido */
document.addEventListener('DOMContentLoaded', () => {

  const inputNombre   = document.getElementById('class-name');
  const spanCodigo    = document.querySelector('.code-number');
  const btnCrearClase = document.getElementById('crearClaseBtn');


  function generarCodigo () {
    const L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const N = '0123456789';
    const arr = [];
    for (let i = 0; i < 3; i++) arr.push(N[Math.random() * 10  | 0]);
    for (let i = 0; i < 3; i++) arr.push(L[Math.random() * 26 | 0]);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.random() * (i + 1) | 0;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
  }

  let codigoActual = generarCodigo();
  spanCodigo.textContent = codigoActual;

  btnCrearClase.addEventListener('click', () => crearClaseConRetry(5));

  async function crearClaseConRetry(maxIntentos) {
    const nombre = inputNombre.value.trim();
    if (!nombre) {
      alert('Ingresa un nombre para la clase');
      return;
    }

    let intentos = 0;
    while (intentos < maxIntentos) {
      try {
        const payload = {
          nombre,
          codigoUnico: codigoActual,
          idUsuario: idUsuario  // ✅ ¡aquí está el fix!
        };

        const res = await fetch('http://100.29.28.174:7000/grupos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const { idGrupo } = await res.json();
          localStorage.setItem('idGrupo', idGrupo);
          window.location.href = `/pages/docente/verClase.html?grupo=${idGrupo}`;
          return;
        }

        const data = await res.json().catch(() => ({}));
        const esDuplicado = res.status === 409 ||
                            /c[oó]digo.*exist/i.test(data.message || '');

        if (!esDuplicado) {
          console.log('Error al crear la clase:', data.message || res.status);
          alert(data.message || 'Error al crear la clase.');
          return;
        }

        // reintento por código duplicado
        intentos++;
        codigoActual = generarCodigo();
        spanCodigo.textContent = codigoActual;

      } catch (err) {
        console.error(`Intento ${intentos + 1}:`, err.message);
        alert('No se pudo crear la clase. Intenta más tarde.');
        return;
      }
    }
  }
});
