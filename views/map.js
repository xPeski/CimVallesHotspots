<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Mapa interactivo</title>
  <style>
    .tooltip-text {
      visibility: hidden;
      font-size: 14px;
      fill: black;
      pointer-events: none;
    }
    .tooltip-box:hover .tooltip-text {
      visibility: visible;
    }
  </style>
</head>
<body>
  <h1>Mapa de la nave</h1>
  <p>Bienvenido, <%= usuario.nombre %></p>

  <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
    <g id="puntos">
      <g id="punto-1" class="tooltip-box">
        <rect x="100" y="100" width="40" height="40" fill="yellow" />
        <title>Sin revisión</title>
        <text x="105" y="95" class="tooltip-text">Sin revisión</text>
      </g>
      <g id="punto-2" class="tooltip-box">
        <rect x="200" y="100" width="40" height="40" fill="yellow" />
        <title>Sin revisión</title>
        <text x="205" y="95" class="tooltip-text">Sin revisión</text>
      </g>
    </g>
  </svg>

  <script>
    async function actualizarEstados() {
      try {
        const respuesta = await fetch('/api/estados-puntos');
        const datos = await respuesta.json();

        datos.forEach(p => {
          const grupo = document.getElementById(`punto-${p.id}`);
          if (grupo) {
            const rect = grupo.querySelector('rect');
            const title = grupo.querySelector('title');
            const text = grupo.querySelector('text');

            rect.setAttribute('fill', p.color);
            title.textContent = p.tooltip;
            text.textContent = p.tooltip;
          }
        });
      } catch (err) {
        console.error('Error al actualizar puntos:', err);
      }
    }

    setInterval(actualizarEstados, 10000);
    actualizarEstados(); // primera llamada
  </script>
</body>
</html>
