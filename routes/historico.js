// routes/historico.js
import express from 'express';
import { auth } from '../middleware/auth.js';
import { obtenerRevisionesEntreFechas } from '../models/revisiones.js';
import { parse } from 'json2csv'; // Para exportar CSV

const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { desde, hasta } = req.query;

  if (!desde || !hasta) {
    return res.status(400).send('Debes proporcionar fechas "desde" y "hasta".');
  }

  try {
    const revisiones = await obtenerRevisionesEntreFechas(`${desde} 00:00:00`, `${hasta} 23:59:59`);
    res.render('historico', { revisiones, desde, hasta, error: null});
  } catch (err) {
    console.error('❌ Error en /historico:', err);
    res.status(500).send('Error interno');
  }
});

router.get('/descargar', auth, async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const revisiones = await obtenerRevisionesEntreFechas(`${desde} 00:00:00`, `${hasta} 23:59:59`);

    const csv = parse(revisiones, {
      fields: ['fecha_hora', 'usuario', 'punto']
    });

    res.header('Content-Type', 'text/csv');
    res.attachment(`historico_${desde}_a_${hasta}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('❌ Error al generar CSV:', err);
    res.status(500).send('Error exportando CSV');
  }
});

export default router;
