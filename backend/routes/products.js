const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// Crear producto con imagen Cloudinary
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'No autorizado' });

  const { name, price, description, stock } = req.body;
  const image = req.file?.path || ''; // URL de la imagen

  const product = new Product({ name, price, description, stock, image });
  await product.save();

  res.json(product);
});

// Obtener productos
router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

module.exports = router;
