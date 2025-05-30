import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api/api';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await loginAPI(form);
      login(response.data);
    } catch (err) {
      setError('Login fehlgeschlagen.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="username" placeholder="Benutzername" onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="password" type="password" placeholder="Passwort" onChange={handleChange} className="w-full p-2 border rounded" />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Einloggen</button>
      </form>
    </div>
  );
}