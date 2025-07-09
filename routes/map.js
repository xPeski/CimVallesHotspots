// ✅ Archivo: routes/map.js
import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';
import { obtenerFechaHoraLocal } from '../utils/fecha.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { fecha, hora } = obtenerFechaHoraLocal();
    const desde = req.query.desde && req.query.desde.trim() !== '' ? req.query.desde : fecha;
    const hasta = req.query.hasta && req.query.hasta.trim() !== '' ? req.query.hasta : fecha;



    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
    const usuario = usuarioResult.rows[0];

    const mapaResult = await pool.query('SELECT * FROM mapas WHERE id = $1', [usuario.mapa_id]);
    const mapa = mapaResult.rows[0];

    const puntosResult = await pool.query('SELECT * FROM puntos WHERE mapa_id = $1', [mapa.id]);
    const puntos = puntosResult.rows;

   const revisionesResult = await pool.query(`
  SELECT
    p.nombre AS punto,
    r1.usuario_id AS usuario1_id,
    u1.nombre AS usuario1,
    r1.fecha_hora AS hora1,
    r2.usuario_id AS usuario2_id,
    u2.nombre AS usuario2,
    r2.fecha_hora AS hora2
  FROM puntos p
  LEFT JOIN LATERAL (
    SELECT * FROM revisiones r
    WHERE r.punto_id = p.id AND r.fecha_hora BETWEEN $1 AND $2 AND r.hora <= '20:30:00'
    ORDER BY r.fecha_hora DESC LIMIT 1
  ) r1 ON true
  LEFT JOIN usuarios u1 ON r1.usuario_id = u1.id
  LEFT JOIN LATERAL (
    SELECT * FROM revisiones r
    WHERE r.punto_id = p.id AND r.fecha_hora BETWEEN $1 AND $2 AND r.hora > '20:30:00'
    ORDER BY r.fecha_hora DESC LIMIT 1
  ) r2 ON true
  LEFT JOIN usuarios u2 ON r2.usuario_id = u2.id
  WHERE p.mapa_id = $3
`, [`${desde} 00:00:00`, `${hasta} 23:59:59`, mapa.id]);


    const revisiones = revisionesResult.rows;
    console.log('✅ Filtrando desde:', desde, 'hasta:', hasta);
    res.render('map', { usuario, mapa, puntos, revisiones, desde, hasta });
  } catch (err) {
    console.error('❌ Error al cargar el mapa:', err);
    res.status(500).send('Error interno');
  }
});

router.get('/api/estados-puntos', auth, async (req, res) => {
  try {
    const { fecha, fechaHora: ahora } = obtenerFechaHoraLocal();

    const corte1 = new Date(ahora);
    corte1.setHours(20, 35, 0, 0);

    const aviso2Inicio = new Date(ahora);
    aviso2Inicio.setHours(22, 5, 0, 0); // 30 min antes de corte2

    const corte2 = new Date(ahora);
    corte2.setHours(22, 35, 0, 0);

    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        r.fecha_hora,
        r.usuario_id,
        u.nombre AS usuario
      FROM puntos p
      LEFT JOIN (
          SELECT DISTINCT ON (punto_id) punto_id, fecha_hora, usuario_id
          FROM revisiones
          WHERE DATE(fecha_hora) = $1
            AND (
              ($2::time <= '20:35:00' AND fecha_hora::time <= '20:35:00') OR
              ($2::time >  '20:35:00' AND fecha_hora::time >  '20:35:00')
            )
          ORDER BY punto_id, fecha_hora DESC
      ) r ON r.punto_id = p.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
    `, [fecha, ahora.toTimeString().slice(0, 5)]);

    const datos = result.rows
      .filter(p => p && p.id)
      .map(p => {
        let color = 'yellow';
        let tooltip = 'Sin revisión';

        if (p.fecha_hora) {
          const fechaRevision = new Date(p.fecha_hora);
          const horaTexto = fechaRevision.toTimeString().slice(0, 5);

          color = 'green';
          tooltip = `Revisado por ${p.usuario} a las ${horaTexto}`;
        } else {
          if (ahora < corte1) {
            const minutosRestantes = Math.floor((corte1 - ahora) / 60000);
            if (minutosRestantes <= 30) {
              color = 'red';
              tooltip = `❗ No revisado. Menos de ${minutosRestantes} min para cierre (20:35)`;
            }
          } else if (ahora >= aviso2Inicio && ahora <= corte2) {
            const minutosRestantes = Math.floor((corte2 - ahora) / 60000);
            color = 'red';
            tooltip = `❗ No revisado. Menos de ${minutosRestantes} min para cierre (22:35)`;
          } else {
            tooltip = '⚠️ No revisado';
          }
        }

        return { id: p.id, color, tooltip };
      });

    res.json(datos);
  } catch (err) {
    console.error('Error obteniendo estados:', err);
    res.status(500).json({ error: 'Error al obtener estados' });
  }
});

export default router;
