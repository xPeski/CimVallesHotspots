import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    // 1. Cargar datos del usuario ya autenticado
    const usuario = req.user;

    // 2. Obtener el mapa asociado al usuario
    const mapaResult = await pool.query('SELECT * FROM mapas WHERE id = $1', [usuario.mapa_id]);
    const mapa = mapaResult.rows[0];

    // 3. Obtener los puntos del mapa correspondiente
    const puntosResult = await pool.query('SELECT * FROM puntos WHERE mapa_id = $1', [usuario.mapa_id]);
    const puntos = puntosResult.rows;

    // 4. Renderizar vista con datos
    res.render('map', {
      usuario,
      mapa,
      puntos
    });
  } catch (err) {
    console.error('❌ Error cargando el mapa:', err);
    res.status(500).send('Error al cargar el mapa');
  }
});

// API para estados de puntos
router.get('/api/estados-puntos', auth, async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const result = await pool.query(`
      SELECT 
        puntos.id,
        puntos.nombre,
        r.fecha,
        r.hora,
        u.nombre AS usuario
      FROM puntos
      LEFT JOIN revisiones r ON puntos.id = r.punto_id AND r.fecha = $1
      LEFT JOIN usuarios u ON r.usuario_id = u.id
    `, [hoy]);

    const ahora = new Date();
    const umbral = new Date();
    umbral.setHours(20, 0, 0); // 20:00

    const datos = result.rows.map(p => {
      let color = 'yellow';
      let tooltip = 'Sin revisión';

      if (p.fecha) {
        const fechaHora = new Date(`${p.fecha}T${p.hora}`);
        tooltip = `Revisado por ${p.usuario} a las ${p.hora}`;

        if (ahora > umbral) {
          color = 'green'; // revisado
        } else {
          color = 'green'; // aún antes del límite, pero revisado
        }
      } else {
        if ((umbral - ahora) < 30 * 60 * 1000) {
          color = 'red';
          tooltip = '❗ No revisado. Menos de 30 min para cierre';
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
