import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMitarbeiter, getUsersForMitarbeiter } from '../api/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, CircularProgress, Alert
} from '@mui/material';

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
                let response;
                if (user.role === "Admin") {
                    response = await getMitarbeiter();
                } else if (user.role === "Mitarbeiter") {
                    response = await getUsersForMitarbeiter();
                } else {
                    setError("Keine Berechtigung, Nutzer anzuzeigen.");
                    setLoading(false);
                    return;
                }
                setUsers(response.data);
            } catch (err) {
                setError("Fehler beim Laden der Nutzer.");
                setUsers([]);
            }
            setLoading(false);
        };

        fetchUsers();
    }, [user.role]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <div>
            <Typography variant="h5" component="h2" gutterBottom>
                Nutzerliste
            </Typography>
            {users.length === 0 ? (
                <Typography>Keine Nutzer gefunden.</Typography>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>UserID</TableCell>
                                <TableCell>Username</TableCell>
                                <TableCell>Vorname</TableCell>
                                <TableCell>Nachname</TableCell>
                                <TableCell>Rolle</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {users.map((u) => (
                                <TableRow key={u.UserID}>
                                    <TableCell>{u.UserID}</TableCell>
                                    <TableCell>{u.Username}</TableCell>
                                    <TableCell>{u.Vorname}</TableCell>
                                    <TableCell>{u.Nachname}</TableCell>
                                    <TableCell>{u.RolleID}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </div>
    );
};

export default UserList;