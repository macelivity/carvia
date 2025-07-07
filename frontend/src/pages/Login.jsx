import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api/api';
import { useTranslation } from 'react-i18next';

export default function Login() {
    const { t } = useTranslation();
    const { user, login: contextLogin } = useAuth();
    // Loggen des User-Objekts bei jedem Rendern von Login.jsx
    console.log('[Login.jsx] Component rendered. User from context:', user); 
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.username || !form.password) {
            setError(t('login.usernameRequired'));
            return;
        }
        try {
            const response = await loginAPI(form);
            contextLogin(response.data);
        } catch (err) {
            console.error("[Login.jsx] Login API error:", err);
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError(t('login.loginFailed'));
            }
        }
    };

    useEffect(() => {
        if (user && user.role !== 'guest') {
            navigate('/'); 
        }
    }, [user, navigate]); // Abhängigkeit vom user-Objekt aus dem AuthContext

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
            <h2 className="text-xl font-bold mb-4 text-center">{t('login.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">{t('login.username')}</label>
                    <input 
                        id="username"
                        name="username" 
                        type="text"
                        placeholder={t('login.usernamePlaceholder')} 
                        value={form.username}
                        onChange={handleChange} 
                        className="mt-1 w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                        required
                    />
                </div>
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">{t('login.password')}</label>
                    <input 
                        id="password"
                        name="password" 
                        type="password" 
                        placeholder={t('login.passwordPlaceholder')} 
                        value={form.password}
                        onChange={handleChange} 
                        className="mt-1 w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                        required
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                    {t('login.loginButton')}
                </button>
            </form>
        </div>
    );
}