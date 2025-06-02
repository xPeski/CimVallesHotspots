// routes/puntos.js
import express from 'express';
import { auth } from './auth.js';
import { obtenerUltimasPorFecha, registrarRevision } from '../models/revisiones.js';
import { obtenerPorId } from '../models/puntos.js';

const router = express.Router();

// GET /api/estados-puntos - devuelve estado por fecha (hoy)
router.get('/api/estados-puntos', auth, async (req, res) => {
  const hoy = new Date().toISOString().split('T')[0];
  try {
    const puntos = await obtenerUltimasPorFecha(hoy);
    const ahora = new Date();
    const umbral = new Date();
    umbral.setHours(20, 30, 0);
    const mediaHoraAntes = new Date(umbral.getTime() - 30 * 60000);

    const resultado = puntos.map(p => {
      let color = 'yellow';
      let tooltip = 'Sin revisión';

      if (p.fecha_hora) {
        const fechaRev = new Date(p.fecha_hora);
        if (fechaRev.toDateString() === ahora.toDateString()) {
          color = 'green';
          tooltip = `Revisado por ${p.revisor} a las ${fechaRev.toLocaleTimeString()}`;
        } else if (ahora > mediaHoraAntes) {
          color = 'red';
          tooltip = `No revisado hoy (última: ${fechaRev.toLocaleString()})`;
        }
      } else if (ahora > mediaHoraAntes) {
        color = 'red';
        tooltip = 'Nunca revisado y fuera de hora';
      }

      return { id: p.id, color, tooltip };
    });

    res.json(resultado);
  } catch (err) {
    console.error('Error obteniendo estados de puntos:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// GET /revisar/:id - vista con botón para revisar
router.get('/revisar/:id', auth, async (req, res) => {
  const puntoId = parseInt(req.params.id);
  try {
    const punto = await obtenerPorId(puntoId);
    if (!punto) return res.status(404).send('Punto no encontrado');

    const revisado = req.session.revisado;
    req.session.revisado = null; // Limpiar el estado después de mostrarlo

    res.render('revisar', { punto, revisado });
  } catch (err) {
    console.error('Error mostrando punto:', err);
    res.status(500).send('Error interno');
  }
});

// POST /api/revisar/:id - registrar revisión de un punto
router.post('/api/revisar/:id', auth, async (req, res) => {
  const puntoId = parseInt(req.params.id);
  const usuarioId = req.user.id;

  try {
    await registrarRevision(puntoId, usuarioId);
    req.session.revisado = true;
    res.redirect(`/revisar/${puntoId}`);
  } catch (err) {
    console.error('Error registrando revisión:', err);
    res.status(500).send('No se pudo registrar la revisión');
  }
});

export default router;
