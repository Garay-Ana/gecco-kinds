const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const verifyToken = require('../middleware/authMiddleware');

// Listar ventas con filtros para vendedor autenticado
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { startDate, endDate, customerName, paymentMethod } = req.query;
    const filter = { seller: req.user.id };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    if (customerName) {
      filter.customerName = { $regex: customerName, $options: 'i' };
    }
    if (paymentMethod) {
      filter.paymentMethod = paymentMethod;
    }

    const sales = await Order.find(filter).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// Crear venta
router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'seller') {
      return res.status(403).json({ error: 'No autorizado' });
    }
    const { saleDate, customerName, customerPhone, products, quantity, totalPrice, hasSeller, sellerCode, sellerName, paymentMethod, notes } = req.body;

    const order = new Order({
      createdAt: saleDate ? new Date(saleDate) : new Date(),
      customerName,
      customerEmail: customerPhone,
      address: '', // No se recibe dirección en el formulario, se puede agregar si se desea
      items: products ? [{ name: products, quantity: quantity || 1, price: totalPrice || 0 }] : [],
      total: totalPrice || 0,
      seller: req.user.id,
      sellerCode: hasSeller === 'Sí' ? sellerCode : 'VENTA DIRECTA',
      paymentMethod,
      notes
    });

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear venta' });
  }
});

module.exports = router;
