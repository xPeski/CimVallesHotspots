// public/js/app.js
window.addEventListener('DOMContentLoaded', () => {
  const tooltip = document.getElementById('tooltip');
  const hotspots = document.querySelectorAll('.hotspot');

  hotspots.forEach(hs => {
    // ejemplo de hover: muestra “Sin datos” y posición
    hs.addEventListener('mouseenter', e => {
      const id = hs.dataset.pointId;
      tooltip.textContent = `Punto ${id}\nSin revisar`; 
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top  = e.pageY + 10 + 'px';
      tooltip.style.display = 'block';
    });
    hs.addEventListener('mousemove', e => {
      tooltip.style.left = e.pageX + 10 + 'px';
      tooltip.style.top  = e.pageY + 10 + 'px';
    });
    hs.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });

  console.log('Mapa y hotspots cargados:', hotspots.length);
});
