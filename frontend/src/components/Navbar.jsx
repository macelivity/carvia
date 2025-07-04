import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();

	return (
		<nav className="flex justify-between items-center p-4 bg-blue-700 text-white">
			<Link to="/" className="font-bold text-lg">{t('navbar.carvia')}</Link>
			<div className="flex items-center space-x-4">
				<Link to="/search">{t('navbar.vehicles')}</Link>
				{
					user.role === "Mitarbeiter" && (
						<Link to="/vehicle-management">{t('navbar.vehicleManagement')}</Link>
					)
				}
				{
					(user.role === "Mitarbeiter") && (
						<Link to="/user-reservations">{t('navbar.userReservations')}</Link>
					)
				}
				{user.role !== "guest" ? (
					<>
						<Link to="/account">{t('navbar.account')}</Link>
						<Link to="/reservations">{t('navbar.reservations')}</Link>
						<button onClick={() => { logout(); navigate('/'); }}>{t('navbar.logout')}</button>
					</>
				) : (
					<>	
						<Link to="/login">{t('navbar.login')}</Link>
						<Link to="/register">{t('navbar.register')}</Link>
					</>
				)}
				<LanguageSelector />
			</div>
		</nav>
	);
}
