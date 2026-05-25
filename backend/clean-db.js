#!/usr/bin/env node

/**
 * Script para limpiar la base de datos
 * Uso: node clean-db.js
 */

const db = require('./database');

console.log('\n🗑️  Iniciando limpieza de base de datos...\n');

const clearTable = (tableName) => {
  return new Promise((resolve) => {
    db.run(`DELETE FROM ${tableName}`, function(err) {
      if (err) {
        console.error(`❌ Error al limpiar ${tableName}:`, err.message);
      } else {
        console.log(`✅ ${tableName} limpiado (${this.changes} registros borrados)`);
      }
      resolve();
    });
  });
};


async function cleanup() {
  try {
    console.log('Borrando registros...\n');
    await clearTable('submissions');
    await clearTable('evaluations');
    
    console.log('\n✅ Base de datos completamente limpiada\n');
    console.log('Puedes usar la aplicación nuevamente.\n');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message, '\n');
    process.exit(1);
  }
}

cleanup();
