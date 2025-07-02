import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import { Navigate } from "react-router-dom";

export default function EmployeeManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    password: "",
    vorname: "",
    nachname: "",
    geburtsdatum: "",
    email: "",
    hausnummer: "",
    plz: "",
    ort: "",
    strasse: "",
    iban: "",
    bic: ""
  });

  // Nur Admin darf diese Seite sehen
  if (!user || user.RolleID !== 2) {
    return <Navigate to="/" replace />;
  }

  // Mitarbeiter laden
  const fetchEmployees = () => {
    fetch("/api/auth/users", {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      }
    })
      .then(res => res.json())
      .then(data => setEmployees(data.filter(u => u.RolleID === 3)));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleCreateChange = (e) => {
    setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
  };

  const handleCreateEmployee = (e) => {
    e.preventDefault();
    fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
      },
      body: JSON.stringify({
        username: newEmployee.username,
        password: newEmployee.password,
        email: newEmployee.email,
        rolle_id: 3,
        vorname: newEmployee.vorname,
        nachname: newEmployee.nachname,
        geburtsdatum: newEmployee.geburtsdatum,
        iban: newEmployee.iban,
        bic: newEmployee.bic,
        hausnummer: newEmployee.hausnummer,
        plz: newEmployee.plz,
        ort: newEmployee.ort,
        strasse: newEmployee.strasse
      })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(JSON.stringify(data)); });
        }
        return res.json();
      })
      .then((response) => {
        console.log("Mitarbeiter erfolgreich erstellt:", response); // <-- Response ausgeben
        setShowCreate(false);
        setNewEmployee({
          username: "",
          password: "",
          vorname: "",
          nachname: "",
          geburtsdatum: "",
          email: "",
          hausnummer: "",
          plz: "",
          ort: "",
          strasse: "",
          iban: "",
          bic: ""
        });
        fetchEmployees();
      })
      .catch(err => alert("Fehler beim Anlegen: " + err.message));
  };

  // NEU: Mitarbeiter löschen
  const handleDelete = (emp) => {
    if (window.confirm("Diesen Mitarbeiter wirklich löschen?")) {
      fetch(`/api/auth/user/${emp.UserID}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      })
        .then(res => {
          if (res.status === 204) {
            fetchEmployees();
            return;
          }
          if (!res.ok) {
            fetchEmployees();
            return res.text().then(text => {
              let data;
              try {
                data = text ? JSON.parse(text) : {};
              } catch {
                data = { message: text };
              }
              alert("Fehler beim Löschen: " + (data.message || JSON.stringify(data)));
              // Kein throw mehr hier!
            });
          }
          fetchEmployees();
        })
        .catch(err => {
          // Nur noch unerwartete Fehler landen hier
          console.error("Delete error:", err);
        });
    }
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Mitarbeiter verwalten</h2>
      <button
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowCreate(true)}
      >
        Mitarbeiter anlegen
      </button>
      {showCreate && (
        <form className="flex flex-wrap gap-4 mb-6" onSubmit={handleCreateEmployee}>
          <input name="username" placeholder="Username" value={newEmployee.username} onChange={handleCreateChange} required />
          <input name="password" placeholder="Passwort" type="password" value={newEmployee.password} onChange={handleCreateChange} required />
          <input name="vorname" placeholder="Vorname" value={newEmployee.vorname} onChange={handleCreateChange} required />
          <input name="nachname" placeholder="Nachname" value={newEmployee.nachname} onChange={handleCreateChange} required />
          <input name="geburtsdatum" placeholder="Geburtsdatum" type="date" value={newEmployee.geburtsdatum} onChange={handleCreateChange} required />
          <input name="email" placeholder="E-Mail" type="email" value={newEmployee.email} onChange={handleCreateChange} required />
          <input name="hausnummer" placeholder="Hausnummer" value={newEmployee.hausnummer} onChange={handleCreateChange} />
          <input name="plz" placeholder="PLZ" value={newEmployee.plz} onChange={handleCreateChange} />
          <input name="ort" placeholder="Ort" value={newEmployee.ort} onChange={handleCreateChange} />
          <input name="strasse" placeholder="Straße" value={newEmployee.strasse} onChange={handleCreateChange} />
          <input name="iban" placeholder="IBAN" value={newEmployee.iban} onChange={handleCreateChange} />
          <input name="bic" placeholder="BIC" value={newEmployee.bic} onChange={handleCreateChange} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" type="submit">
            Anlegen
          </button>
          <button className="ml-2 px-4 py-2" type="button" onClick={() => setShowCreate(false)}>
            Abbrechen
          </button>
        </form>
      )}
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">UserID</th>
            <th className="py-2">Username</th>
            <th className="py-2">Vorname</th>
            <th className="py-2">Nachname</th>
            <th className="py-2">Geburtsdatum</th>
            <th className="py-2">E-Mail</th>
            <th className="py-2">Aktion</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.UserID}>
              <td className="py-2">{emp.UserID}</td>
              <td className="py-2">{emp.Username}</td>
              <td className="py-2">{emp.Vorname}</td>
              <td className="py-2">{emp.Nachname}</td>
              <td className="py-2">{emp.Geburtsdatum}</td>
              <td className="py-2">{emp.Email}</td>
              <td className="py-2">
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
    </div>
  );
}