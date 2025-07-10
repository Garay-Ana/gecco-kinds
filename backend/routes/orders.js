const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyToken = require('../middleware/authMiddleware');

// Obtener todos los pedidos (solo admin)
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener pedidos' });
  }
});

// (Opcional) Crear pedido (para pruebas)
router.post('/', async (req, res) => {
  try {
    const { customerName, customerEmail, address, items, total } = req.body;
    const order = new Order({ customerName, customerEmail, address, items, total });
    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear pedido' });
  }
});

module.exports = router;
