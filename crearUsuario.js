import pool from './db/db.js'; // Conexión a la base de datos
import bcrypt from 'bcrypt'; // Para hashear las contraseñas

async function crearUsuarioConContraseñaHasheada() {
  const nombre = 'Diego Vargas';
  const contraseña = 'Novell_2025*';  
  const mapa_id = 1;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(contraseña, salt);
 
  try {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, password_hash, mapa_id) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [nombre, hashedPassword, mapa_id]
    );

    console.log('✅ Usuario creado:', result.rows[0]);
  } catch (error) {
    console.error('❌ Error al crear el usuario:', error);
  }
}

crearUsuarioConContraseñaHasheada();
