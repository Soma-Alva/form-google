const { Pool } = require('pg');

// Usar DATABASE_URL proporcionada por Railway
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('error', (err) => {
  console.error('Error en pool de PostgreSQL:', err);
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

const database = {
  async initializeDatabase() {
    try {
      // Crear tabla de submissions
      await pool.query(`
        CREATE TABLE IF NOT EXISTS submissions (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla submissions lista');

      // Crear tabla de evaluaciones
      await pool.query(`
        CREATE TABLE IF NOT EXISTS evaluations (
          id SERIAL PRIMARY KEY,
          submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
          resources TEXT NOT NULL,
          pedagogy TEXT NOT NULL,
          content TEXT NOT NULL,
          improvements TEXT,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tabla evaluations lista');
    } catch (error) {
      console.error('Error inicializando base de datos:', error);
    }
  },

  async saveSubmission(email, password, callback) {
    try {
      const result = await pool.query(
        'INSERT INTO submissions (email, password) VALUES ($1, $2) RETURNING id',
        [email, password]
      );
      callback(null, result.rows[0].id);
    } catch (error) {
      callback(error);
    }
  },

  async saveEvaluation(submissionId, rating, resources, pedagogy, content, improvements, callback) {
    try {
      const result = await pool.query(
        `INSERT INTO evaluations (submission_id, rating, resources, pedagogy, content, improvements)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [submissionId, rating, resources, pedagogy, content, improvements || '']
      );
      callback(null, result.rows[0].id);
    } catch (error) {
      callback(error);
    }
  },

  async getAllSubmissions(callback) {
    try {
      const result = await pool.query(`
        SELECT s.id, s.email, s.password, s.timestamp,
               e.rating, e.resources, e.pedagogy, e.content, e.improvements, e.timestamp as eval_timestamp
        FROM submissions s
        LEFT JOIN evaluations e ON s.id = e.submission_id
        ORDER BY s.timestamp DESC
      `);
      callback(null, result.rows);
    } catch (error) {
      callback(error);
    }
  },

  async getSubmissionDetails(submissionId, callback) {
    try {
      const result = await pool.query(`
        SELECT s.id, s.email, s.password, s.timestamp,
               e.id as evaluation_id, e.rating, e.resources, e.pedagogy, e.content, e.improvements, e.timestamp as eval_timestamp
        FROM submissions s
        LEFT JOIN evaluations e ON s.id = e.submission_id
        WHERE s.id = $1
      `, [submissionId]);
      
      callback(null, result.rows[0] || null);
    } catch (error) {
      callback(error);
    }
  },

  close() {
    pool.end((err) => {
      if (err) {
        console.error('Error cerrando pool PostgreSQL:', err);
      } else {
        console.log('Pool PostgreSQL cerrado');
      }
    });
  }
};

module.exports = database;
