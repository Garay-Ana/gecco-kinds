const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const verifyToken = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// Crear producto con imagen en Cloudinary
router.post('/', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { name, price, description, stock, category } = req.body;
    const image = req.file?.path || '';

    const product = new Product({ name, price, description, stock, image, category });
    const savedProduct = await product.save();

    console.log('✅ Producto guardado correctamente:', savedProduct);
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('❌ Error al guardar el producto:', error.message);
    res.status(500).json({ error: 'Error al guardar el producto' });
  }
});

// Obtener todos los productos (con filtro por categoría y búsqueda)
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.name = { $regex: search, $options: 'i' };
    }
    const products = await Product.find(filter);
    res.json(products);
  } catch (error) {
    console.error('❌ Error al obtener productos:', error.message);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto' });
  }
});

// 🗑️ Eliminar producto
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Producto no encontrado' });

    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error.message);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

// ✏️ Editar producto
router.put('/:id', verifyToken, upload.single('image'), async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }

    const { name, price, description, stock, category } = req.body;
    const updateData = { name, price, description, stock, category };

    if (req.file?.path) {
      updateData.image = req.file.path;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

module.exports = router;
