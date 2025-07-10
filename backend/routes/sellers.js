const express = require('express');
const router = express.Router();
const Seller = require('../models/Seller');
const Client = require('../models/Client');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/authMiddleware');

function generateSellerCode(name, zone) {
  // Genera un código tipo ZONA5-MIGUEL o MARTHA23
  const cleanName = name.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const randomNum = Math.floor(10 + Math.random() * 90);
  if (zone) {
    return `${zone.replace(/\s+/g, '').toUpperCase()}-${cleanName.substring(0,6)}${randomNum}`;
  }
  return `${cleanName.substring(0,8)}${randomNum}`;
}

function generateClientCode(name) {
  // Genera un código tipo NOMBRE23
  const cleanName = name.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  const randomNum = Math.floor(10 + Math.random() * 90);
  return `${cleanName.substring(0,8)}${randomNum}`;
}

// Registro de vendedor
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, zone } = req.body;
    if (!name || !email || !password || !zone) return res.status(400).json({ error: 'Faltan campos' });
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ error: 'El correo ya está registrado' });
    let code;
    let unique = false;
    // Generar código único
    while (!unique) {
      code = generateSellerCode(name, zone);
      const codeExists = await Seller.findOne({ code });
      if (!codeExists) unique = true;
    }
    const seller = new Seller({ name, email, password, zone, code });
    await seller.save();
    res.status(201).json({ message: 'Vendedor registrado', code });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar vendedor' });
  }
});

// Login de vendedor
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email });
    if (!seller) return res.status(400).json({ error: 'Credenciales incorrectas' });
    const match = await seller.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Credenciales incorrectas' });
    const token = jwt.sign({ id: seller._id, role: 'seller', zone: seller.zone }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

// Middleware para vendedores
function sellerAuth(req, res, next) {
  if (req.user && req.user.role === 'seller') return next();
  return res.status(403).json({ error: 'No autorizado' });
}

// CRUD de clientes (solo para su zona)
router.get('/clients', verifyToken, sellerAuth, async (req, res) => {
  const clients = await Client.find({ seller: req.user.id });
  res.json(clients);
});

router.post('/clients', verifyToken, sellerAuth, async (req, res) => {
  const { name, contact, address, notes, image } = req.body;
  if (!name) return res.status(400).json({ error: 'Falta el nombre' });

  // Generar código único para cliente
  let code;
  let unique = false;
  while (!unique) {
    code = generateClientCode(name);
    const codeExists = await Client.findOne({ code });
    if (!codeExists) unique = true;
  }

  const client = new Client({
    name,
    contact,
    address,
    notes,
    image,
    zone: req.user.zone,
    seller: req.user.id,
    code,
  });
  await client.save();
  res.status(201).json(client);
});

router.put('/clients/:id', verifyToken, sellerAuth, async (req, res) => {
  const { name, contact, address, notes, image } = req.body;
  const client = await Client.findOneAndUpdate(
    { _id: req.params.id, seller: req.user.id },
    { name, contact, address, notes, image },
    { new: true }
  );
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(client);
});

router.delete('/clients/:id', verifyToken, sellerAuth, async (req, res) => {
  const client = await Client.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json({ message: 'Cliente eliminado' });
});

// Obtener detalle de cliente por id (solo para su vendedor)
router.get('/clients/:id', verifyToken, sellerAuth, async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, seller: req.user.id });
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(client);
});

// Obtener detalle de cliente por id (ruta alternativa para frontend)
router.get('/client/:id', verifyToken, sellerAuth, async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, seller: req.user.id });
  if (!client) return res.status(404).json({ error: 'Cliente no encontrado' });
  res.json(client);
});

// Resumen de zona
router.get('/zone-summary', verifyToken, sellerAuth, async (req, res) => {
  const clients = await Client.find({ seller: req.user.id });
  const totalClients = clients.length;
  const totalSales = clients.reduce((sum, c) => sum + (c.sales || 0), 0);
  res.json({ zone: req.user.zone, totalClients, totalSales });
});

// Obtener perfil del vendedor autenticado
router.get('/profile', verifyToken, sellerAuth, async (req, res) => {
  const seller = await Seller.findById(req.user.id).select('-password');
  if (!seller) return res.status(404).json({ error: 'No encontrado' });
  res.json(seller);
});

// Cambiar contraseña del vendedor autenticado
router.put('/change-password', verifyToken, sellerAuth, async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Contraseña inválida' });
  const seller = await Seller.findById(req.user.id);
  if (!seller) return res.status(404).json({ error: 'No encontrado' });
  seller.password = password;
  await seller.save();
  res.json({ message: 'Contraseña actualizada' });
});

// Buscar vendedor por código
router.get('/by-code/:code', async (req, res) => {
  const seller = await Seller.findOne({ code: req.params.code.toUpperCase() });
  if (!seller) return res.status(404).json({ error: 'No encontrado' });
  res.json(seller);
});

module.exports = router;
