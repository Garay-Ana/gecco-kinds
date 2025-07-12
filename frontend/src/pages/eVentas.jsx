import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './seller-panel.css';

export default function EVentas() {
  const [form, setForm] = useState({
    saleDate: '',
    sellerName: '',
    sellerPhone: '',
    products: '',
    quantity: '',
    totalPrice: '',
    hasSeller: 'No',
    sellerCode: '',
    paymentMethod: '',
    notes: ''
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('sellerToken');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      // Enviar datos al backend
      await axios.post('http://localhost:5000/api/sales', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMsg('Venta registrada correctamente');
      setForm({
        saleDate: '',
        sellerName: '',
        sellerPhone: '',
        products: '',
        quantity: '',
        totalPrice: '',
        hasSeller: 'No',
        sellerCode: '',
        paymentMethod: '',
        notes: ''
      });
    } catch (error) {
      setMsg('Error al registrar la venta');
    }
  };

  return (
    <div className="sellerpanel-bg">
      <header className="sellerpanel-header">
        <span className="sellerpanel-title">Registrar Venta</span>
        <button className="sellerpanel-profile-btn" onClick={() => navigate('/seller/panel')}>Volver al panel</button>
      </header>
      <form onSubmit={handleSubmit} className="sellerpanel-form" style={{maxWidth: 600, margin: '2em auto'}}>
        <div className="sellerpanel-form-title">Formulario de Venta</div>
        <div className="sellerpanel-form-grid">
          <div className="sellerpanel-form-field">
            <label>Fecha de la venta</label>
            <input type="date" name="saleDate" value={form.saleDate} onChange={handleChange} required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Nombre del vendedor</label>
            <input type="text" name="sellerName" value={form.sellerName} onChange={handleChange} required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Teléfono del vendedor</label>
            <input type="text" name="sellerPhone" value={form.sellerPhone} onChange={handleChange} required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Producto(s) vendido(s)</label>
            <textarea name="products" value={form.products} onChange={handleChange} placeholder="Lista de productos o descripción" required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Cantidad</label>
            <input type="number" name="quantity" value={form.quantity} onChange={handleChange} min="1" required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Precio total de la venta</label>
            <input type="number" name="totalPrice" value={form.totalPrice} onChange={handleChange} min="0" step="0.01" required />
          </div>
          <div className="sellerpanel-form-field">
            <label>¿Tiene asesor/vendedor adicional?</label>
            <select name="hasSeller" value={form.hasSeller} onChange={handleChange}>
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
          {form.hasSeller === 'Sí' && (
            <div className="sellerpanel-form-field">
              <label>Código del vendedor adicional</label>
              <input type="text" name="sellerCode" value={form.sellerCode} onChange={handleChange} required />
            </div>
          )}
          <div className="sellerpanel-form-field">
            <label>Método de pago</label>
            <input type="text" name="paymentMethod" value={form.paymentMethod} onChange={handleChange} placeholder="Efectivo, Nequi, Daviplata, etc." />
          </div>
          <div className="sellerpanel-form-field" style={{gridColumn: '1 / -1'}}>
            <label>Notas o comentarios</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notas adicionales" />
          </div>
        </div>
        <div className="sellerpanel-form-actions">
          <button type="submit" className="sellerpanel-btn">Registrar Venta</button>
        </div>
        {msg && <div style={{marginTop: '1em', color: msg.includes('correctamente') ? 'green' : 'red'}}>{msg}</div>}
      </form>
      <div style={{maxWidth: 600, margin: '2em auto', textAlign: 'center'}}>
        <button className="sellerpanel-btn" onClick={() => window.location.href = '/seller/VerVentas'}>Ver Ventas</button>
      </div>
    </div>
  );
}