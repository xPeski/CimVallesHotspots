import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const token = req.session?.token;
  const aceptaJson = req.headers.accept?.includes('application/json');

  if (!token) {
    if (aceptaJson) {
      return res.status(401).json({ error: 'No autenticado' });
    } else {
      return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.warn('Token inválido:', err.message);
    if (aceptaJson) {
      return res.status(401).json({ error: 'Token inválido' });
    } else {
      return res.redirect('/auth/login');
    }
  }
}