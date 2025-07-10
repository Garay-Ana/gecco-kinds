import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './seller-panel.css';

export default function SellerProfile() {
  const [seller, setSeller] = useState(null);
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('sellerToken');

  useEffect(() => {
    if (!token) { navigate('/seller/login'); return; }
    fetchProfile();
    // eslint-disable-next-line
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/sellers/profile', { headers: { Authorization: `Bearer ${token}` } });
      setSeller(res.data);
    } catch {
      setMsg('No se pudo cargar el perfil');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg(''); setSuccess(false);
    try {
      await axios.put('http://localhost:5000/api/sellers/change-password', { password }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Contraseña actualizada');
      setSuccess(true);
      setPassword('');
    } catch {
      setMsg('Error al cambiar contraseña');
      setSuccess(false);
    }
  };

  if (!seller) return <div className="sellerpanel-bg"><div style={{padding:'2em',textAlign:'center'}}>Cargando perfil...</div></div>;

  return (
    <div className="sellerpanel-bg">
      <header className="sellerpanel-header">
        <span className="sellerpanel-title">Perfil del Vendedor</span>
        <button className="sellerpanel-profile-btn" style={{background:'#ef4444'}} onClick={() => { localStorage.removeItem('sellerToken'); navigate('/seller/login'); }}>Cerrar sesión</button>
      </header>
      <div className="sellerpanel-dashboard" style={{flexDirection:'column',gap:'2em',maxWidth:500}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'2.2rem',fontWeight:800,color:'#10b981',marginBottom:'0.2em'}}>{seller.name}</div>
          <div style={{color:'#6366f1',fontWeight:600,marginBottom:'0.5em'}}>Zona: {seller.zone}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Correo: {seller.email}</div>
          <div style={{color:'#64748b',marginBottom:'0.5em'}}>Código: {seller.code || 'No asignado'}</div>
        </div>
        <form onSubmit={handlePassword} className="sellerpanel-form" style={{maxWidth:400,margin:'0 auto'}}>
          <div className="sellerpanel-form-title">Cambiar contraseña</div>
          <div className="sellerpanel-form-field">
            <label>Nueva contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="sellerpanel-form-actions">
            <button type="submit" className="sellerpanel-btn">Actualizar</button>
          </div>
          {msg && <div className={success ? 'sellerpanel-message-success' : 'sellerpanel-message-error'}>{msg}</div>}
        </form>
        <button className="sellerpanel-btn" style={{margin:'0 auto',background:'#6366f1'}} onClick={() => navigate('/seller/panel')}>Volver al panel</button>
      </div>
    </div>
  );
}
