import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminLogin from './pages/AdminLogin';
import AdminPanel from './pages/AdminPanel';
import RegisterAdmin from './pages/RegisterAdmin';
import ProductDetails from './pages/ProductDetails';
import CategoryView from './pages/CategoryView';
import AdminOrders from './pages/AdminOrders';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/panel" element={<AdminPanel />} />
      <Route path="/admin/register" element={<RegisterAdmin />} />
      <Route path="/admin/pedidos" element={<AdminOrders />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/categoria/:nombre" element={<CategoryView />} />
    </Routes>
  );
}

export default App;
