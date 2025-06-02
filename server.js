// server.js
import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import mapRoutes  from './routes/map.js';

const app = express();

// 1) Configuración
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'TU_SESSION_SECRET',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static('public'));

// 2) Rutas
app.use(authRoutes);
app.use('/map', mapRoutes);

// 3) Inicio
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`→ http://localhost:${PORT}`));
