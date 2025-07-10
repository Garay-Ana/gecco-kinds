import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './seller-panel.css';

export default function SellerPanel() {
  const [clients, setClients] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ name: '', contact: '', address: '', notes: '', image: '' });
  const [editingId, setEditingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    if (!token) { navigate('/seller/login'); return; }
    fetchClients();
    fetchSummary();
    // eslint-disable-next-line
  }, [token]);

  const fetchClients = async () => {
    const res = await axios.get('http://localhost:5000/api/sellers/clients', { headers: { Authorization: `Bearer ${token}` } });
    setClients(res.data);
  };
  const fetchSummary = async () => {
    const res = await axios.get('http://localhost:5000/api/sellers/zone-summary', { headers: { Authorization: `Bearer ${token}` } });
    setSummary(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/sellers/clients/${editingId}`, form, { headers: { Authorization: `Bearer ${token}` } });
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/api/sellers/clients', form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setForm({ name: '', contact: '', address: '', notes: '', image: '' });
      fetchClients();
      fetchSummary();
    } catch (err) {
      setMsg('Error al guardar cliente');
    }
  };

  const handleEdit = (client) => {
    setEditingId(client._id);
    setForm({ name: client.name, contact: client.contact, address: client.address, notes: client.notes, image: client.image });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    await axios.delete(`http://localhost:5000/api/sellers/clients/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    fetchClients();
    fetchSummary();
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files[0]) return;
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      const res = await fetch('http://localhost:5000/api/upload-client', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.url) setForm(f => ({...f, image: data.url}));
    } catch {}
  };

  // Buscador y filtro
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || (client.address && client.address.toLowerCase().includes(search.toLowerCase()));
    const matchesZone = !filterZone || (summary && summary.zone === filterZone);
    return matchesSearch && matchesZone;
  });

  // Actividad reciente (últimos 5 clientes agregados o editados)
  const recentActivity = [...clients].sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)).slice(0, 5);

  return (
    <div className="sellerpanel-bg">
      <header className="sellerpanel-header">
        <span className="sellerpanel-title">Panel de Vendedor</span>
        <div>
          <button className="sellerpanel-profile-btn" onClick={() => navigate('/seller/profile')}>Perfil</button>
          <button className="sellerpanel-profile-btn" onClick={() => navigate('/seller/eVentas')}>Ventas</button>
          <button className="sellerpanel-profile-btn" style={{background:'#ef4444'}} onClick={() => { localStorage.removeItem('sellerToken'); navigate('/seller/login'); }}>Cerrar sesión</button>
        </div>
      </header>
      <section className="sellerpanel-dashboard">
        <div>
          <div className="sellerpanel-welcome">¡Bienvenido{summary && summary.sellerName ? `, ${summary.sellerName}` : ''}!</div>
          <div className="sellerpanel-zone">Zona asignada: {summary?.zone || '-'}</div>
          <div className="sellerpanel-stats">
            <div className="sellerpanel-stat-card">Personas a cargo: {summary?.totalClients ?? 0}</div>
            <div className="sellerpanel-stat-card">Ventas totales: {summary?.totalSales ?? 0}</div>
          </div>
        </div>
        <div className="sellerpanel-activity">
          <div className="sellerpanel-activity-title">Actividad reciente</div>
          <ul className="sellerpanel-activity-list">
            {recentActivity.length === 0 && <li>Sin actividad reciente</li>}
            {recentActivity.map(c => (
              <li key={c._id}>{c.name} ({c.address})</li>
            ))}
          </ul>
        </div>
      </section>
      <div className="sellerpanel-searchbar">
        <input type="text" placeholder="Buscar por nombre o dirección..." value={search} onChange={e => setSearch(e.target.value)} />
        {/* Filtro de zona, si aplica */}
        {/* <select value={filterZone} onChange={e => setFilterZone(e.target.value)}>
          <option value="">Todas las zonas</option>
          <option value="Zona 1">Zona 1</option>
        </select> */}
      </div>
      <form onSubmit={handleSubmit} className="sellerpanel-form" encType="multipart/form-data">
        <div className="sellerpanel-form-title">{editingId ? 'Editar Persona' : 'Agregar Persona'}</div>
        <div className="sellerpanel-form-grid">
          <div className="sellerpanel-form-field">
            <label>Nombre completo</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required />
          </div>
          <div className="sellerpanel-form-field">
            <label>Teléfono o correo</label>
            <input type="text" value={form.contact} onChange={e => setForm(f => ({...f, contact: e.target.value}))} />
          </div>
          <div className="sellerpanel-form-field">
            <label>Dirección / zona</label>
            <input type="text" value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))} />
          </div>
          <div className="sellerpanel-form-field">
            <label>Notas</label>
            <input type="text" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
          </div>
          <div className="sellerpanel-form-field">
            <label>Imagen o documento (opcional)</label>
            <input type="file" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
            {form.image && (
              <img src={`http://localhost:5000${form.image}`} alt="Imagen subida" style={{maxWidth:'120px',borderRadius:'0.5em',marginTop:'0.5em'}} />
            )}
          </div>
        </div>
        <div className="sellerpanel-form-actions">
          <button type="submit" className="sellerpanel-btn">{editingId ? 'Guardar Cambios' : 'Agregar Persona'}</button>
          {editingId && <button type="button" className="sellerpanel-btn delete" onClick={() => { setEditingId(null); setForm({ name: '', contact: '', address: '', notes: '', image: '' }); }}>Cancelar</button>}
        </div>
        {msg && <div className="sellerpanel-message-error">{msg}</div>}
      </form>
      <section className="sellerpanel-client-list">
        <h2 style={{color:'#10b981',marginBottom:'1em'}}>Personas a Cargo</h2>
        <div className="sellerpanel-client-grid">
          {filteredClients.map(client => (
            <div key={client._id} className="sellerpanel-client-card">
              <div className="sellerpanel-client-title">{client.name}</div>
              <div className="sellerpanel-client-info">Código: {client.code}</div>
              <div className="sellerpanel-client-info">Contacto: {client.contact}</div>
              <div className="sellerpanel-client-info">Dirección: {client.address}</div>
              <div className="sellerpanel-client-info">Notas: {client.notes}</div>
              <div className="sellerpanel-client-actions">
                <button onClick={() => handleDelete(client._id)} className="sellerpanel-btn delete">Eliminar</button>
                <button onClick={() => navigate(`/seller/client/${client._id}`)} className="sellerpanel-btn">Ver detalle</button>
              </div>
            </div>
          ))}
          {filteredClients.length === 0 && <div style={{color:'#64748b',padding:'2em'}}>No hay personas a mostrar.</div>}
        </div>
      </section>
    </div>
  );
}
