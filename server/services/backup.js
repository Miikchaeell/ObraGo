import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runBackup() {
  console.log("🚀 INICIANDO RESPALDO DE SEGURIDAD OBRA GO...");
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir);

  try {
    const users = await pool.query('SELECT id, email, phone, role, status, created_at FROM users');
    const projects = await pool.query('SELECT * FROM projects');
    
    const backupData = {
      timestamp,
      users: users.rows,
      projects: projects.rows
    };

    const fileName = `obrago_backup_${timestamp}.json`;
    fs.writeFileSync(path.join(backupDir, fileName), JSON.stringify(backupData, null, 2));
    
    console.log(`✅ RESPALDO COMPLETADO: ${fileName}`);
    console.log(`📂 Ubicación: ${backupDir}`);
  } catch (err) {
    console.error("❌ ERROR EN RESPALDO:", err.message);
  } finally {
    await pool.end();
  }
}

runBackup();
