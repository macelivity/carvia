import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function Homepage() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <div className="bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold mb-4 text-blue-700">{t('homepage.title')}</h1>
                <p className="mb-6 text-gray-700">
                    {t('homepage.description')} <br />
                    <Link to="/vehicles" className="text-blue-600 underline">{t('homepage.seeVehicles')}</Link>
                </p>

                {user.role === "guest" ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">{t('homepage.forGuests')}</p>
                        <div className="flex space-x-4">
                            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t('homepage.loginButton')}</Link>
                            <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">{t('homepage.registerButton')}</Link>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-gray-600">{t('homepage.welcomeBack')} <strong>{user.username}</strong>!</p>
                        <div className="flex space-x-4">
                            <Link to="/reservations" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">{t('homepage.reservationsButton')}</Link>
                            {(user.role === 'Mitarbeiter' || user.role === 'Admin') && (
                                <Link to="/vehicle-management" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">{t('homepage.vehicleManagementButton')}</Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
