import pool from '../db/db.js';
import { obtenerFechaHoraLocal } from '../utils/fecha.js';

export async function registrarRevision(puntoId, usuarioId) {
  const { fecha, hora } = obtenerFechaHoraLocal();

  const insert = await pool.query(`
    INSERT INTO revisiones (usuario_id, punto_id, fecha, hora)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `, [usuarioId, puntoId, fecha, hora]);

  const revisionId = insert.rows[0].id;

  await pool.query(`
    UPDATE revisiones
    SET fecha_hora = fecha + hora::time
    WHERE id = $1
  `, [revisionId]);
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