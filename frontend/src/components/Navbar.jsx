import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="flex justify-between p-4 bg-blue-700 text-white">
            <Link to="/" className="font-bold text-xl">CarVia</Link>
            <div className="space-x-4 flex items-center">
                <Link to="/vehicles">Fahrzeuge</Link>
                {user.role !== "guest" && (
                    <>
                        <Link to="/reservations">Reservierungen</Link>
                        {/* Mitgliederdaten bearbeiten NUR für Admin */}
                        {user.RolleID === 2 && (
                            <Link to="/management/users">Mitgliederdaten bearbeiten</Link>
                        )}
                        <button onClick={logout} className="ml-2 bg-blue-900 px-3 py-1 rounded">Logout</button>
                    </>
                )}
                {user.role === "guest" && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Registrieren</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
