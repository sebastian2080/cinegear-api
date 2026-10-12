const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// 1. CONEXIÓN Y CREACIÓN DE BASE DE DATOS SQLITE
const dbPath = path.join(__dirname, 'cinegear.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos SQLite:', err.message);
  } else {
    console.log('📦 Conectado con éxito a la base de datos SQLite (cinegear.db)');
  }
});

// Inicializar la tabla y cargar datos de prueba si está vacía
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS equipos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      categoria TEXT NOT NULL,
      descripcion TEXT,
      precio TEXT NOT NULL,
      imagen TEXT
    )
  `);

  // Insertar datos iniciales si no hay registros
  db.get("SELECT COUNT(*) AS count FROM equipos", (err, row) => {
    if (row && row.count === 0) {
      const stmt = db.prepare(`
        INSERT INTO equipos (nombre, categoria, descripcion, precio, imagen)
        VALUES (?, ?, ?, ?, ?)
      `);

      const equiposIniciales = [
        ["Sony FX3 Cinema Line", "alquiler", "Cámara de cine compacta sensor Full Frame 4K 120fps.", "$35.000 / día", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"],
        ["DJI Mavic 3 Pro Cine", "alquiler", "Drone de triple cámara Hasselblad 5.1K y Apple ProRes.", "$42.000 / día", "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"],
        ["Lente Sigma 18-35mm f/1.8 Art", "venta", "Zoom angular de alta luminosidad para montura Canon/Sony.", "$890.000 USD", "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80"],
        ["Kit Iluminación Aputure 300d II", "alquiler", "Luz LED de punto COB 5500K balanceada día con softbox.", "$22.000 / día", "https://images.unsplash.com/photo-1524143878510-e3b8d6312402?auto=format&fit=crop&w=600&q=80"],
        ["Micrófono Rode Wireless GO II", "venta", "Sistema de micrófonos inalámbricos dobles ultra compactos.", "$320.000", "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80"],
        ["Estabilizador DJI Ronin RS 3 Pro", "alquiler", "Gimbal de carbono con capacidad de carga de 4.5kg.", "$28.000 / día", "https://images.unsplash.com/photo-1589872782415-b6efbe0f3a09?auto=format&fit=crop&w=600&q=80"]
      ];

      equiposIniciales.forEach(eq => stmt.run(eq));
      stmt.finalize();
      console.log('🌱 Datos iniciales cargados en SQLite.');
    }
  });
});

// ==========================================================================
// 2. RUTAS Y MÉTODOS HTTP (CRUD COMPLETO)
// ==========================================================================

// GET: Obtener todos los equipos (con filtro opcional por categoría)
app.get('/api/equipos', (req, res) => {
  const { categoria } = req.query;

  let sql = 'SELECT * FROM equipos';
  let params = [];

  if (categoria && categoria !== 'todos') {
    sql += ' WHERE categoria = ?';
    params.push(categoria);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET: Obtener un solo equipo por ID
app.get('/api/equipos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM equipos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ mensaje: 'Equipo no encontrado' });
    res.json(row);
  });
});

// POST: Crear un nuevo equipo en la Base de Datos
app.post('/api/equipos', (req, res) => {
  const { nombre, categoria, descripcion, precio, imagen } = req.body;

  if (!nombre || !categoria || !precio) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios (nombre, categoria, precio)' });
  }

  const sql = `INSERT INTO equipos (nombre, categoria, descripcion, precio, imagen) VALUES (?, ?, ?, ?, ?)`;
  const params = [nombre, categoria, descripcion || '', precio, imagen || ''];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({
      mensaje: 'Equipo creado con éxito',
      nuevoEquipo: { id: this.lastID, nombre, categoria, descripcion, precio, imagen }
    });
  });
});

// PUT: Actualizar un equipo existente
app.put('/api/equipos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, descripcion, precio, imagen } = req.body;

  const sql = `
    UPDATE equipos 
    SET nombre = ?, categoria = ?, descripcion = ?, precio = ?, imagen = ? 
    WHERE id = ?
  `;
  const params = [nombre, categoria, descripcion, precio, imagen, id];

  db.run(sql, params, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ mensaje: 'Equipo no encontrado' });

    res.json({ mensaje: 'Equipo actualizado correctamente', id });
  });
});

// DELETE: Eliminar un equipo
app.delete('/api/equipos/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM equipos WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ mensaje: 'Equipo no encontrado' });

    res.json({ mensaje: 'Equipo eliminado de la base de datos', id });
  });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`🚀 API con SQLite corriendo en http://127.0.0.1:${PORT}`);
  console.log(`📌 Endpoint: http://127.0.0.1:${PORT}/api/equipos`);
});