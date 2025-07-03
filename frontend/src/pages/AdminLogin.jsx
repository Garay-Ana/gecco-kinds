import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      localStorage.setItem('token', res.data.token);
      navigate('/admin/panel');
    } catch (err) {
      setMsg('Credenciales incorrectas. Intente nuevamente.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header-bar"></div>
        
        <div className="login-content">
          <div className="login-icon-container">
            <div className="login-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
          </div>
          
          <h1 className="login-title">Panel Administrativo</h1>
          <p className="login-subtitle">Ingrese sus credenciales para continuar</p>
          
          <form onSubmit={handleLogin}>
            <div className="login-input-group">
              <label htmlFor="email" className="login-label">Correo electrónico</label>
              <div className="login-input-container">
                <span className="login-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </span>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="login-input-group">
              <label htmlFor="password" className="login-label">Contraseña</label>
              <div className="login-input-container">
                <span className="login-input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="login-options">
              <div className="login-remember">
                <input type="checkbox" id="remember-me" />
                <label htmlFor="remember-me">Recordarme</label>
              </div>
              <a href="#" className="login-forgot">¿Olvidó su contraseña?</a>
            </div>
            
            <button
              type="submit"
              className="login-button"
            >
              Iniciar sesión
            </button>
          </form>
          
          {msg && (
            <div className="login-message error">
              {msg}
            </div>
          )}
          
          <div className="login-footer">
            <p>¿Necesita ayuda? <a href="#">Contacte al soporte</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}