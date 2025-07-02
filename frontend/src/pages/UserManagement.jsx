import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function UserManagement() {
  const { user } = useAuth();

  // Nur Mitarbeiter (RolleID === 3) dürfen diese Seite sehen
  if (!user || user.RolleID !== 3) {
    return <Navigate to="/" replace />;
  }

  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newMember, setNewMember] = useState({
    Username: "",
    Password: "",
    Vorname: "",
    Nachname: "",
    Geburtsdatum: "",
    Email: "",
    Hausnummer: "",
    PLZ: "",
    Ort: "",
    Strasse: "",
    IBAN: "",
    BIC: ""
  });

  useEffect(() => {
    fetch("/api/auth/users", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.filter(user => user.RolleID === 1));
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
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(editUser),
    }).then(() => {
      setEditUser(null);
      fetch("/api/auth/users", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
        .then(res => res.json())
        .then(data => setUsers(data.filter(user => user.RolleID === 1)));
    });
  };

  // Korrigierte handleDelete-Funktion
  const handleDelete = (user) => {
    if (!user || !user.UserID) {
      alert("UserID fehlt!");
      return;
    }
    if (window.confirm("Diesen Account wirklich löschen?")) {
      fetch(`/api/auth/user/${user.UserID}`, {
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
          .then(data => setUsers(data.filter(u => u.RolleID === 1)));
      });
    }
  };

  const handleCreateChange = (e) => {
    setNewMember({ ...newMember, [e.target.name]: e.target.value });
  };

  const handleCreateMember = (e) => {
    e.preventDefault();
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({
        username: newMember.Username,
        password: newMember.Password,
        email: newMember.Email,
        rolle_id: 1,
        vorname: newMember.Vorname,
        nachname: newMember.Nachname,
        geburtsdatum: newMember.Geburtsdatum,
        iban: newMember.IBAN,
        bic: newMember.BIC,
        hausnummer: newMember.Hausnummer,
        plz: newMember.PLZ,
        ort: newMember.Ort,
        strasse: newMember.Strasse
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(JSON.stringify(data)); });
        }
        return res.json();
      })
      .then(() => {
        setShowCreate(false);
        setNewMember({
          Username: "",
          Password: "",
          Vorname: "",
          Nachname: "",
          Geburtsdatum: "",
          Email: "",
          Hausnummer: "",
          PLZ: "",
          Ort: "",
          Strasse: "",
          IBAN: "",
          BIC: ""
        });
        // Mitgliederliste neu laden
        fetch("/api/auth/users", {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          }
        })
          .then(res => res.json())
          .then(data => setUsers(data.filter(user => user.RolleID === 1)));
      })
      .catch(err => alert("Fehler beim Anlegen: " + err.message));
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mitgliederdaten verwalten</h2>
      {/* Button zum Anlegen eines neuen Mitglieds */}
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowCreate(true)}
      >
        Mitglied anlegen
      </button>
      {/* Formular anzeigen, wenn showCreate true */}
      {showCreate && (
        <form className="flex flex-wrap gap-4 mb-6" onSubmit={handleCreateMember}>
          <input name="Username" placeholder="Username" value={newMember.Username} onChange={handleCreateChange} required />
          <input name="Password" placeholder="Passwort" type="password" value={newMember.Password} onChange={handleCreateChange} required />
          <input name="Vorname" placeholder="Vorname" value={newMember.Vorname} onChange={handleCreateChange} required />
          <input name="Nachname" placeholder="Nachname" value={newMember.Nachname} onChange={handleCreateChange} required />
          <input name="Geburtsdatum" placeholder="Geburtsdatum" type="date" value={newMember.Geburtsdatum} onChange={handleCreateChange} required />
          <input name="Email" placeholder="E-Mail" type="email" value={newMember.Email} onChange={handleCreateChange} required />
          <input name="Hausnummer" placeholder="Hausnummer" value={newMember.Hausnummer} onChange={handleCreateChange} />
          <input name="PLZ" placeholder="PLZ" value={newMember.PLZ} onChange={handleCreateChange} />
          <input name="Ort" placeholder="Ort" value={newMember.Ort} onChange={handleCreateChange} />
          <input name="Strasse" placeholder="Straße" value={newMember.Strasse} onChange={handleCreateChange} />
          <input name="IBAN" placeholder="IBAN" value={newMember.IBAN} onChange={handleCreateChange} />
          <input name="BIC" placeholder="BIC" value={newMember.BIC} onChange={handleCreateChange} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
            Anlegen
          </button>
          <button className="ml-2 px-4 py-2" type="button" onClick={() => setShowCreate(false)}>
            Abbrechen
          </button>
        </form>
      )}
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
          </form>
        </div>
      ) : loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">UserID</th>
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
                <td className="py-2">{user.Username}</td>
                <td className="py-2">{user.BeitrittsDatum}</td>
                <td className="py-2">{user.Geburtsdatum}</td>
                <td className="py-2 space-x-2">
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(user)}
                  >
                    Bearbeiten
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleDelete(user)}
                  >
                    Löschen
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