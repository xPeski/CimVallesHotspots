export function obtenerFechaHoraLocal(offset = 2) {
  const local = new Date(Date.now() + offset * 3600000);
  return {
    fecha: local.toISOString().split('T')[0],
    hora: local.toTimeString().split(' ')[0].slice(0, 8),
    fechaHora: local
  };
}