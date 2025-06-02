export async function registrarRevision(puntoId, usuarioId) {
  const res = await pool.query(
    'INSERT INTO revisiones (punto_id, usuario_id) VALUES ($1, $2) RETURNING *',
    [puntoId, usuarioId]
  );
  return res.rows[0];
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
