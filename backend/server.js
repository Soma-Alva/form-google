const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Seleccionar base de datos según el entorno
// const db = process.env.NODE_ENV === 'production' && process.env.DATABASE_URL && process.env.DATABASE_URL.includes('postgresql')
//   ? require('./database-production')
//   : require('./database');

const db = require('./database-production');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar base de datos
db.initializeDatabase();

// WebSocket connection handler
io.on('connection', (socket) => {
  console.log('✅ Cliente conectado:', socket.id);

  // Escuchar mensaje de código secreto
  socket.on('send_secret_code', (data) => {
    console.log('📢 Código secreto recibido:', data);
    // Enviar a todos los clientes (incluyendo el que lo envió)
    io.emit('receive_secret_code', {
      code: data.code,
      timestamp: new Date().toISOString(),
      fromClientId: socket.id
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ Cliente desconectado:', socket.id);
  });
});

// Rutas API
app.post('/api/submissions', (req, res) => {
  const { email, password } = req.body;

  // Validación básica
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña son requeridos'
    });
  }

  // Validación de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  // Guardar en base de datos
  db.saveSubmission(email, password, (err, submissionId) => {
    if (err) {
      console.error('Error guardando submission:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al guardar los datos',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Datos guardados correctamente',
      submissionId: submissionId
    });
  });
});

app.post('/api/evaluations', (req, res) => {
  const { submissionId, rating, resources, pedagogy, content, improvements } = req.body;

  // Validación básica
  if (!submissionId || !rating || !resources || !pedagogy || !content) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos requeridos'
    });
  }

  // Guardar evaluación en base de datos
  db.saveEvaluation(submissionId, rating, resources, pedagogy, content, improvements, (err, evaluationId) => {
    if (err) {
      console.error('Error guardando evaluación:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al guardar la evaluación',
        error: err.message
      });
    }

    res.json({
      success: true,
      message: 'Evaluación guardada correctamente',
      evaluationId: evaluationId
    });
  });
});

// Ruta para obtener todas las submissions (solo para admin/pruebas)
app.get('/api/submissions', (req, res) => {
  db.getAllSubmissions((err, submissions) => {
    if (err) {
      console.error('Error obteniendo submissions:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los datos',
        error: err.message
      });
    }

    res.json({
      success: true,
      data: submissions
    });
  });
});

// Ruta para obtener detalles de una submission con su evaluación
app.get('/api/submissions/:id', (req, res) => {
  const { id } = req.params;

  db.getSubmissionDetails(id, (err, data) => {
    if (err) {
      console.error('Error obteniendo detalles:', err);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los detalles',
        error: err.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Submission no encontrada'
      });
    }

    res.json({
      success: true,
      data: data
    });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Servir archivos estáticos de React
app.use(express.static(path.join(__dirname, 'build')));

// Para producción, servir index.html para rutas no existentes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📊 Base de datos inicializada`);
  console.log(`🔌 WebSocket activo en puerto ${PORT}`);
});

module.exports = app;
