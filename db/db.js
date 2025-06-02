// db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables del archivo .env

const { Pool } = pkg;

// Crear un pool de conexiones con la URL de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});
console.log(process.env.DATABASE_PUBLIC_URL);
// Verificar conexión
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL usando pg'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

export default pool;
