import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const UserList = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                let endpoint = "";
                if (user.role === "Admin") {
                    endpoint = "/accounts/managers-support";
                } else if (user.role === "Manager" || user.role === "Customer Support") {
                    endpoint = "/accounts/users";
                } else {
                    setError("Keine Berechtigung, Nutzer anzuzeigen.");
                    setLoading(false);
                    return;
                }
                const token = localStorage.getItem("accessToken");
                const response = await axios.get(endpoint, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
            } catch (err) {
                setError("Fehler beim Laden der Nutzer.");
            }
            setLoading(false);
        };

        fetchUsers();
    }, [user.role]);

    if (loading) return <div>Laden...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Nutzerliste</h2>
            {users.length === 0 ? (
                <div>Keine Nutzer gefunden.</div>
            ) : (
                <table className="min-w-full border">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">UserID</th>
                            <th className="border px-2 py-1">Username</th>
                            <th className="border px-2 py-1">Vorname</th>
                            <th className="border px-2 py-1">Nachname</th>
                            <th className="border px-2 py-1">Rolle</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u.UserID}>
                                <td className="border px-2 py-1">{u.UserID}</td>
                                <td className="border px-2 py-1">{u.Username}</td>
                                <td className="border px-2 py-1">{u.Vorname}</td>
                                <td className="border px-2 py-1">{u.Nachname}</td>
                                <td className="border px-2 py-1">{u.RolleID}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserList;