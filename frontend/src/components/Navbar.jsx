import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
	const { user, logout } = useAuth();
	console.log('Navbar user:', user);

	return (
		<nav className="flex justify-between p-4 bg-blue-700 text-white">
			<Link to="/">CarVia</Link>
			<div className="space-x-4">
			<Link to="/vehicles">Fahrzeuge</Link>
				{user.role !== "guest" ? (
					<>
						<Link to="/reservations">Reservierungen</Link>
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
