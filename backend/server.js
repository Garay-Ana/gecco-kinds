const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));         // 🔐 Rutas de login y registro del admin
app.use('/api/products', require('./routes/products')); // 🛍️ Rutas de productos

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  app.listen(5000, () => {
    console.log('✅ Servidor corriendo en http://localhost:5000');
  });
})
.catch(err => {
  console.error('❌ Error al conectar con MongoDB:', err);
});
