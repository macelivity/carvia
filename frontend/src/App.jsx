import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'
import './App.css'
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
import UserReservations from './pages/UserReservations';
import Rechnung from './pages/Rechnung';
import Accept from './pages/Accept';
import { Box } from '@mui/material';
import './i18n';
import VehicleResults from './pages/Vehicle_results';

/**
 * Hauptkomponente der Carsharing-Anwendung
 * Verwaltet das Routing und die allgemeine Layout-Struktur
 */
export default function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Box sx={{ 
					display: 'flex', 
					flexDirection: 'column', 
					minHeight: '100vh' 
				}}>
					<Navbar />

					<Box sx={{ flex: 1 }}>
						<Routes>
							{/* Öffentliche Routen */}
							<Route path="/" element={<Homepage />} />
							<Route path="/login" element={<Login />} />
							<Route path="/register" element={<Register />} />
							<Route path='/account' element={<Account />} />
							<Route path="/vehicles" element={<Vehicles />} />
							<Route path="/rechnung" element={<Rechnung />} />
							<Route path="/impressum" element={<Impressum />} />
							<Route path="/datenschutz" element={<Datenschutz />} />
							<Route path="/vehicle-results" element={<VehicleResults />} />

							{/* Geschützte Routen für Mitglieder */}
							<Route
								path="/reservations"
								element={
									<ProtectedRoute allowedRoles={['Mitglied']}>
										<Reservations />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/booking/:vehicle_id"
								element={
									<ProtectedRoute allowedRoles={['Mitglied']}>
										<Booking />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/booking"
								element={
									<ProtectedRoute allowedRoles={['Mitglied']}>
										<Booking />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/search"
								element={
									<ProtectedRoute allowedRoles={['Mitglied']}>
										<VehicleSearch />
									</ProtectedRoute>
								}
							/>

							{/* Geschützte Routen für Mitarbeiter */}
							<Route
								path="/vehicle-management"
								element={
									<ProtectedRoute allowedRoles={['Mitarbeiter']}>
										<VehicleManagement />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/user-reservations"
								element={
									<ProtectedRoute allowedRoles={['Mitarbeiter']}>
										<UserReservations />
									</ProtectedRoute>
								}
							/>

							{/* Geschützte Routen für Mitarbeiter und Admins */}
							<Route
								path="/accept"
								element={
									<ProtectedRoute allowedRoles={['Mitarbeiter', 'Admin']}>
										<Accept />
									</ProtectedRoute>
								}
							/>

							{/* 404 Fallback */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</Box>
					
					<Footer />
				</Box>
			</BrowserRouter>
		</AuthProvider>
	)
}
