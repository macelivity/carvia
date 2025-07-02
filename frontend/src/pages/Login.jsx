import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { user, login: contextLogin } = useAuth();
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
      setError('Benutzername und Passwort sind erforderlich.');
      return;
    }
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Login fehlgeschlagen');
      }
      const data = await response.json();
      contextLogin(data); // setzt den User im Context
      navigate('/'); // <-- Redirect nach Login, damit Navbar neu rendert
    } catch (err) {
      console.error('[Login.jsx] Login API error:', err);
      if (err.response && err.response.data && err.response.data.msg) {
        setError(err.response.data.msg);
      } else {
        setError('Login fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
    }
  };

  useEffect(() => {
    if (user && user.role !== 'guest') {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">Benutzername</label>
          <input 
              id="username"
              name="username" 
              type="text"
              placeholder="Benutzername" 
              value={form.username}
              onChange={handleChange} 
              className="mt-1 w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500" 
              required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Passwort</label>
          <input 
              id="password"
              name="password" 
              type="password" 
              placeholder="Passwort" 
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
          Einloggen
        </button>
      </form>
    </div>
  );
}