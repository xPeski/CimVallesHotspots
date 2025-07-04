// server.js
import express from 'express';
import session from 'express-session';
import authRoutes from './routes/auth.js';
import mapRoutes  from './routes/map.js';
import { auth } from './middleware/auth.js';
import revisarRoutes from './routes/revisar.js';
import historicoRoutes from './routes/historico.js';




const app = express();

// 1) Configuraciónl
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // poner true en producción con HTTPS
}));

app.use(express.static('public'));

// 2) Rutas
app.use('/historico', historicoRoutes);
app.use('/auth', authRoutes);
app.use('/map', mapRoutes);
app.use('/revisar', revisarRoutes);


// Ruta raíz
app.get('/', (req, res) => {
  try {
    res.render('login', { error: null, redirect: '/map' });
  } catch (err) {
    console.error('Error al renderizar login:', err);
    res.status(500).send('Error interno al cargar el login');
  }
});

// Iniciar servidor
try {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor en http://localhost:${process.env.PORT || 3000}`);
  });
} catch (err) {
  console.error('Error al iniciar la app:', err);
}

