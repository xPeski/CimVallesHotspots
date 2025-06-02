// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

const router = express.Router();

// GET /login - muestra el formulario de login
router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

// POST /login - procesa el login
router.post('/login', async (req, res) => {
  const { nombre, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE nombre = $1', [nombre]);
console.log(result.rows[0]);
    if (result.rowCount === 0) {
      return res.render('login', { error: 'Usuario no encontrado' });
    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(password, usuario.password_hash);

    if (!match) {
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    req.session.token = token;
    const redirectTo = req.query.redirect || '/';
    res.redirect(redirectTo);
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).send('Error interno');
  }
});

// GET /logout - cierra sesión
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

export default router;