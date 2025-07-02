import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();

    return (
        <nav className="flex justify-between p-4 bg-blue-700 text-white">
            <Link to="/" className="font-bold text-xl">CarVia</Link>
            <div className="space-x-4 flex items-center">
                {/* Fahrzeuge und Reservierungen für alle eingeloggten */}
                {user && user.role !== "guest" && (
                  <>
                    <Link to="/vehicles">Fahrzeuge</Link>
                    <Link to="/reservations">Reservierungen</Link>
                  </>
                )}
                {/* Mitglieder bearbeiten nur für Mitarbeiter */}
                {user && user.RolleID === 3 && (
                    <Link to="/management/users">Mitglieder bearbeiten</Link>
                )}
                {/* Mitarbeiter verwalten nur für Admin */}
                {user && user.RolleID === 2 && (
                    <Link to="/management/mitarbeiter">Mitarbeiter verwalten</Link>
                )}
                {user && user.role !== "guest" && (
                    <button onClick={logout} className="ml-2 bg-blue-900 px-3 py-1 rounded">Logout</button>
                )}
                {(!user || user.role === "guest") && (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Registrieren</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
