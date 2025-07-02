import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login';
import Register from './pages/Register';
import Reservations from './pages/Reservations';
import Vehicles from './pages/Vehicles';
import Homepage from './pages/Homepage';
import UserManagement from './pages/UserManagement';
import EmployeeManagement from './pages/EmployeeManagement';

export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Navbar />

				<Routes>
					<Route path="/" element={<Homepage />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path="/reservations" element={<Reservations />} />
					<Route path="/vehicles" element={<Vehicles />} />
					<Route path="/management/users" element={<UserManagement />} />
					<Route path="/management/mitarbeiter" element={<EmployeeManagement />} />
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	)
}
