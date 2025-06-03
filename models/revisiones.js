export async function registrarRevision(puntoId, usuarioId) {
const now = new Date();

// Añadir +2 horas manualmente para UTC+2
now.setHours(now.getHours() + 2);

// Obtener fecha y hora ajustadas
const fecha = now.toISOString().split('T')[0];
const hora = now.toTimeString().split(' ')[0].slice(0, 8); // HH:MM:SS

  await pool.query(`
    INSERT INTO revisiones (usuario_id, punto_id, fecha, hora)
    VALUES ($1, $2, $3, $4)
  `, [usuarioId, puntoId, fecha, hora]);
}


export async function obtenerUltimasPorFecha(fecha) {
  const res = await pool.query(`
    SELECT p.id, p.nombre, r.fecha_hora, u.nombre AS revisor
    FROM puntos p
    LEFT JOIN LATERAL (
      SELECT * FROM revisiones r2
      WHERE r2.punto_id = p.id AND DATE(r2.fecha_hora) = $1
      ORDER BY r2.fecha_hora DESC LIMIT 1
    ) r ON true
    LEFT JOIN usuarios u ON u.id = r.usuario_id
  `, [fecha]);
  return res.rows;
}
