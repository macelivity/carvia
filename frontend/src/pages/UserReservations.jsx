import { useState } from 'react';
import { TextField, Button, Container, Typography, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function UserReservations() {
  const { user } = useAuth();
  const [search, setSearch] = useState({ vorname: '', nachname: '' });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, reservation: null, values: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    setUsers([]);
    setSelectedUser(null);
    setReservations([]);
    setEditDialog({ open: false, reservation: null, values: {} });
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/user/search?vorname=${search.vorname}&nachname=${search.nachname}`);
      setUsers(res.data);
      if (res.data.length === 0) setError('Kein User gefunden');
    } catch (e) {
      setError(e.message || 'Fehler bei der Suche');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setReservations([]);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/user/${user.UserID}/reservations`);
      setReservations(res.data);
      if (res.data.length === 0) setError('Keine Reservierungen gefunden');
    } catch (e) {
      setError(e.message || 'Fehler beim Laden der Reservierungen');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (reservation) => {
    setEditDialog({ open: true, reservation, values: { ...reservation } });
  };

  const handleEditChange = (e) => {
    setEditDialog((prev) => ({ ...prev, values: { ...prev.values, [e.target.name]: e.target.value } }));
  };

  const handleEditSave = async () => {
    const { values } = editDialog;
    await axios.put(`/api/reservierung/${values.ReservierungID}`, values);
    setEditDialog({ open: false, reservation: null, values: {} });
    // Refresh reservations
    handleSelectUser(selectedUser);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Benutzer-Reservierungen suchen</Typography>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <TextField label="Vorname" value={search.vorname} onChange={e => setSearch(s => ({ ...s, vorname: e.target.value }))} />
        <TextField label="Nachname" value={search.nachname} onChange={e => setSearch(s => ({ ...s, nachname: e.target.value }))} />
        <Button variant="contained" onClick={handleSearch}>Suchen</Button>
      </div>
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: 24 }}>
          <CircularProgress />
        </div>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}
      {!loading && !error && users.length > 0 && (
        <div>
          <Typography variant="h6">Gefundene Nutzer:</Typography>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {users.map(u => (
              <li key={u.UserID} style={{ marginBottom: 8 }}>
                <Button onClick={() => handleSelectUser(u)} sx={{ m: 0, textAlign: 'left', width: '100%' }} fullWidth variant="outlined">
                  <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                    <span><b>{u.Vorname} {u.Nachname}</b> (Username: {u.Username})</span>
                    <span>UserID: {u.UserID} | Geburtsdatum: {u.Geburtsdatum}</span>
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!loading && selectedUser && (
        <div style={{ marginTop: 32 }}>
          <Typography variant="h5" gutterBottom>Reservierungen von {selectedUser.Vorname} {selectedUser.Nachname}</Typography>
          {reservations.length === 0 && !error ? <Typography>Keine Reservierungen gefunden.</Typography> : null}
          {reservations.length > 0 && reservations.map(r => (
            <Card key={r.ReservierungID} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>Reservierung-ID: {r.ReservierungID}</Typography>
                <Typography>Fahrzeug-ID: {r.FahrzeugID}</Typography>
                <Typography>Tarif-ID: {r.TarifID}</Typography>
                <Typography>Zeitraum: {r.StartDatum} – {r.EndDatum}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => handleEditOpen(r)}>Edit</Button>
              </CardActions>
            </Card>
          ))}
        </div>
      )}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, reservation: null, values: {} })}>
        <DialogTitle>Reservierung bearbeiten</DialogTitle>
        <DialogContent>
          {editDialog.reservation && (
            <>
              <Typography sx={{ mt: 1, mb: 1 }}>
                <b>ReservierungID:</b> {editDialog.values.ReservierungID}
              </Typography>
              <Typography sx={{ mb: 2 }}>
                <b>UserID:</b> {editDialog.values.UserID}
              </Typography>
              {Object.keys(editDialog.values)
                .filter(key => key !== 'ReservierungID' && key !== 'UserID')
                .map(key => (
                  <TextField
                    key={key}
                    margin="dense"
                    label={key}
                    name={key}
                    value={editDialog.values[key]}
                    onChange={handleEditChange}
                    fullWidth
                  />
                ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false, reservation: null, values: {} })}>Abbrechen</Button>
          <Button onClick={handleEditSave} variant="contained">Speichern</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
