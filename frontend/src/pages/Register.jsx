import { useState } from 'react';
import { register } from '../api/api'; // Annahme: register-Funktion in api.js ist korrekt
import { useNavigate } from 'react-router-dom';

export default function Register() {
    const [form, setForm] = useState({
        email: '',
        username: '',
        password: '',
        vorname: '',
        nachname: '',
        geburtsdatum: '', // Format YYYY-MM-DD für type="date"
        iban: '',
        bic: '',
        plz: '',
        ort: '',
        strasse: '',
        hausnummer: '',
        fuehrerschein: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMessage('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        // Einfache Frontend-Validierung für erforderliche Felder
        const requiredFields = ['email', 'username', 'password', 'vorname', 'nachname', 'geburtsdatum', 'iban', 'bic', 'plz', 'ort', 'strasse', 'hausnummer', 'fuehrerschein']; // 'fuehrerschein' hinzugefügt
        for (const field of requiredFields) {
            if (!form[field]) {
                setError(`Bitte füllen Sie das Feld "${field}" aus.`);
                return;
            }
        }
        if (form.password.length < 6) {
            setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
            return;
        }

        try {
            await register(form); // Sendet das gesamte Formularobjekt
            setMessage('Registrierung erfolgreich. Sie werden in Kürze zur Login-Seite weitergeleitet.');
            setTimeout(() => {
                navigate('/login');
            }, 3000); // Weiterleitung nach 3 Sekunden
        } catch (err) {
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError('Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.');
            }
            console.error("Registrierungsfehler:", err);
        }
    };

    return (
        <div className="max-w-lg mx-auto mt-10 mb-10 p-6 bg-white rounded-lg shadow-xl">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Registrieren</h2>
            {message && <p className="text-sm text-center p-3 mb-4 bg-green-100 text-green-700 rounded">{message}</p>}
            {error && <p className="text-sm text-center p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-Mail</label>
                    <input id="email" name="email" type="email" placeholder="E-Mail-Adresse" value={form.email} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">Benutzername</label>
                    <input id="username" name="username" placeholder="Benutzername" value={form.username} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700">Passwort</label>
                    <input id="password" name="password" type="password" placeholder="Passwort (min. 6 Zeichen)" value={form.password} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="vorname" className="block text-sm font-medium text-gray-700">Vorname</label>
                        <input id="vorname" name="vorname" placeholder="Vorname" value={form.vorname} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="nachname" className="block text-sm font-medium text-gray-700">Nachname</label>
                        <input id="nachname" name="nachname" placeholder="Nachname" value={form.nachname} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                </div>

                <div>
                    <label htmlFor="geburtsdatum" className="block text-sm font-medium text-gray-700">Geburtsdatum</label>
                    <input id="geburtsdatum" name="geburtsdatum" type="date" value={form.geburtsdatum} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                    <label htmlFor="fuehrerschein" className="block text-sm font-medium text-gray-700">Führerscheinnummer</label>
                    <input id="fuehrerschein" name="fuehrerschein" placeholder="Führerscheinnummer" value={form.fuehrerschein} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                </div>

                <h3 className="text-lg font-semibold pt-4 text-gray-700">Adressdaten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="strasse" className="block text-sm font-medium text-gray-700">Straße</label>
                        <input id="strasse" name="strasse" placeholder="Straße" value={form.strasse} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="hausnummer" className="block text-sm font-medium text-gray-700">Hausnummer</label>
                        <input id="hausnummer" name="hausnummer" placeholder="Hausnummer" value={form.hausnummer} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="plz" className="block text-sm font-medium text-gray-700">PLZ</label>
                        <input id="plz" name="plz" placeholder="Postleitzahl" value={form.plz} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="ort" className="block text-sm font-medium text-gray-700">Ort</label>
                        <input id="ort" name="ort" placeholder="Ort" value={form.ort} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                </div>

                <h3 className="text-lg font-semibold pt-4 text-gray-700">Bankdaten</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="iban" className="block text-sm font-medium text-gray-700">IBAN</label>
                        <input id="iban" name="iban" placeholder="IBAN" value={form.iban} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                    <div>
                        <label htmlFor="bic" className="block text-sm font-medium text-gray-700">BIC</label>
                        <input id="bic" name="bic" placeholder="BIC" value={form.bic} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" required />
                    </div>
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    Registrieren
                </button>
            </form>
        </div>
    );
}