export async function obtenerTodosConUltimaRevision() {
  const res = await pool.query(`
    SELECT p.id, p.nombre, r.fecha_hora, u.nombre AS revisor
    FROM puntos p
    LEFT JOIN LATERAL (
      SELECT * FROM revisiones r2
      WHERE r2.punto_id = p.id
      ORDER BY r2.fecha_hora DESC LIMIT 1
    ) r ON true
    LEFT JOIN usuarios u ON u.id = r.usuario_id
  `);
  return res.rows;
}

export async function obtenerPorId(id) {
  const res = await pool.query('SELECT * FROM puntos WHERE id = $1', [id]);
  return res.rows[0] || null;
}
