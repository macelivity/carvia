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

  const handleDelete = () => {
    if (window.confirm("Diesen Account wirklich löschen?")) {
      fetch(`/api/auth/user/${editUser.UserID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(() => {
        setEditUser(null);
        fetch("/api/auth/users", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          }
        })
          .then(res => res.json())
          .then(data => setUsers(data));
      });
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mitgliederdaten verwalten</h2>
      {editUser ? (
        <div className="mb-6">
          <form className="flex space-x-4 items-end">
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">UserID</label>
              <input
                className="border p-2"
                name="UserID"
                value={editUser.UserID}
                onChange={handleChange}
                placeholder="UserID"
                disabled
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">RolleID</label>
              <select
                className="border p-2"
                name="RolleID"
                value={editUser.RolleID}
                onChange={handleChange}
              >
                <option value={1}>Benutzer</option>
                <option value={2}>Admin</option>
                <option value={3}>Mitarbeiter</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">Username</label>
              <input
                className="border p-2"
                name="Username"
                value={editUser.Username}
                onChange={handleChange}
                placeholder="Username"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">Beitrittsdatum</label>
              <input
                className="border p-2"
                name="BeitrittsDatum"
                value={editUser.BeitrittsDatum || ""}
                onChange={handleChange}
                placeholder="BeitrittsDatum"
                type="date"
              />
            </div>
            <div className="flex flex-col">
              <label className="mb-1 text-sm font-semibold">Geburtsdatum</label>
              <input
                className="border p-2"
                name="Geburtsdatum"
                value={editUser.Geburtsdatum || ""}
                onChange={handleChange}
                placeholder="Geburtsdatum"
                type="date"
              />
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded ml-4" onClick={handleSave} type="button">
              Speichern
            </button>
            <button className="ml-2 px-4 py-2" onClick={() => setEditUser(null)} type="button">
              Abbrechen
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded ml-4"
              onClick={handleDelete}
              type="button"
            >
              Account löschen
            </button>
          </form>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">UserID</th>
              <th className="py-2">RolleID</th>
              <th className="py-2">Username</th>
              <th className="py-2">Beitrittsdatum</th>
              <th className="py-2">Geburtsdatum</th>
              <th className="py-2">Aktion</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.UserID}>
                <td className="py-2">{user.UserID}</td>
                <td className="py-2">{user.RolleID}</td>
                <td className="py-2">{user.Username}</td>
                <td className="py-2">{user.BeitrittsDatum}</td>
                <td className="py-2">{user.Geburtsdatum}</td>
                <td className="py-2">{user.PasswordHash}</td>
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