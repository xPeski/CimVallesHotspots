// routes/api.js
import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/estados-puntos
router.get('/estados-puntos', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        CASE 
          WHEN r.id IS NOT NULL THEN 'green'
          ELSE 'yellow'
        END AS color,
        CASE 
          WHEN r.id IS NOT NULL THEN 'Revisado por ' || u.nombre
          ELSE 'Sin revisión'
        END AS tooltip
      FROM puntos p
      LEFT JOIN (
        SELECT DISTINCT ON (punto_id) *
        FROM revisiones
        ORDER BY punto_id, fecha DESC, hora DESC
      ) r ON p.id = r.punto_id
      LEFT JOIN usuarios u ON u.id = r.usuario_id
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('❌ Error al obtener estados de los puntos:', err);
    res.status(500).json({ error: 'Error al obtener estados' });
  }
});

export default router;
