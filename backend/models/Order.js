const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  address: { type: String, required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'], default: 'pendiente' },
  createdAt: { type: Date, default: Date.now },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller' }, // Referencia opcional al vendedor
  sellerCode: { type: String } // Código de vendedor ingresado por el cliente
});

module.exports = mongoose.model('Order', orderSchema);
