import { useState } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    image: null,
  });

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      setForm({ ...form, image: e.target.files[0] });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('stock', form.stock);
    formData.append('description', form.description);
    formData.append('image', form.image);

    try {
      await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': 'TOKEN-FALSO-POR-AHORA' // luego usamos JWT real
        }
      });
      alert('Producto agregado con imagen');
    } catch (error) {
      console.error('Error al guardar producto', error);
    }
  };

  return (
    <div>
      <h1>Admin - Agregar Producto</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Nombre" onChange={handleChange} />
        <input name="price" type="number" placeholder="Precio" onChange={handleChange} />
        <input name="stock" type="number" placeholder="Stock" onChange={handleChange} />
        <textarea name="description" placeholder="Descripción" onChange={handleChange} />
        <input name="image" type="file" accept="image/*" onChange={handleChange} />
        <button type="submit">Guardar</button>
      </form>
    </div>
  );
}
