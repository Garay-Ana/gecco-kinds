import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './admin-panel.css';

const CATEGORIES = ['Ropa para Niño', 'Ropa para Niña'];

export default function AdminPanel() {
  // Estados principales
  const [form, setForm] = useState({
    name: '', price: '', stock: '', description: '', image: null,
    images: [], sizes: '', colors: '', category: ''
  });
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [galleryInputs, setGalleryInputs] = useState([null]);
  
  // Estados para vendedores
  const [showSellers, setShowSellers] = useState(false);
  const [sellers, setSellers] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerClients, setSellerClients] = useState([]);
  const [sellerSales, setSellerSales] = useState([]);
  const [loadingSellers, setLoadingSellers] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingSales, setLoadingSales] = useState(false);

  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Efectos
  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    fetchProducts();
  }, [token, navigate]);

  // Funciones para productos
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'image' ? files[0] : name === 'images' ? Array.from(files) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('No hay token de autenticación');
      return;
    }

    const formData = new FormData();
    if (form.images && form.images.length > 0) {
      form.images.forEach(img => formData.append('images', img));
    } else if (form.image) {
      formData.append('image', form.image);
    }
    formData.append('sizes', form.sizes || '');
    formData.append('colors', form.colors || '');
    
    Object.entries(form).forEach(([key, val]) => {
      if (["images", "image", "sizes", "colors"].includes(key)) return;
      if (val) formData.append(key, val);
    });

    try {
      setIsLoading(true);
      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/products/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        alert('Producto actualizado correctamente');
        setEditingId(null);
      } else {
        await axios.post(
          'http://localhost:5000/api/products',
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        alert('Producto agregado correctamente');
      }

      setForm({ 
        name: '', price: '', stock: '', description: '', 
        image: null, images: [], sizes: '', colors: '', category: '' 
      });
      fetchProducts();
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Error al guardar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      description: product.description,
      image: null,
      images: [],
      sizes: product.sizes ? product.sizes.join(', ') : '',
      colors: product.colors ? product.colors.join(', ') : '',
      category: product.category || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!token) {
      alert('No hay token de autenticación');
      return;
    }
    
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Producto eliminado correctamente');
      fetchProducts();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    } finally {
      setIsLoading(false);
    }
  };

  // Funciones para vendedores
  const fetchSellers = async () => {
    try {
      setLoadingSellers(true);
      const res = await axios.get('http://localhost:5000/api/admin-sellers/sellers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellers(res.data);
    } catch (error) {
      console.error('Error fetching sellers:', error);
      alert('Error al cargar vendedores');
    } finally {
      setLoadingSellers(false);
    }
  };

  const fetchSellerClients = async (sellerId) => {
    try {
      setLoadingClients(true);
      const res = await axios.get(`http://localhost:5000/api/admin-sellers/sellers/${sellerId}/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellerClients(res.data);
    } catch (error) {
      console.error('Error fetching seller clients:', error);
      alert('Error al cargar clientes del vendedor');
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchSellerSales = async (sellerId) => {
    try {
      setLoadingSales(true);
      const res = await axios.get(`http://localhost:5000/api/admin-sellers/sellers/${sellerId}/sales`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSellerSales(res.data);
    } catch (error) {
      console.error('Error fetching seller sales:', error);
      alert('Error al cargar ventas del vendedor');
    } finally {
      setLoadingSales(false);
    }
  };

  const handleSelectSeller = (seller) => {
    setSelectedSeller(seller);
    fetchSellerClients(seller._id);
    fetchSellerSales(seller._id);
  };

  const handleToggleSellers = () => {
    setShowSellers(prev => !prev);
    setShowProducts(false);
    if (!showSellers) {
      fetchSellers();
      setSelectedSeller(null);
      setSellerClients([]);
      setSellerSales([]);
    }
  };

  const handleToggleProducts = () => {
    setShowProducts(prev => !prev);
    setShowSellers(false);
    if (!showProducts) {
      fetchProducts();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // Render
  return (
    <div className="admin-panel-container">
      <header className="admin-header">
        <div className="admin-title-container">
          <h1 className="admin-title">
            {editingId ? '✏️ Editar Producto' : '➕ Panel de Administración'}
          </h1>
          <p className="admin-subtitle">Gestión de productos</p>
        </div>
        <nav className="admin-navbar">
          <button 
            onClick={handleToggleProducts} 
            className={`nav-btn${showProducts ? ' active' : ''}`}
          >
            Productos
          </button>
          <button 
            onClick={handleToggleSellers} 
            className={`nav-btn${showSellers ? ' active' : ''}`}
          >
            Vendedores
          </button>
          <button onClick={handleLogout} className="logout-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
              <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
            </svg>
            Cerrar Sesión
          </button>
        </nav>
      </header>

      {!showSellers && (
        <form onSubmit={handleSubmit} className="product-form">
          <h2 className="form-title">Formulario de Producto</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Nombre</label>
              <input
                id="name" name="name" type="text"
                placeholder="Nombre del producto"
                value={form.name} onChange={handleChange} required
              />
            </div>
            <div className="form-field">
              <label htmlFor="price">Precio</label>
              <input
                id="price" name="price" type="number"
                placeholder="Precio" value={form.price}
                onChange={handleChange} required min="0" step="0.01"
              />
            </div>
            <div className="form-field">
              <label htmlFor="stock">Stock</label>
              <input
                id="stock" name="stock" type="number"
                placeholder="Cantidad en stock" value={form.stock}
                onChange={handleChange} required min="0"
              />
            </div>
            <div className="form-field">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description" name="description"
                placeholder="Descripción del producto" value={form.description}
                onChange={handleChange} required
              />
            </div>
            <div className="form-field">
              <label htmlFor="category">Categoría</label>
              <select
                id="category" name="category"
                value={form.category} onChange={handleChange} required
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-field file-input">
              <label htmlFor="image">Imagen principal</label>
              <input
                id="image" name="image" type="file"
                accept="image/*" onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="sizes">Tallas</label>
              <input
                id="sizes" name="sizes" type="text"
                placeholder="Ej: 4A, 6A, 8A, 10A" value={form.sizes}
                onChange={handleChange}
              />
            </div>
            <div className="form-field">
              <label htmlFor="colors">Colores</label>
              <div className="color-palette-admin">
                {['#ff0000','#00bcd4','#4caf50','#ffeb3b','#ff9800','#e91e63','#9c27b0','#795548','#607d8b','#000000','#ffffff'].map((color, idx) => (
                  <span
                    key={idx}
                    className={`color-dot${form.colors.split(',').map(c => c.trim().toLowerCase()).includes(color.toLowerCase()) ? ' selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      let arr = form.colors.split(',').map(c => c.trim()).filter(Boolean);
                      if (arr.map(c => c.toLowerCase()).includes(color.toLowerCase())) {
                        arr = arr.filter(c => c.toLowerCase() !== color.toLowerCase());
                      } else {
                        arr.push(color);
                      }
                      setForm(f => ({ ...f, colors: arr.join(', ') }));
                    }}
                  />
                ))}
                <input
                  id="colors" name="colors" type="text"
                  placeholder="Ej: rojo, azul, #ff0000" value={form.colors}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Procesando...
                </>
              ) : editingId ? 'Guardar Cambios' : 'Agregar Producto'}
            </button>
          </div>
        </form>
      )}

      {showProducts && (
        <div className="products-list">
          <h2 className="products-title">🛍️ Productos</h2>
          {isLoading && products.length === 0 ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="product-grid">
              {products.map(product => (
                <div key={product._id} className="product-card">
                  <div className="product-image-container">
                    {product.image ? (
                      <img 
                        src={product.image} alt={product.name}
                        className="product-image" loading="lazy"
                      />
                    ) : (
                      <div className="image-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#a0aec0" viewBox="0 0 16 16">
                          <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">
                      {(product.price * 1000).toLocaleString('es-CO', { 
                        style: 'currency', currency: 'COP', minimumFractionDigits: 0 
                      })}
                    </p>
                    <p className="product-category">{product.category}</p>
                    <p className="product-stock">Stock: {product.stock}</p>
                    <p className="product-description">{product.description}</p>
                    <p className="product-sizes">
                      Tallas: {product.sizes && product.sizes.length > 0 ? product.sizes.join(', ') : '—'}
                    </p>
                    {product.colors && product.colors.length > 0 && (
                      <div className="product-colors">
                        <span>Colores:</span>
                        <div className="color-dots">
                          {product.colors.slice(0, 5).map((color, idx) => (
                            <span 
                              key={idx} className="color-dot" 
                              style={{ backgroundColor: color.trim() }}
                              title={color.trim()}
                            />
                          ))}
                          {product.colors.length > 5 && (
                            <span className="more-colors">+{product.colors.length - 5}</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="product-actions">
                    <button 
                      onClick={() => handleEdit(product)} 
                      className="edit-btn" disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(product._id)} 
                      className="delete-btn" disabled={isLoading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSellers && (
        <div className="sellers-section">
          <h2>Lista de Vendedores</h2>
          {loadingSellers ? (
            <p>Cargando vendedores...</p>
          ) : (
            <ul className="seller-list">
              {sellers.map(seller => (
                <li 
                  key={seller._id} 
                  onClick={() => handleSelectSeller(seller)} 
                  className={`seller-item${selectedSeller?._id === seller._id ? ' selected' : ''}`}
                >
                  <strong>{seller.name}</strong> - {seller.email} - Código: {seller.code} - Zona: {seller.zone}
                </li>
              ))}
            </ul>
          )}

          {selectedSeller && (
            <div className="seller-details">
              <h3>Personas a cargo de {selectedSeller.name}</h3>
              {loadingClients ? (
                <p>Cargando clientes...</p>
              ) : sellerClients.length > 0 ? (
                <div className="clients-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Contacto</th>
                        <th>Código</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerClients.map(client => (
                        <tr key={client._id}>
                          <td>{client.name}</td>
                          <td>{client.contact}</td>
                          <td>{client.code}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay personas a cargo registradas</p>
              )}

              <h3>Ventas de {selectedSeller.name}</h3>
              {loadingSales ? (
                <p>Cargando ventas...</p>
              ) : sellerSales.length > 0 ? (
                <div className="sales-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Método de pago</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerSales.map(sale => (
                        <tr key={sale._id}>
                          <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
                          <td>{sale.customerName}</td>
                          <td>${sale.total.toLocaleString()}</td>
                          <td>{sale.paymentMethod || 'No especificado'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No hay ventas registradas</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}