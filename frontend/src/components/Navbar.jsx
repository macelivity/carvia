import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
	const { user, logout } = useAuth();

	return (
		<nav className="flex justify-between p-4 bg-blue-700 text-white">
			<Link to="/">CarVia</Link>
			<div className="space-x-4">
			<Link to="/search">Fahrzeuge</Link>
				{user.role !== "guest" ? (
					<>
					{user.role !== "Mitglied" ? (
					<>
						<Link to="/accounts">Nutzerübersicht</Link>
					</>
				) : (
					<>	
						<Link to="/reservations">Reservierungen</Link>
						
					</>
				)}
					<Link to="/account">Account</Link>
					<button onClick={logout}>Logout</button>
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
