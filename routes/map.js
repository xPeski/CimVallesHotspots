// routes/map.js
import express from 'express';
import { auth } from './auth.js';

const router = express.Router();

// Mapa interactivo protegido por login
router.get('/', auth, (req, res) => {
  res.render('map', { usuario: req.user });
});

export default router;
