import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Debug: Zeige das User-Objekt in der Konsole
    console.log("Navbar user:", user);

    return (
        <nav className="flex justify-between p-4 bg-blue-700 text-white">
            <Link to="/">CarVia</Link>
            <div className="space-x-4">
                <Link to="/search">Fahrzeuge</Link>
                {user.role === "Mitarbeiter" && (
                    <>
                        <Link to="/vehicle-management">Fahrzeugverwaltung</Link>
                        <Link to="/user-management">Mitgliederverwaltung</Link>
                    </>
                )}
                {user.role !== "guest" ? (
                    <>
                        <Link to="/account">Account</Link>
                        <Link to="/reservations">Reservierungen</Link>

                        {user.role === "Admin" && (
                            <Link to="/mitarbeiter-management">Mitarbeiter verwalten</Link>
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