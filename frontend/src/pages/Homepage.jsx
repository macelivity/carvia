import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Homepage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-4 text-blue-700">Willkommen bei CarVia</h1>
                <p className="mb-6 text-gray-700">
                    CarVia ist dein smarter Carsharing-Dienst – einfach, flexibel und nachhaltig. <br />
                    <Link to="/vehicles" className="text-blue-600 underline">Jetzt verfügbare Fahrzeuge ansehen</Link>
                </p>

                {user.role === "guest" ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">Um Reservierungen vorzunehmen, registriere dich oder logge dich ein:</p>
                        <div className="flex space-x-4">
                            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Login</Link>
                            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Registrieren</Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">Willkommen zurück, <strong>{user.username}</strong>!</p>
                        <div className="flex space-x-4">
                            <Link to="/reservations" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Reservierungen</Link>
                            {(user.role === 'Mitarbeiter' || user.role === 'Admin') && (
                                <>
                                    <Link to="/management/vehicles" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Fahrzeuge verwalten</Link>
                                    <Link to="/management/users" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">Mitgliederdaten bearbeiten</Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
