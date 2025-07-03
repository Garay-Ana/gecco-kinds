import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import './home.css';

export default function CategoryView() {
  const { nombre } = useParams();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // Normalizar categoría para el backend (sin acentos, minúsculas, sin espacios extra)
    function normalize(str) {
      return (str || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
    }
    const normalizedCategory = normalize(nombre.replace(/-/g, ' '));
    const params = new URLSearchParams();
    params.append('category', normalizedCategory);
    if (search.trim()) params.append('search', search.trim());
    axios.get(`http://localhost:5000/api/products?${params.toString()}`)
      .then(res => {
        setProducts(res.data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [nombre, search]);

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">
            <span className="logo-accent">Style</span>Fashion
          </h1>
          <h2 style={{fontWeight:700, fontSize:'1.3rem', marginLeft:'2rem'}}>
            Categoría: {nombre.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          <input
            type="text"
            className="search-input"
            placeholder="Buscar en esta categoría..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{marginLeft:'2rem'}}
          />
          <Link to="/" className="header-button" style={{marginLeft:'2rem'}}>Volver al inicio</Link>
        </div>
      </header>
      <main className="main-content">
        {isLoading ? (
          <div className="loading-spinner"><div className="spinner"></div></div>
        ) : (() => {
          // Filtrar productos con categoría válida y que coincida exactamente (insensible a mayúsculas, espacios y acentos)
          function normalize(str) {
            return (str || '')
              .normalize('NFD')
              .replace(/\p{Diacritic}/gu, '')
              .replace(/\s+/g, ' ')
              .trim()
              .toLowerCase();
          }
          const catParam = normalize(nombre.replace(/-/g, ' '));
          const filtered = products.filter(product => {
            if (!product.category) return false;
            return normalize(product.category) === catParam;
          });
          return filtered.length === 0 ? (
            <div className="no-products-message">No hay productos en esta categoría.</div>
          ) : (
            <div className="products-grid">
              {filtered.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image-container">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                    ) : (
                      <div className="image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="product-details">
                    <h3 className="product-title">
                      {product.name}
                      <span className="product-price">
                        {(product.price * 1000).toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}
                      </span>
                    </h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-description">{product.description}</p>
                    <Link to={`/product/${product._id}`} className="details-button">Ver Detalles</Link>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </main>
    </div>
  );
}
