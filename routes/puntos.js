import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener información del usuario y su mapa
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
    const usuario = usuarioResult.rows[0];

    const mapaResult = await pool.query('SELECT * FROM mapas WHERE id = $1', [usuario.mapa_id]);
    const mapa = mapaResult.rows[0];

    const puntosResult = await pool.query('SELECT * FROM puntos WHERE mapa_id = $1', [mapa.id]);
    const puntos = puntosResult.rows;

    res.render('map', { usuario, mapa, puntos });
  } catch (err) {
    console.error('❌ Error al cargar el mapa:', err);
    res.status(500).send('Error interno');
  }
});

// API para estados de puntos
router.get('/api/estados-puntos', auth, async (req, res) => {
  try {
    // Obtener hora local ajustada
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    const fecha = local.toISOString().split('T')[0];

    const horaLimite = new Date(local);
    horaLimite.setHours(20, 30, 0, 0); // 20:30 hora local

    const result = await pool.query(`
      SELECT 
        p.id,
        p.nombre,
        r.fecha,
        r.hora,
        u.nombre AS usuario
      FROM puntos p
      LEFT JOIN (
        SELECT DISTINCT ON (punto_id) *
        FROM revisiones
        WHERE fecha = $1
        ORDER BY punto_id, hora DESC
      ) r ON r.punto_id = p.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
    `, [fecha]);

    const datos = result.rows
      .filter(p => p && p.id) // previene errores por registros nulos
      .map(p => {
        let color = 'yellow';
        let tooltip = 'Sin revisión';

        const fechaHoraRevision = (p.fecha && p.hora && /^\d{2}:\d{2}:\d{2}$/.test(p.hora))
          ? new Date(`${p.fecha}T${p.hora}`)
          : null;

        let fechaRevisionLocal = null;
        if (fechaHoraRevision && !isNaN(fechaHoraRevision.getTime())) {
          fechaRevisionLocal = new Date(fechaHoraRevision.getTime() + 2 * 60 * 60 * 1000); // UTC+2
        }

        if (fechaRevisionLocal) {
          color = 'green';
          tooltip = `Revisado por ${p.usuario} a las ${fechaRevisionLocal.toTimeString().slice(0, 5)}`;
        } else {
          const minutosRestantes = Math.floor((horaLimite - local) / 60000);
          if (minutosRestantes <= 30 && minutosRestantes > 0) {
            color = 'red';
            tooltip = `❗ No revisado. Menos de ${minutosRestantes} min para cierre`;
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
