const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  image: String,
  description: String,
  stock: Number,
  category: { type: String, default: '' } // Nuevo campo para categoría
});

module.exports = mongoose.model('Product', productSchema);
