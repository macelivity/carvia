import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Willkommen bei CarVia</h1>
      {user ? (
        <p>Sie sind eingeloggt als <strong>{user.username}</strong> ({user.role})</p>
      ) : (
        <p>Bitte loggen Sie sich ein, um Reservierungen vorzunehmen.</p>
      )}
    </div>
  );
}