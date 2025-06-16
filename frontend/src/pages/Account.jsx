import { useEffect, useState } from "react";
import axios from "axios";

export default function Account() {
  const [usernames, setUsernames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get("/api/auth/profile")
      .then(res => {
        setUsernames(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Fehler beim Laden der Benutzernamen.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Alle Benutzernamen</h2>
      {loading && <p>Lade...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <ul className="list-disc pl-6">
          {usernames.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}