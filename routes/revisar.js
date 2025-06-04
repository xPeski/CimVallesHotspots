import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';
import { obtenerFechaHoraLocal } from '../utils/fecha.js';

const router = express.Router();

router.get('/:id', auth, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM puntos WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).send('Punto no encontrado');
    }

    const punto = result.rows[0];
    res.render('revisar', { punto, revisado: false });
  } catch (err) {
    console.error('❌ Error al cargar punto:', err);
    res.status(500).send('Error interno');
  }
});

router.post('/:id', auth, async (req, res) => {
  const puntoId = req.params.id;
  const userId = req.user.id;

  try {
    const { fecha, hora } = obtenerFechaHoraLocal();

    await pool.query(`
    INSERT INTO revisiones (usuario_id, punto_id, fecha, hora, fecha_hora)
    VALUES ($1, $2, $3, $4, $3::date + $4::time)
  `, [usuarioId, puntoId, fecha, hora]);

    console.log('✅ Revisión insertada:', insert.rows[0]);

    const puntoResult = await pool.query('SELECT * FROM puntos WHERE id = $1', [puntoId]);
    const punto = puntoResult.rows[0];

    res.render('revisar', { punto, revisado: true });

  } catch (err) {
    console.error('❌ Error al registrar revisión:', err.message);
    res.status(500).send('Error al guardar la revisión');
  }
});

export default router;