import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Reservations from '../pages/Reservations';
import Vehicles from '../pages/Vehicles';

export default function AppRouter() {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reservations" element={user ? <Reservations /> : <Navigate to="/login" />} />
        <Route path="/vehicles" element={user?.role === 'employee' || user?.role === 'admin' ? <Vehicles /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
