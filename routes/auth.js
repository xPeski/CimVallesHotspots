// routes/auth.js
import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db/db.js';

const router = express.Router();

// GET /login - muestra el formulario de login
// GET /login - muestra el formulario de login
router.get('/login', (req, res) => {
  const redirect = req.query.redirect || '/map';
  res.render('login', { error: null, redirect });
});


// POST /login - procesa el login
router.post('/login', async (req, res) => {
  const { nombre, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE nombre = $1', [nombre]);

    if (result.rowCount === 0) {
     return res.render('login', { error: 'Usuario no encontrado', redirect: req.body.redirect || '/map' });

    }

    const usuario = result.rows[0];
    const match = await bcrypt.compare(password, usuario.password_hash);

    if (!match) {
     return res.render('login', { error: 'Contraseña incorrecta', redirect: req.body.redirect || '/map' });

    }

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    req.session.token = token;

    req.session.save(err => {
  if (err) {
    console.error('❌ Error al guardar la sesión:', err);
    return res.status(500).send('Error al guardar la sesión');
  }

  console.log('✅ Login correcto. Redirigiendo...');
  const redirectTo = req.query.redirect || '/map'; // 👈 Aquí
  res.redirect(redirectTo);                         // 👈 Aquí
  });

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