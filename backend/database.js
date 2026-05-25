const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Usar base de datos en archivo o en memoria según variable de entorno
const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'submissions.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error abriendo base de datos:', err);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
  }
});

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

const database = {
  initializeDatabase() {
    // Crear tabla de submissions
    db.run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Error creando tabla submissions:', err);
      } else {
        console.log('✅ Tabla submissions lista');
      }
    });

    // Crear tabla de evaluaciones
    db.run(`
      CREATE TABLE IF NOT EXISTS evaluations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        submission_id INTEGER NOT NULL UNIQUE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
        resources TEXT NOT NULL,
        pedagogy TEXT NOT NULL,
        content TEXT NOT NULL,
        improvements TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creando tabla evaluations:', err);
      } else {
        console.log('✅ Tabla evaluations lista');
      }
    });
  },

  saveSubmission(email, password, callback) {
    const query = `
      INSERT INTO submissions (email, password)
      VALUES (?, ?)
    `;

    db.run(query, [email, password], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID);
    });
  },

  saveEvaluation(submissionId, rating, resources, pedagogy, content, improvements, callback) {
    const query = `
      INSERT INTO evaluations (submission_id, rating, resources, pedagogy, content, improvements)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [submissionId, rating, resources, pedagogy, content, improvements || ''], function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, this.lastID);
    });
  },

  getAllSubmissions(callback) {
    const query = `
      SELECT s.id, s.email, s.password, s.timestamp,
             e.rating, e.resources, e.pedagogy, e.content, e.improvements, e.timestamp as eval_timestamp
      FROM submissions s
      LEFT JOIN evaluations e ON s.id = e.submission_id
      ORDER BY s.timestamp DESC
    `;

    db.all(query, (err, rows) => {
      if (err) {
        return callback(err);
      }
      callback(null, rows || []);
    });
  },

  getSubmissionDetails(submissionId, callback) {
    const query = `
      SELECT s.id, s.email, s.password, s.timestamp,
             e.id as evaluation_id, e.rating, e.resources, e.pedagogy, e.content, e.improvements, e.timestamp as eval_timestamp
      FROM submissions s
      LEFT JOIN evaluations e ON s.id = e.submission_id
      WHERE s.id = ?
    `;

    db.get(query, [submissionId], (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, row);
    });
  },

  close() {
    db.close((err) => {
      if (err) {
        console.error('Error cerrando base de datos:', err);
      } else {
        console.log('Base de datos cerrada');
      }
    });
  }
};

module.exports = database;
