import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Reservations from './pages/Reservations';
import Vehicles from './pages/Vehicles';
import Homepage from './pages/Homepage';
import Booking from './pages/Booking';
import VehicleSearch from './pages/VehicleSearch';
import VehicleManagement from './pages/VehicleManagement';
import Impressum from './pages/Impressum';
import Datenschutz from './pages/Datenschutz';


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
					<Route path="/vehicle-management" element={<VehicleManagement />} />
					<Route path="/booking/:vehicle_id" element={<Booking />} />
					<Route path="/search" element={<VehicleSearch />} />
					<Route path="/impressum" element={<Impressum />} />
					<Route path="/datenschutz" element={<Datenschutz />} />
				</Routes>
				<Footer />
			</BrowserRouter>
		</AuthProvider>
	)
}
