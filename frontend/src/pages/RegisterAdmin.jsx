import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function RegisterAdmin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register-admin', {
        email,
        password
      });
      setMsg('✅ Registrado con éxito');
      setTimeout(() => navigate('/admin/login'), 1500); // Redirige al login
    } catch (err) {
      console.error(err);
      setMsg('❌ Error al registrar');
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Registro de Administrador</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <button type="submit" style={{ padding: '10px 20px' }}>
          Registrar
        </button>
      </form>
      {msg && <p style={{ marginTop: '10px', color: msg.includes('✅') ? 'green' : 'red' }}>{msg}</p>}
    </div>
  );
}
