const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'equipos.json');

// Datos iniciales de resguardo
const datosIniciales = [
  { id: 1, nombre: "Sony FX3 Cinema Line", categoria: "alquiler", descripcion: "Cámara de cine compacta sensor Full Frame 4K 120fps.", precio: "$35.000 / día", imagen: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80" },
  { id: 2, nombre: "DJI Mavic 3 Pro Cine", categoria: "alquiler", descripcion: "Drone de triple cámara Hasselblad 5.1K y Apple ProRes.", precio: "$42.000 / día", imagen: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80" },
  { id: 3, nombre: "Lente Sigma 18-35mm f/1.8 Art", categoria: "venta", descripcion: "Zoom angular de alta luminosidad para montura Canon/Sony.", precio: "$890.000 USD", imagen: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=600&q=80" },
  { id: 4, nombre: "Kit Iluminación Aputure 300d II", categoria: "alquiler", descripcion: "Luz LED de punto COB 5500K balanceada día con softbox.", precio: "$22.000 / día", imagen: "https://images.unsplash.com/photo-1524143878510-e3b8d6312402?auto=format&fit=crop&w=600&q=80" },
  { id: 5, nombre: "Micrófono Rode Wireless GO II", categoria: "venta", descripcion: "Sistema de micrófonos inalámbricos dobles ultra compactos.", precio: "$320.000", imagen: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=600&q=80" },
  { id: 6, nombre: "Estabilizador DJI Ronin RS 3 Pro", categoria: "alquiler", descripcion: "Gimbal de carbono con capacidad de carga de 4.5kg.", precio: "$28.000 / día", imagen: "https://images.unsplash.com/photo-1589872782415-b6efbe0f3a09?auto=format&fit=crop&w=600&q=80" }
];

// Funciones para leer y escribir el archivo JSON
function obtenerEquipos() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(datosIniciales, null, 2));
    return datosIniciales;
  }
  const data = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(data);
}

function guardarEquipos(equipos) {
  fs.writeFileSync(DB_FILE, JSON.stringify(equipos, null, 2));
}

// GET: Todos los equipos
app.get('/api/equipos', (req, res) => {
  const { categoria } = req.query;
  let equipos = obtenerEquipos();

  if (categoria && categoria !== 'todos') {
    equipos = equipos.filter(e => e.categoria === categoria);
  }

  res.json(equipos);
});

// GET: Un solo equipo
app.get('/api/equipos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const equipos = obtenerEquipos();
  const equipo = equipos.find(e => e.id === id);

  if (!equipo) return res.status(404).json({ mensaje: 'Equipo no encontrado' });
  res.json(equipo);
});

// POST: Crear nuevo equipo
app.post('/api/equipos', (req, res) => {
  const { nombre, categoria, descripcion, precio, imagen } = req.body;
  if (!nombre || !categoria || !precio) {
    return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
  }

  const equipos = obtenerEquipos();
  const nuevoEquipo = {
    id: Date.now(),
    nombre,
    categoria,
    descripcion: descripcion || '',
    precio,
    imagen: imagen || ''
  };

  equipos.push(nuevoEquipo);
  guardarEquipos(equipos);

  res.status(201).json({ mensaje: 'Equipo creado', nuevoEquipo });
});

// DELETE: Eliminar equipo
app.delete('/api/equipos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  let equipos = obtenerEquipos();
  const filtrados = equipos.filter(e => e.id !== id);

  if (equipos.length === filtrados.length) {
    return res.status(404).json({ mensaje: 'Equipo no encontrado' });
  }

  guardarEquipos(filtrados);
  res.json({ mensaje: 'Equipo eliminado', id });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor listo en puerto ${PORT}`);
});