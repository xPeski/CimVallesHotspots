import pool from '../db/db.js';
import { obtenerFechaHoraLocal } from '../utils/fecha.js';

export async function registrarRevision(puntoId, usuarioId) {
  const { fecha, hora } = obtenerFechaHoraLocal();

  await pool.query(`
    INSERT INTO revisiones (usuario_id, punto_id, fecha, hora, fecha_hora)
    VALUES ($1, $2, $3, $4, $3::date + $4::time)
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