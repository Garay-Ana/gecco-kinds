import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './seller-panel.css';

export default function VerVentas() {
  const [sales, setSales] = useState([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('sellerToken');

  const fetchSales = async () => {
    try {
      const params = {};
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await axios.get('http://localhost:5000/api/sales', {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setSales(res.data);
    } catch (error) {
      setMsg('Error al cargar las ventas');
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(f => ({ ...f, [name]: value }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchSales();
  };

  return (
    <div className="sellerpanel-bg">
      <header className="sellerpanel-header">
        <span className="sellerpanel-title">Ventas Realizadas</span>
        <button className="sellerpanel-profile-btn" onClick={() => navigate('/seller/eVentas')}>Volver a Registrar Venta</button>
      </header>
      <form onSubmit={handleFilterSubmit} className="sellerpanel-form" style={{maxWidth: 600, margin: '1em auto'}}>
        <div className="sellerpanel-form-title">Filtrar por Fecha</div>
        <div className="sellerpanel-form-grid" style={{gridTemplateColumns: '1fr 1fr'}}>
          <div className="sellerpanel-form-field">
            <label>Fecha inicio</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
          </div>
          <div className="sellerpanel-form-field">
            <label>Fecha fin</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
          </div>
        </div>
        <div className="sellerpanel-form-actions">
          <button type="submit" className="sellerpanel-btn">Aplicar filtro</button>
        </div>
      </form>
      {msg && <div style={{color: 'red', textAlign: 'center'}}>{msg}</div>}
      <section className="sellerpanel-client-list" style={{maxWidth: 800, margin: '1em auto'}}>
        <h2 style={{color:'#10b981',marginBottom:'1em'}}>Lista de Ventas</h2>
        {sales.length === 0 ? (
          <div style={{color:'#64748b',padding:'2em', textAlign: 'center'}}>No hay ventas para mostrar.</div>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{backgroundColor: '#10b981', color: 'white'}}>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Fecha</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Cliente</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Código Vendedor</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Productos</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Cantidad</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Precio Total</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Método de Pago</th>
                <th style={{padding: '0.5em', border: '1px solid #ddd'}}>Notas</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(sale => (
                <tr key={sale._id} style={{borderBottom: '1px solid #ddd'}}>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{new Date(sale.createdAt).toLocaleDateString()}</td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{sale.customerName}</td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{sale.sellerCode || 'VENTA DIRECTA'}</td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>
                    {sale.items && sale.items.length > 0 ? sale.items.map(item => item.name).join(', ') : 'N/A'}
                  </td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>
                    {sale.items && sale.items.length > 0 ? sale.items.reduce((acc, item) => acc + item.quantity, 0) : 'N/A'}
                  </td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{sale.total}</td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{sale.paymentMethod || '-'}</td>
                  <td style={{padding: '0.5em', border: '1px solid #ddd'}}>{sale.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
