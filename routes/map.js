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

    res.render('map', { usuario, mapa, puntos }); // <- importante incluir `mapa`
  } catch (err) {
    console.error('❌ Error al cargar el mapa:', err);
    res.status(500).send('Error interno');
  }
});


// API para estados de puntos
router.get('/api/estados-puntos', auth, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

const datos = result.rows.map(p => {
  let color = 'yellow';
  let tooltip = 'Sin revisión';

  const ahora = new Date();
  const horaLimite = new Date();       // 20:30 de hoy
  horaLimite.setHours(20, 30, 0, 0);

  const fechaHoraRevision = p.fecha && p.hora ? new Date(`${p.fecha}T${p.hora}`) : null;

  if (fechaHoraRevision && p.fecha === hoy) {
    if (ahora <= horaLimite) {
      color = 'green';
      tooltip = `Revisado por ${p.usuario} a las ${p.hora}`;
    } else {
      // Revisado hoy, pero ya pasó la hora de corte => resetear
      color = 'yellow';
      tooltip = 'Sin revisión';
    }
  } else {
    // No revisado hoy
    if (ahora <= horaLimite) {
      const minutosRestantes = Math.floor((horaLimite - ahora) / 60000);
      if (minutosRestantes <= 30) {
        color = 'red';
        tooltip = `❗ No revisado. Menos de ${minutosRestantes} min para cierre`;
      }
    } else {
      // Ya pasó el día y no hay revisión hoy => se mantiene como sin revisar (amarillo)
      color = 'yellow';
      tooltip = 'Sin revisión';
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
