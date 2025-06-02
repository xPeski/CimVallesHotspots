import pool from '../db/db.js';

export async function encontrarPorEmail(email) {
  const res = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
  return res.rows[0] || null;
}

export async function crearUsuario({ nombre, email, passwordHash }) {
  const res = await pool.query(
    'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
    [nombre, email, passwordHash]
  );
  return res.rows[0];
}

export async function encontrarPorId(id) {
  const res = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
  return res.rows[0] || null;
}
