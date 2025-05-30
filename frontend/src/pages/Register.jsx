import { useState } from 'react';
import { register } from '../api/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      setMessage('Registrierung erfolgreich. Bitte warten Sie auf Freigabe.');
    } catch {
      setMessage('Fehler bei der Registrierung.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Registrieren</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Name" onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="username" placeholder="Benutzername" onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="password" type="password" placeholder="Passwort" onChange={handleChange} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">Anmelden</button>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
    </div>
  );
}