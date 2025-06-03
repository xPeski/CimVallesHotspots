// middleware/auth.js
import jwt from 'jsonwebtoken';

export function auth(req, res, next) {
  const token = req.session.token;
  if (!token) return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.redirect('/auth/login');
  }
}
