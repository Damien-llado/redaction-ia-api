import { Pool } from 'pg';

// Pool de connexions PostgreSQL
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Tester la connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL:', err);
  process.exit(-1);
});
