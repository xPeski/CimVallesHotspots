// routes/revisar.js
import express from 'express';
import pool from '../db/db.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// GET /revisar/:id - mostrar la página del punto
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

// POST /api/revisar/:id - registrar revisión
router.post('/api/revisar/:id', auth, async (req, res) => {
  const puntoId = req.params.id;
  const userId = req.user.id;

  try {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0]; // HH:MM:SS

    await pool.query(`
      INSERT INTO revisiones (usuario_id, punto_id, fecha, hora)
      VALUES ($1, $2, $3, $4)
    `, [userId, puntoId, fecha, hora]);

    const puntoResult = await pool.query('SELECT * FROM puntos WHERE id = $1', [puntoId]);
    const punto = puntoResult.rows[0];

    res.render('revisar', { punto, revisado: true });
  } catch (err) {
    console.error('❌ Error al registrar revisión:', err);
    res.status(500).send('Error al guardar la revisión');
  }
});


export default router;
