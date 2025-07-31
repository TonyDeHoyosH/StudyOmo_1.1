document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://100.29.28.174:7000';
    const idUsuario = localStorage.getItem('idUsuario');
    const nombreUsuario = localStorage.getItem('usuarioNombre');

    if (!idUsuario || !nombreUsuario) {
        console.error("No se encontró el ID o nombre del usuario.");
        document.getElementById('userData-name').textContent = "Nombre no disponible";
        return;
    }

    // Obtener usuario desde API
    fetch(`${API_URL}/usuarios/${idUsuario}`)
        .then(res => res.json())
        .then(data => {
            const avatarId = data.avatar;

            // Si difiere, actualizamos en LS
            if (avatarId != avatarLS) {
                avatarImg.src = `/assets/icons/${avatarId}.png`;
                if (navbarAvatar) navbarAvatar.src = `/assets/icons/${avatarId}.png`;
                localStorage.setItem('usuarioAvatar', avatarId);
            }

            activarSelectorAvatar(avatarId);
            cargarDatosDePerfil(data);

            fetch(`${API_URL}/usuarios/${idUsuario}/racha`)
                .then(res => res.json())
                .then(racha => {
                    if (racha && racha.rachaActual != null) {
                        document.getElementById('userData-streak').textContent = racha.rachaActual;
                    } else {
                        document.getElementById('userData-streak').textContent = '0';
                    }
                })
                .catch(err => {
                    console.error("Error al obtener racha del usuario:", err);
                    document.getElementById('userData-streak').textContent = '0';
                });
        })
        .catch(err => {
            console.error("Error al cargar datos de usuario:", err);
        });

    function activarSelectorAvatar(avatarActual) {
        avatarImg.addEventListener('click', () => {
            let selector = document.querySelector('.avatar-selector');
            if (selector) {
                selector.remove();
                return;
            }

            selector = document.createElement('div');
            selector.className = 'avatar-selector';
            selector.style.cssText = `
                    position: absolute;
                    top: 30%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 15px;
                    z-index: 999;
                    box-shadow: 0 5px 25px rgba(0,0,0,0.2);
                `;

            for (let i = 1; i <= 9; i++) {
                const img = document.createElement('img');
                img.src = `/assets/icons/${i}.png`;
                img.style.width = '80px';
                img.style.cursor = 'pointer';
                img.style.border = i === avatarActual ? '3px solid #2980B9' : '2px solid transparent';
                img.style.borderRadius = '10px';

                img.addEventListener('click', () => {
                    fetch(`${API_URL}/usuarios/${idUsuario}/avatar`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ avatar: i })
                    })
                        .then(res => {
                            if (!res.ok) throw new Error("No se pudo actualizar el avatar");

                            avatarImg.src = `/assets/icons/${i}.png`;
                            if (navbarAvatar) navbarAvatar.src = `/assets/icons/${i}.png`;

                            localStorage.setItem('usuarioAvatar', i);
                            selector.remove();
                        })
                        .catch(err => {
                            console.error("❌ Error al actualizar avatar:", err);
                            alert("No se pudo actualizar el avatar.");
                        });
                });

                selector.appendChild(img);
            }

            document.body.appendChild(selector);
        });
    }

    function cargarDatosDePerfil(usuario) {
        document.getElementById('userData-name').textContent = usuario.nombre;
        document.getElementById('userData-streak').textContent = usuario.diasRacha || '0';

        const stats = usuario.estadisticas || {
            tiempoEfectivoHoras: 0,
            pomodorosTerminados: 0,
            objetivosAlcanzados: 0,
            intentosFallidos: 0
        };

        const medallas = [
            { id: 'medal-img-tiempo', categoria: 't', valor: stats.tiempoEfectivoHoras },
            { id: 'medal-img-pmdro', categoria: 'p', valor: stats.pomodorosTerminados },
            { id: 'medal-img-objetivo', categoria: 'c', valor: stats.objetivosAlcanzados },
            { id: 'medal-img-intento', categoria: 'm', valor: stats.intentosFallidos }
        ];

        medallas.forEach(({ id, categoria, valor }) => {
            const imgElement = document.getElementById(id);
            const srcId = obtenerMedallaReal(categoria, valor);

            if (srcId) {
                imgElement.src = `/assets/icons/${srcId}.jpg`;
                imgElement.style.display = 'block';
            } else {
                imgElement.style.display = 'none';
            }
        });
    }

    function obtenerMedallaReal(categoria, valor) {
        if (valor == null || valor === 0) return null;

        const niveles = {
            t: { oro: 12, plata: 6, bronce: 2 },
            p: { oro: 100, plata: 50, bronce: 10 },
            c: { oro: 50, plata: 30, bronce: 10 },
            m: { oro: 50, plata: 30, bronce: 10 }
        };

        const conf = niveles[categoria];
        if (!conf) return null;

        if (valor >= conf.oro) return `1${categoria}`;
        if (valor >= conf.plata) return `2${categoria}`;
        if (valor >= conf.bronce) return `3${categoria}`;
        return null;
    }
});