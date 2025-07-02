import React, { useEffect, useState } from "react";
import UserEditFormTable from "../components/UserEditFormTable";

export default function UserManagement() {
  const [members, setMembers] = useState([]);
  const [editUser, setEditUser] = useState(null);

  // Mitglieder laden (RolleID === 1)
  const fetchMembers = () => {
    fetch("/api/auth/users", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
      .then(res => res.json())
      .then(data => setMembers(data.filter(u => u.RolleID === 1)));
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleEditSave = (updatedUser) => {
    fetch(`/api/auth/user/${updatedUser.UserID}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify(updatedUser)
    })
      .then(res => {
        if (!res.ok) throw new Error("Fehler beim Speichern");
        return res.json();
      })
      .then(() => {
        setEditUser(null);
        fetchMembers();
      })
      .catch(err => alert(err.message));
  };

  const handleDelete = (userToDelete) => {
    if (window.confirm(`Sind Sie sicher, dass Sie ${userToDelete.Username} löschen möchten?`)) {
      fetch(`/api/auth/user/${userToDelete.UserID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error("Fehler beim Löschen");
          fetchMembers();
        })
        .catch(err => alert(err.message));
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mitglieder verwalten</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">UserID</th>
            <th className="py-2">Username</th>
            <th className="py-2">Vorname</th>
            <th className="py-2">Nachname</th>
            <th className="py-2">Geburtsdatum</th>
            <th className="py-2">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {members.map(emp => (
            <tr key={emp.UserID}>
              <td className="py-2">{emp.UserID}</td>
              <td className="py-2">{emp.Username}</td>
              <td className="py-2">{emp.Vorname}</td>
              <td className="py-2">{emp.Nachname}</td>
              <td className="py-2">{emp.Geburtsdatum}</td>
              <td className="py-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => setEditUser(emp)}
                >
                  Bearbeiten
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(emp)}
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bearbeiten-Menü als Modal */}
      {editUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h3 className="text-xl font-bold mb-4">Mitglied bearbeiten</h3>
            <UserEditFormTable
              userData={editUser}
              onSave={handleEditSave}
              onCancel={() => setEditUser(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}