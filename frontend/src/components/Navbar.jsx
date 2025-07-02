import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
	const navigate = useNavigate();

	return (
		<nav className="flex justify-between p-4 bg-blue-700 text-white">
			<Link to="/">CarVia</Link>
			<div className="space-x-4">
			<Link to="/search">Fahrzeuge</Link>
			{
				user.role === "Mitarbeiter" && (
					<Link to="/vehicle-management">Fahrzeugverwaltung</Link>
				)
			}
			{user.role !== "guest" ? (
				<>
						<Link to="/account">Account</Link>
					<Link to="/reservations">Reservierungen</Link>
                    {/* Mitglieder bearbeiten nur für Mitarbeiter */}
                {user && user.RolleID === 3 && (
                    <Link to="/management/users">Mitglieder bearbeiten</Link>
                )}
                {/* Mitarbeiter verwalten nur für Admin */}
                {user && user.RolleID === 2 && (
                    <Link to="/management/mitarbeiter">Mitarbeiter verwalten</Link>
                )}
					<button onClick={() => { logout(); navigate('/'); }}>Logout</button>
				</>
			) : (
				<>	
					<Link to="/login">Login</Link>
					<Link to="/register">Registrieren</Link>
				</>
			)}
			</div>
		</nav>
	);
}
