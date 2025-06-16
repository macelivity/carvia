import React, { useEffect, useState } from "react";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  const handleEdit = (user) => setEditUser(user);

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    fetch(`/api/auth/user/${editUser.UserID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // <--- Token hier einfügen
      },
      body: JSON.stringify(editUser),
    }).then(() => {
      setEditUser(null);
      fetch("/api/auth/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}` // <--- Auch hier!
        }
      })
        .then(res => res.json())
        .then(data => setUsers(data));
    });
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mitgliederdaten verwalten</h2>
      {editUser ? (
        <div className="mb-6">
          <input
            className="border p-2 mr-2"
            name="Vorname"
            value={editUser.Vorname}
            onChange={handleChange}
            placeholder="Vorname"
          />
          <input
            className="border p-2 mr-2"
            name="Nachname"
            value={editUser.Nachname}
            onChange={handleChange}
            placeholder="Nachname"
          />
          {/* Weitere Felder nach Bedarf */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSave}>
            Speichern
          </button>
          <button className="ml-2 px-4 py-2" onClick={() => setEditUser(null)}>
            Abbrechen
          </button>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Benutzername</th>
              <th className="py-2">Vorname</th>
              <th className="py-2">Nachname</th>
              <th className="py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.UserID}>
                <td className="py-2">{user.Username}</td>
                <td className="py-2">{user.Vorname}</td>
                <td className="py-2">{user.Nachname}</td>
                <td className="py-2">
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(user)}
                  >
                    Bearbeiten
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}