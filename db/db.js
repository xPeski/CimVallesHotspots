// db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables del archivo .env

const { Pool } = pkg;

// Validar URL
if (!process.env.DATABASE_PUBLIC_URL) {
  console.error('❌ DATABASE_PUBLIC_URL no está definida');
  process.exit(1);
}

// Crear pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_PUBLIC_URL,
  ssl: { rejectUnauthorized: false } // Railway requiere SSL
});

console.log('🔌 Conectando a PostgreSQL en:', process.env.DATABASE_PUBLIC_URL);

// Verificar conexión
pool.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL usando pg'))
  .catch(err => console.error('❌ Error al conectar a PostgreSQL:', err));

export default pool;
