import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './seller-panel.css';

export default function ClientDetail() {
  const [client, setClient] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    fetchClient();
    // eslint-disable-next-line
  }, []);

  const fetchClient = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/sellers/client/${window.location.pathname.split('/').pop()}`, { headers: { Authorization: `Bearer ${token}` } });
      setClient(res.data);
    } catch {
      setMsg('No se pudo cargar la persona');
    }
  };

  if (!client) return <div className="sellerpanel-bg"><div style={{padding:'2em',textAlign:'center'}}>Cargando persona...</div></div>;

  return (
    <div className="sellerpanel-bg">
      <header className="sellerpanel-header">
        <span className="sellerpanel-title">Detalle de Persona</span>
        <button className="sellerpanel-profile-btn" onClick={() => navigate('/seller/panel')}>Volver al panel</button>
      </header>
      <div className="sellerpanel-dashboard" style={{flexDirection:'column',gap:'2em',maxWidth:500}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'2.2rem',fontWeight:800,color:'#10b981',marginBottom:'0.2em'}}>{client.name}</div>
          <div style={{color:'#6366f1',fontWeight:600,marginBottom:'0.5em'}}>Zona: {client.zone}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Código: {client.code || 'No asignado'}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Contacto: {client.contact}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Dirección: {client.address}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Notas: {client.notes}</div>
          <div className="sellerpanel-actions">
            {/* Botones de Editar y Pedir por WhatsApp eliminados según solicitud */}
          </div>
        </div>
      </div>
    </div>
  );
}
