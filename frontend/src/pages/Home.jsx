import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h1>Tienda de Ropa</h1>
      {products.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ccc', margin: 10, padding: 10 }}>
          <h3>{p.name}</h3>
          <img src={p.image} alt={p.name} width="150" />
          <p>${p.price}</p>
          <p>{p.description}</p>
        </div>
      ))}
    </div>
  );
}
