import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Komponente - Schützt Routen vor unbefugtem Zugriff
 * @param {React.ReactNode} children - Die zu schützenden Komponenten
 * @param {Array<string>} allowedRoles - Erlaubte Benutzerrollen für diese Route
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Überprüfe ob Benutzer angemeldet ist
    if (!user || user.role === 'guest') {
        // Leite zum Login weiter und speichere die ursprüngliche URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Überprüfe ob die Benutzerrolle berechtigt ist
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Leite zur Startseite weiter wenn nicht berechtigt
        return <Navigate to="/" replace />;
    }

    // Zeige geschützte Inhalte an
    return children;
};

export default ProtectedRoute;
