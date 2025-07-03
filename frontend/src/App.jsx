import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import RegisterAdmin from './pages/RegisterAdmin'; // importa el componente
import ProductDetails from './pages/ProductDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      <Route path="/admin/register" element={<RegisterAdmin />} />
      <Route path="/product/:id" element={<ProductDetails />} />
    </Routes>
  );
}

export default App;
