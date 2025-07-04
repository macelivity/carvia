import { useState, useEffect, useCallback } from 'react';
import {
  TextField, Button, Container, Typography, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, MenuItem, Stepper, Step, StepLabel, Box, Grid
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// --- Hilfskomponenten ---
function UserList({ users, onSelect, t }) {
  if (!users.length) return null;
  return (
    <div>
      <Typography variant="h6">{t('userReservations.foundUsers')}</Typography>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {users.map(u => (
          <li key={u.UserID} style={{ marginBottom: 8 }}>
            <Button onClick={() => onSelect(u)} sx={{ m: 0, textAlign: 'left', width: '100%' }} fullWidth variant="outlined">
              <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                <span><b>{u.Vorname} {u.Nachname}</b> (Username: {u.Username})</span>
                <span>UserID: {u.UserID} | {t('auth.birthDate')}: {u.Geburtsdatum}</span>
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReservationList({ reservations, onEdit, onDelete, t }) {
  return reservations.map(r => (
    <Card key={r.ReservierungID} sx={{ mb: 2 }}>
      <CardContent>
        <Typography>{t('userReservations.reservationId')}: {r.ReservierungID}</Typography>
        <Typography>{t('userReservations.vehicleId')}: {r.FahrzeugID}</Typography>
        <Typography>{t('userReservations.tariffId')}: {r.TarifID}</Typography>
        <Typography>{t('userReservations.period')}: {r.StartDatum} – {r.EndDatum}</Typography>
      </CardContent>
      <CardActions>
        <Button onClick={() => onEdit(r)}>{t('common.edit')}</Button>
        <Button color="error" onClick={() => onDelete(r)} sx={{ ml: 1 }}>{t('common.delete')}</Button>
      </CardActions>
    </Card>
  ));
}

function EditReservationDialog({ open, values, onChange, onClose, onSave, t }) {
  return (
    <Dialog open={open} onClose={onClose}
      PaperProps={{ sx: { width: { xs: '95vw', sm: 500 }, maxWidth: '95vw', borderRadius: 3, p: 0 } }}>
      <DialogTitle sx={{ p: 0, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', color: 'white', minHeight: 64, display: 'flex', alignItems: 'center', pl: 3, fontWeight: 600, fontSize: 22, letterSpacing: 0.5 }}>
        {t('userReservations.editReservationDialog')}
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
        <Box sx={{ height: 16 }} />
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>{t('userReservations.reservationData')}</Typography>
        <Typography sx={{ mb: 2, fontSize: 15 }}><b>{t('userReservations.reservationId')}:</b> {values.ReservierungID}</Typography>
        <Typography sx={{ mb: 2, fontSize: 15 }}><b>UserID:</b> {values.UserID}</Typography>
        {Object.keys(values)
          .filter(key => key !== 'ReservierungID' && key !== 'UserID')
          .map(key => (
            <TextField
              key={key}
              margin="dense"
              label={key}
              name={key}
              value={values[key]}
              onChange={onChange}
              fullWidth
              sx={{ mb: 2 }}
            />
          ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>{t('userReservations.cancel')}</Button>
        <Button onClick={onSave} variant="contained">{t('userReservations.save')}</Button>
      </DialogActions>
    </Dialog>
  );
}

// --- Hauptkomponente ---
export default function UserReservations() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [search, setSearch] = useState({ vorname: '', nachname: '' });
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [editDialog, setEditDialog] = useState({ open: false, values: {} });
  const [createDialog, setCreateDialog] = useState({ open: false, page: 0, values: { FahrzeugID: '', TarifID: '', StartDatum: null, EndDatum: null, Abholort: '', AbholPlz: '', Rueckgabeort: '', RueckgabePlz: '', UserID: '', Vorname: '', Nachname: '' }, filteredVehicles: [], vehicleLoading: false, vehicleError: null });
  const [loading, setLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState(null); // Fehler für User-Suche
  const [reservationError, setReservationError] = useState(null); // Fehler für Reservierungen
  const [createError, setCreateError] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reservation: null });

  // Lade Tarife, wenn Dialog geöffnet wird
  useEffect(() => {
    if (createDialog.open) {
      axios.get('/api/tarif').then(res => setTariffs(res.data)).catch(() => setTariffs([]));
    }
  }, [createDialog.open]);

  // Suche Nutzer
  const handleSearch = async () => {
    setUsers([]); setSelectedUser(null); setReservations([]); setEditDialog({ open: false, values: {} }); setLoading(true);
    setUserSearchError(null); setReservationError(null);
    try {
      const res = await axios.get(`/api/user/search?vorname=${search.vorname}&nachname=${search.nachname}`);
      setUsers(res.data);
      if (res.data.length === 0) setUserSearchError(t('userReservations.noUserFound'));
    } catch (e) {
      setUserSearchError(e.message || t('userReservations.searchError'));
    } finally { setLoading(false); }
  };

  // Lade Reservierungen für Nutzer
  const handleSelectUser = async (user) => {
    setSelectedUser(user); setReservations([]); setReservationError(null);
    try {
      const res = await axios.get(`/api/user/${user.UserID}/reservations`);
      setReservations(res.data);
      if (res.data.length === 0) setReservationError(t('userReservations.noReservationsFound'));
    } catch (e) {
      setReservationError(e.message || t('userReservations.reservationError'));
    }
  };

  // Edit Dialog öffnen
  const handleEditOpen = (reservation) => setEditDialog({ open: true, values: { ...reservation } });
  const handleEditChange = (e) => setEditDialog(prev => ({ ...prev, values: { ...prev.values, [e.target.name]: e.target.value } }));
  const handleEditSave = async () => {
    await axios.put(`/api/reservierung/${editDialog.values.ReservierungID}`, editDialog.values);
    setEditDialog({ open: false, values: {} });
    handleSelectUser(selectedUser);
  };

  // Create Dialog öffnen
  const handleCreateOpen = () => setCreateDialog({
    open: true, page: 0,
    values: {
      FahrzeugID: '', TarifID: '', StartDatum: null, EndDatum: null, Abholort: '', AbholPlz: '', Rueckgabeort: '', RueckgabePlz: '', UserID: selectedUser?.UserID || '', Vorname: selectedUser?.Vorname || '', Nachname: selectedUser?.Nachname || ''
    },
    filteredVehicles: [], vehicleLoading: false, vehicleError: null
  });
  const handleCreateChange = (e) => setCreateDialog(prev => ({ ...prev, values: { ...prev.values, [e.target.name]: e.target.value } }));
  const handleCreateDateChange = (name, value) => setCreateDialog(prev => ({ ...prev, values: { ...prev.values, [name]: value } }));

  // Fahrzeugsuche
  const handleVehicleSearch = async () => {
    setCreateDialog(prev => ({ ...prev, vehicleLoading: true, vehicleError: null, filteredVehicles: [] }));
    try {
      const params = new URLSearchParams();
      const v = createDialog.values;
      if (v.StartDatum) params.append('start_datum', new Date(v.StartDatum).toISOString());
      if (v.EndDatum) params.append('end_datum', new Date(v.EndDatum).toISOString());
      if (v.hersteller) params.append('hersteller', v.hersteller);
      if (v.fahrzeugtyp) params.append('fahrzeugtyp', v.fahrzeugtyp);
      if (v.getriebeart) params.append('getriebeart', v.getriebeart);
      if (v.sitze) params.append('sitze', v.sitze);
      if (v.Abholort) params.append('abholort', v.Abholort);
      if (v.AbholPlz) params.append('abholplz', v.AbholPlz);
      if (v.Rueckgabeort) params.append('rueckgabeort', v.Rueckgabeort);
      if (v.RueckgabePlz) params.append('rueckgabeplz', v.RueckgabePlz);
      if (v.TarifID) params.append('tarifid', v.TarifID);
      const res = await axios.get(`/api/fahrzeug/filter?${params.toString()}`);
      setCreateDialog(prev => ({ ...prev, filteredVehicles: res.data, vehicleLoading: false, vehicleError: null, page: 2 }));
    } catch (e) {
      setCreateDialog(prev => ({ ...prev, vehicleLoading: false, vehicleError: e.message || t('userReservations.errorVehicleSearch') }));
    }
  };
  const handleVehicleSelect = (fahrzeug) => setCreateDialog(prev => ({ ...prev, values: { ...prev.values, FahrzeugID: fahrzeug.FahrzeugID }, page: 3 }));

  // Reservierung speichern
  const handleCreateSave = async () => {
    setCreateError(null);
    try {
      const v = createDialog.values;
      const payload = {
        FahrzeugID: v.FahrzeugID,
        UserID: v.UserID,
        TarifID: v.TarifID,
        StartDatum: v.StartDatum ? new Date(v.StartDatum).toISOString() : null,
        EndDatum: v.EndDatum ? new Date(v.EndDatum).toISOString() : null,
        Abholort: v.Abholort,
        AbholPlz: v.AbholPlz,
        Rueckgabeort: v.Rueckgabeort,
        RueckgabePlz: v.RueckgabePlz,
        Hersteller: v.hersteller,
        Fahrzeugtyp: v.fahrzeugtyp,
        Getriebeart: v.getriebeart,
        Sitze: v.sitze
      };
      await axios.post('/api/reservierung/', payload);
      setCreateDialog({ open: false, page: 0, values: { FahrzeugID: '', TarifID: '', StartDatum: null, EndDatum: null, Abholort: '', AbholPlz: '', Rueckgabeort: '', RueckgabePlz: '', UserID: '', Vorname: '', Nachname: '' }, filteredVehicles: [], vehicleLoading: false, vehicleError: null });
      handleSelectUser(selectedUser);
    } catch (e) {
      setCreateError(e.response?.data?.error || e.message || t('userReservations.errorCreating'));
    }
  };
  const handleCreateBack = () => setCreateDialog(prev => ({ ...prev, page: Math.max(0, prev.page - 1) }));

  // --- Reservierung löschen ---
  const handleDeleteReservation = (reservation) => setDeleteDialog({ open: true, reservation });
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.reservation) return;
    try {
      await axios.delete(`/api/reservierung/${deleteDialog.reservation.ReservierungID}`);
      setDeleteDialog({ open: false, reservation: null });
      handleSelectUser(selectedUser);
    } catch (e) {
      setDeleteDialog({ open: false, reservation: null });
      setReservationError(e.message || t('userReservations.deleteError'));
    }
  };
  const handleDeleteCancel = () => setDeleteDialog({ open: false, reservation: null });

  // --- Render ---
  return (
    <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 6 }, mb: 6 }}>
      <Box
        sx={{
          background: 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)',
          borderRadius: 4,
          boxShadow: 3,
          p: { xs: 2, sm: 4 },
          mb: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: 1, textAlign: 'center' }}>
          {t('userReservations.title')}
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 600 }}>
          {t('userReservations.subtitle')}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: '100%',
            maxWidth: 500,
            mb: 2,
            justifyContent: 'center',
          }}
        >
          <TextField
            label={t('userReservations.searchFirstName')}
            value={search.vorname}
            onChange={e => setSearch(s => ({ ...s, vorname: e.target.value }))}
            variant="outlined"
            sx={{ flex: 1, background: 'white', borderRadius: 2 }}
          />
          <TextField
            label={t('userReservations.searchLastName')}
            value={search.nachname}
            onChange={e => setSearch(s => ({ ...s, nachname: e.target.value }))}
            variant="outlined"
            sx={{ flex: 1, background: 'white', borderRadius: 2 }}
          />
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            sx={{ minWidth: 120, fontWeight: 700, borderRadius: 2, boxShadow: 1 }}
          >
            {t('common.search')}
          </Button>
        </Box>
      </Box>
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', m: 3 }}><CircularProgress size={40} /></Box>}
      {userSearchError && <Alert severity="error" sx={{ mb: 2 }}>{userSearchError}</Alert>}
      {!loading && !userSearchError && <UserList users={users} onSelect={handleSelectUser} t={t} />}
      {/* --- UserCard + Reservierungen unter Userliste --- */}
      {!loading && selectedUser && (
        <Grid container spacing={4} sx={{ mt: 4 }}>
          {/* User Profil Card + Button */}
          <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 4, boxShadow: 3, p: 2, background: 'linear-gradient(120deg, #f5faff 0%, #e3f2fd 100%)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                  <Box sx={{
                    width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 36, fontWeight: 700, mb: 2
                  }}>
                    {selectedUser.Vorname?.[0]}{selectedUser.Nachname?.[0]}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5, textAlign: 'center' }}>
                    {selectedUser.Vorname} {selectedUser.Nachname}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
                    Username: {selectedUser.Username}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mb: 0.5 }}><b>UserID:</b> {selectedUser.UserID}</Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}><b>{t('userReservations.birthDate')}:</b> {selectedUser.Geburtsdatum}</Typography>
                {/* Weitere User-Infos hier ergänzen falls gewünscht */}
              </CardContent>
            </Card>
            <Button variant="contained" onClick={handleCreateOpen} fullWidth sx={{ mt: 2, fontWeight: 700 }}>
              {t('userReservations.newReservation')}
            </Button>
          </Grid>
          {/* Reservierungen Panel */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                {t('userReservations.reservations')}
              </Typography>
              {reservationError && <Alert severity="info" sx={{ mb: 2 }}>{reservationError}</Alert>}
              <Box>
                <ReservationList reservations={reservations} onEdit={handleEditOpen} onDelete={handleDeleteReservation} t={t} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      )}
      <EditReservationDialog
        open={editDialog.open}
        values={editDialog.values}
        onChange={handleEditChange}
        onClose={() => setEditDialog({ open: false, values: {} })}
        onSave={handleEditSave}
        t={t}
      />
      {/* --- Create Reservation Dialog --- */}
      <Dialog open={createDialog.open} onClose={() => setCreateDialog({ open: false, page: 0, values: { FahrzeugID: '', TarifID: '', StartDatum: null, EndDatum: null, Abholort: '', AbholPlz: '', Rueckgabeort: '', RueckgabePlz: '', UserID: '', Vorname: '', Nachname: '' }, filteredVehicles: [], vehicleLoading: false, vehicleError: null })}
        PaperProps={{ sx: { width: { xs: '95vw', sm: 500 }, maxWidth: '95vw', borderRadius: 3, p: 0 } }}>
        <DialogTitle sx={{ p: 0, background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)', color: 'white', minHeight: 64, display: 'flex', alignItems: 'center', pl: 3, fontWeight: 600, fontSize: 22, letterSpacing: 0.5 }}>
          {t('userReservations.newReservationFor')} {selectedUser?.Vorname} {selectedUser?.Nachname}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2, px: 3 }}>
          <Box sx={{ height: 16 }} />
          <Stepper activeStep={createDialog.page} alternativeLabel sx={{ mb: 3 }}>
            <Step><StepLabel>{t('userReservations.user')}</StepLabel></Step>
            <Step><StepLabel>{t('userReservations.filterVehicle')}</StepLabel></Step>
            <Step><StepLabel>{t('userReservations.selectVehicle')}</StepLabel></Step>
            <Step><StepLabel>{t('userReservations.confirmation')}</StepLabel></Step>
          </Stepper>
          {createError && <Alert severity="error" sx={{ mb: 2 }}>{createError}</Alert>}
          {/* Step 1: User Info */}
          {createDialog.page === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>1. {t('userReservations.userInformation')}</Typography>
              <Typography sx={{ mb: 2, fontSize: 15 }}><b>UserID:</b> {createDialog.values.UserID}</Typography>
              <TextField label={t('userReservations.firstName')} name="Vorname" value={createDialog.values.Vorname} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <TextField label={t('userReservations.lastName')} name="Nachname" value={createDialog.values.Nachname} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <Button variant="contained" sx={{ mt: 2, width: '100%' }} size="large" onClick={() => setCreateDialog(prev => ({ ...prev, page: 1 }))}>{t('userReservations.next')}</Button>
            </>
          )}
          {/* Step 2: Fahrzeug filtern */}
          {createDialog.page === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>2. {t('userReservations.vehicleFilter')}</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={t('userReservations.startDate') + '*'}
                  value={createDialog.values.StartDatum}
                  onChange={date => handleCreateDateChange('StartDatum', date)}
                  textField={{
                    margin: 'dense',
                    fullWidth: true,
                    required: true,
                    error: false,
                    helperText: '',
                    sx: { mb: 2 }
                  }}
                />
                <DatePicker
                  label={t('userReservations.endDate') + '*'}
                  value={createDialog.values.EndDatum}
                  onChange={date => handleCreateDateChange('EndDatum', date)}
                  textField={{
                    margin: 'dense',
                    fullWidth: true,
                    required: true,
                    error: false,
                    helperText: '',
                    sx: { mb: 2 }
                  }}
                />
              </LocalizationProvider>
              <TextField label={t('userReservations.manufacturer')} name="hersteller" value={createDialog.values.hersteller || ''} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <TextField label={t('userReservations.vehicleType')} name="fahrzeugtyp" value={createDialog.values.fahrzeugtyp || ''} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <TextField label={t('userReservations.transmission')} name="getriebeart" value={createDialog.values.getriebeart || ''} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <TextField label={t('userReservations.seats')} name="sitze" value={createDialog.values.sitze || ''} onChange={handleCreateChange} margin="dense" fullWidth sx={{ mb: 2 }} />
              <TextField label={t('userReservations.pickupLocation')} name="Abholort" value={createDialog.values.Abholort} onChange={handleCreateChange} margin="dense" fullWidth required error={false} helperText={''} sx={{ mb: 2 }} />
              <TextField label={t('userReservations.pickupPostalCode')} name="AbholPlz" value={createDialog.values.AbholPlz} onChange={handleCreateChange} margin="dense" fullWidth required error={false} helperText={''} sx={{ mb: 2 }} />
              <TextField label={t('userReservations.returnLocation')} name="Rueckgabeort" value={createDialog.values.Rueckgabeort} onChange={handleCreateChange} margin="dense" fullWidth required error={false} helperText={''} sx={{ mb: 2 }} />
              <TextField label={t('userReservations.returnPostalCode')} name="RueckgabePlz" value={createDialog.values.RueckgabePlz} onChange={handleCreateChange} margin="dense" fullWidth required error={false} helperText={''} sx={{ mb: 2 }} />
              <TextField
                select
                label={t('userReservations.tariff') + '*'}
                name="TarifID"
                value={createDialog.values.TarifID}
                onChange={handleCreateChange}
                margin="dense"
                fullWidth
                required
                error={false}
                helperText={''}
                sx={{ mb: 2 }}
              >
                {tariffs.map(tarif => (
                  <MenuItem key={tarif.TarifID} value={tarif.TarifID}>
                    {tarif.Name} (ID: {tarif.TarifID})
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" onClick={handleCreateBack}>{t('userReservations.back')}</Button>
                <Button variant="contained"
                  onClick={handleVehicleSearch}
                  disabled={
                    !createDialog.values.StartDatum ||
                    !createDialog.values.EndDatum ||
                    !createDialog.values.Abholort ||
                    !createDialog.values.AbholPlz ||
                    !createDialog.values.Rueckgabeort ||
                    !createDialog.values.RueckgabePlz ||
                    !createDialog.values.TarifID
                  }
                  sx={{ minWidth: 160 }}
                >{t('userReservations.searchVehicles')}</Button>
                {createDialog.vehicleLoading && <CircularProgress size={24} sx={{ ml: 1 }} />}
              </Box>
              {createDialog.vehicleError && <Alert severity="error" sx={{ mt: 2 }}>{createDialog.vehicleError}</Alert>}
            </>
          )}
          {/* Step 3: Fahrzeug wählen */}
          {createDialog.page === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>3. {t('userReservations.vehicleSelection')}</Typography>
              {createDialog.filteredVehicles.length === 0 ? <Typography>{t('userReservations.noVehiclesFound')}</Typography> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {createDialog.filteredVehicles.map(f => (
                    <li key={f.FahrzeugID} style={{ marginBottom: 8 }}>
                      <Button onClick={() => handleVehicleSelect(f)} sx={{ m: 0, textAlign: 'left', width: '100%', borderRadius: 2, borderWidth: 2, borderColor: 'primary.main' }} fullWidth variant="outlined">
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
                          <span style={{ fontWeight: 600, fontSize: 16 }}>{f.Hersteller} {f.Modell} <span style={{ color: '#888', fontWeight: 400 }}>(ID: {f.FahrzeugID})</span></span>
                          <span style={{ fontSize: 14 }}>{t('userReservations.seats')}: {f.Sitze} | {t('userReservations.price')}: {f.Stundenpreis} €/{t('userReservations.hour')}</span>
                        </span>
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
              <Button variant="outlined" sx={{ mt: 2 }} onClick={handleCreateBack}>{t('userReservations.back')}</Button>
            </>
          )}
          {/* Step 4: Bestätigung */}
          {createDialog.page === 3 && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: 'primary.main', letterSpacing: 0.5 }}>4. {t('userReservations.confirmationStep')}</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography sx={{ mb: 1 }}><b>UserID:</b> {createDialog.values.UserID}</Typography>
                <Typography sx={{ mb: 1 }}><b>{t('userReservations.firstName')}:</b> {createDialog.values.Vorname}</Typography>
                <Typography sx={{ mb: 1 }}><b>{t('userReservations.lastName')}:</b> {createDialog.values.Nachname}</Typography>
                <Typography sx={{ mb: 1 }}><b>{t('userReservations.vehicleId')}:</b> {createDialog.values.FahrzeugID}</Typography>
                <Typography sx={{ mb: 1 }}><b>{t('userReservations.start')}:</b> {createDialog.values.StartDatum ? new Date(createDialog.values.StartDatum).toLocaleString() : ''}</Typography>
                <Typography sx={{ mb: 1 }}><b>{t('userReservations.end')}:</b> {createDialog.values.EndDatum ? new Date(createDialog.values.EndDatum).toLocaleString() : ''}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleCreateBack}>{t('userReservations.back')}</Button>
                <Button variant="contained" onClick={handleCreateSave} sx={{ minWidth: 180 }}>{t('userReservations.createReservation')}</Button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
      {/* --- Delete Reservation Dialog --- */}
      <Dialog open={deleteDialog.open} onClose={handleDeleteCancel}
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>{t('userReservations.deleteReservation')}</DialogTitle>
        <DialogContent>
          <Typography>{t('userReservations.deleteConfirmation')}</Typography>
          <Typography sx={{ mt: 2, fontWeight: 700 }}>
            ID: {deleteDialog.reservation?.ReservierungID}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t('common.cancel')}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">{t('common.delete')}</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
