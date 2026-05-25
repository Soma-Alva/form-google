#!/usr/bin/env node

/**
 * Script para ver los datos guardados en la base de datos
 * Uso: node view-data.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'submissions.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error abriendo base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado a la base de datos SQLite\n');
});

console.log('📊 DATOS GUARDADOS EN LA BASE DE DATOS\n');
console.log('═'.repeat(80) + '\n');

// Obtener submissions
db.all(`
  SELECT s.id, s.email, s.password, s.timestamp,
         e.id as eval_id, e.rating, e.resources, e.pedagogy, e.content, e.improvements, e.timestamp as eval_timestamp
  FROM submissions s
  LEFT JOIN evaluations e ON s.id = e.submission_id
  ORDER BY s.timestamp DESC
`, (err, rows) => {
  if (err) {
    console.error('❌ Error al consultar:', err.message);
    db.close();
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log('⚠️  No hay datos guardados aún.\n');
    console.log('🔄 Prueba el formulario en http://localhost:3000 para agregar datos.\n');
    db.close();
    process.exit(0);
  }

  rows.forEach((row, index) => {
    console.log(`📝 REGISTRO #${row.id}`);
    console.log('─'.repeat(80));
    console.log(`  Email:      ${row.email}`);
    console.log(`  Password:   ${row.password} (⚠️  en texto plano)`);
    console.log(`  Guardado:   ${row.timestamp}`);
    
    if (row.eval_id) {
      console.log('\n  📊 EVALUACIÓN:');
      console.log(`    Calificación (1-10): ${row.rating}`);
      console.log(`    Recursos:           ${row.resources}`);
      console.log(`    Pedagogía:          ${row.pedagogy}`);
      console.log(`    Contenido:          ${row.content}`);
      console.log(`    Mejoras:            ${row.improvements || '(sin comentarios)'}`);
      console.log(`    Enviada:            ${row.eval_timestamp}`);
    } else {
      console.log('\n  ⏳ Evaluación: (aún no completada)');
    }
    
    console.log('\n' + '═'.repeat(80) + '\n');
  });

  // Estadísticas
  console.log('📈 ESTADÍSTICAS');
  console.log('─'.repeat(80));
  
  const totalSubmissions = rows.length;
  const completedEvaluations = rows.filter(r => r.eval_id).length;
  
  console.log(`  Total de logins:       ${totalSubmissions}`);
  console.log(`  Evaluaciones completadas: ${completedEvaluations}`);
  console.log(`  Pendientes:            ${totalSubmissions - completedEvaluations}`);
  
  if (completedEvaluations > 0) {
    const avgRating = (rows.filter(r => r.rating).reduce((sum, r) => sum + r.rating, 0) / completedEvaluations).toFixed(1);
    console.log(`  Calificación promedio: ${avgRating}/10`);
  }
  
  console.log('\n' + '═'.repeat(80) + '\n');
  
  // Comandos útiles
  console.log('💡 COMANDOS ÚTILES:\n');
  console.log('  Exportar a CSV:        node export-data.js');
  console.log('  Ver datos en tiempo real: npm run dev');
  console.log('  Abrir base de datos:   sqlite3 submissions.db');
  console.log('\n');
  
  db.close();
});
