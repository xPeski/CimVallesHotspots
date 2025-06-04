async function actualizarEstados() {
  try {
    const respuesta = await fetch('/map/api/estados-puntos?ts=' + Date.now());

    if (!respuesta.ok) {
      if (respuesta.status === 401) {
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(location.pathname);
        return;
      } else {
        throw new Error('Error del servidor');
      }
    }

    const datos = await respuesta.json();
    datos.forEach(p => {
      const grupo = document.getElementById(`punto-${p.id}`);
      if (grupo) {
        const rect = grupo.querySelector('rect');
        const title = grupo.querySelector('title');
        rect.setAttribute('fill', p.color);
        title.textContent = p.tooltip;
      }
    });
  } catch (err) {
    console.error('Error al actualizar puntos:', err);
  }
}

setInterval(actualizarEstados, 10000);
actualizarEstados();
