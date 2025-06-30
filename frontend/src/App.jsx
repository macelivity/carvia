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
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/NotFound';
import Account from './pages/Account';


export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Navbar />

				<Routes>
					<Route path="/" element={<Homepage />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route path='/account' element={<Account />} />
					<Route
						path="/reservations"
						element={
							<ProtectedRoute allowedRoles={['Mitglied', 'Admin', 'Mitarbeiter']}>
								<Reservations />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/vehicles"
						element={
							<ProtectedRoute allowedRoles={['Mitglied', 'Admin', 'Mitarbeiter']}>
								<Vehicles />
							</ProtectedRoute>
						}
					/>
					<Route path="/vehicle-management" element={<VehicleManagement />} />
					<Route
						path="/booking/:vehicle_id"
						element={
							<ProtectedRoute allowedRoles={['Mitglied', 'Admin', 'Mitarbeiter']}>
								<Booking />
							</ProtectedRoute>
						}
					/>
					<Route path="/search" element={<VehicleSearch />} />
					<Route path="/impressum" element={<Impressum />} />
					<Route path="/datenschutz" element={<Datenschutz />} />
					<Route path="*" element={<NotFound />} />
				</Routes>
				
				<Footer />
			</BrowserRouter>
		</AuthProvider>
	)
}
