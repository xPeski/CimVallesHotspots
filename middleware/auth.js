export function auth(req, res, next) {
  const token = req.session.token;
  const isApiRequest = req.headers.accept?.includes('application/json');

  if (!token) {
    if (isApiRequest) return res.status(401).json({ error: 'No autenticado' });
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (err) {
    console.warn('Token inválido:', err.message);
    if (isApiRequest) return res.status(401).json({ error: 'Token inválido' });
    res.redirect('/auth/login');
  }
}
