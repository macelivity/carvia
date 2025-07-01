import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllVehicles, updateVehicle, getVehicleLocation } from '../api/api';
import API from '../api/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Container, Grid, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';

const initialNewVehicle = {
    Kennzeichen: '',
    Reperaturzustand: '',
    Aktiv: true,
    Reifen: '',
    Kilometerstand: '',
    LetzterService: '',
    TuevDatum: '',
    ErstzulassungsDatum: '',
    // Modellfelder:
    ModellName: '',
    Hersteller: '',
    Fahrzeugtyp: '',
    Getriebeart: '',
    Sitze: '',
    Türen: '',
    Kraftstoffart: '',
    Leistung: '',
    Stundenpreis: '',
    Kofferraumvolumen: ''
};

const REPARATURZUSTAND_OPTIONS = [
  "Sehr gut", "Gut", "Befriedigend", "Ausreichend", "Mangelhaft"
];
const REIFEN_OPTIONS = [
  "Sommerreifen", "Winterreifen", "Allwetterreifen"
];
const GETRIEBEART_OPTIONS = [
  "Manuell", "Automatik"
];
const KRAFTSTOFFART_OPTIONS = [
  "Benzin", "Benzin (E10 tauglich)", "Diesel", "Elektro", "Hybrid (Diesel)", "Hybrid (Benzin)"
];
const TUEREN_OPTIONS = [
  "2/3", "4/5", "6/7"
];

export default function VehicleManagement() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [vehicleEdits, setVehicleEdits] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState({});
    const [addOpen, setAddOpen] = useState(false);
    const [newVehicle, setNewVehicle] = useState(initialNewVehicle);
    const [addError, setAddError] = useState('');
    const [addLoading, setAddLoading] = useState(false);

    // Zugriffsschutz
    if (!user || user.role !== 'Mitarbeiter') {
        return (
            <Container sx={{ mt: 6 }}>
                <Typography variant="h5" color="error" align="center">
                    Zugriff verweigert. Diese Seite ist nur für Mitarbeiter sichtbar.
                </Typography>
            </Container>
        );
    }

    // Fahrzeuge laden
    useEffect(() => {
        fetchVehicles();
        // eslint-disable-next-line
    }, []);

    const fetchVehicles = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getAllVehicles();
            setVehicles(res.data);
            // Lade alle aktuellen Positionen
            const locs = {};
            await Promise.all(res.data.map(async v => {
                try {
                    const locRes = await getVehicleLocation(v.FahrzeugID);
                    if (locRes.data && locRes.data.latitude && locRes.data.longitude) {
                        locs[v.FahrzeugID] = {
                            lat: locRes.data.latitude,
                            lon: locRes.data.longitude
                        };
                    }
                } catch { /* Fehler ignorieren, falls keine Position */ }
            }));
            setLocations(locs);
        } catch {
            setError('Fahrzeuge konnten nicht geladen werden.');
        }
        setLoading(false);
    };

    // Änderungen im Edit-Objekt speichern
    const handleEditChange = (id, field, value) => {
        setVehicleEdits(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    // Fahrzeug speichern
    const handleSave = async (id) => {
        setSaving(true);
        const edit = vehicleEdits[id];
        try {
            await updateVehicle(id, edit);
            setVehicles(vehicles =>
                vehicles.map(v => v.FahrzeugID === id ? { ...v, ...edit } : v)
            );
            setVehicleEdits(edits => {
                const { [id]: _, ...rest } = edits;
                return rest;
            });
        } catch {
            setError('Fehler beim Speichern.');
            window.alert('Fehler beim Speichern des Fahrzeugs.\nBitte versuchen Sie es später erneut.');
        }
        setSaving(false);
    };

    // Fahrzeug löschen
    const handleDelete = async (id) => {
        if (!window.confirm('Fahrzeug wirklich aus dem Pool entfernen?')) return;
        try {
            await API.delete(`/fahrzeug/${id}`);
            setVehicles(vehicles => vehicles.filter(v => v.FahrzeugID !== id));
        } catch {
            window.alert('Fehler beim Entfernen des Fahrzeugs.');
        }
    };

    // Dialog für neues Fahrzeug
    const handleAddOpen = () => {
        setNewVehicle(initialNewVehicle);
        setAddError('');
        setAddOpen(true);
    };
    const handleAddClose = () => setAddOpen(false);

    // Validierung für neues Fahrzeug
    const isValidNewVehicle = () => {
        // Fahrzeugfelder
        if (!newVehicle.Kennzeichen || newVehicle.Kennzeichen.length < 3) return false;
        if (!newVehicle.Reperaturzustand) return false;
        if (!newVehicle.Reifen) return false;
        if (!newVehicle.Kilometerstand || isNaN(Number(newVehicle.Kilometerstand))) return false;
        if (!newVehicle.LetzterService || !/^\d{4}-\d{2}-\d{2}$/.test(newVehicle.LetzterService)) return false;
        if (!newVehicle.TuevDatum || !/^\d{4}-\d{2}$/.test(newVehicle.TuevDatum)) return false;
        if (!newVehicle.ErstzulassungsDatum || !/^\d{4}-\d{2}-\d{2}$/.test(newVehicle.ErstzulassungsDatum)) return false;
        // Modellfelder
        if (!newVehicle.ModellName) return false;
        if (!newVehicle.Hersteller) return false;
        if (!newVehicle.Fahrzeugtyp) return false;
        if (!newVehicle.Getriebeart) return false;
        if (!newVehicle.Sitze || isNaN(Number(newVehicle.Sitze))) return false;
        if (!newVehicle.Türen) return false;
        if (!newVehicle.Kraftstoffart) return false;
        if (!newVehicle.Leistung || isNaN(Number(newVehicle.Leistung))) return false;
        if (!newVehicle.Stundenpreis || isNaN(Number(newVehicle.Stundenpreis))) return false;
        if (!newVehicle.Kofferraumvolumen || isNaN(Number(newVehicle.Kofferraumvolumen))) return false;
        return true;
    };

    // Neues Fahrzeug speichern (erst Modell, dann Fahrzeug)
    const handleAddVehicle = async () => {
        setAddError('');
        if (!isValidNewVehicle()) {
            setAddError('Bitte alle Felder korrekt ausfüllen.');
            return;
        }
        setAddLoading(true);
        try {
            // 1. Modell anlegen oder finden
            const modellPayload = {
                ModellName: newVehicle.ModellName,
                Hersteller: newVehicle.Hersteller,
                Fahrzeugtyp: newVehicle.Fahrzeugtyp,
                Getriebeart: newVehicle.Getriebeart,
                Sitze: Number(newVehicle.Sitze),
                Türen: Number(newVehicle.Türen),
                Kraftstoffart: newVehicle.Kraftstoffart,
                Leistung: Number(newVehicle.Leistung),
                Stundenpreis: Number(newVehicle.Stundenpreis),
                Kofferraumvolumen: Number(newVehicle.Kofferraumvolumen)
            };
            const modellRes = await API.post('/modell', modellPayload);
            const modellId = modellRes.data.id;

            // 2. Fahrzeug anlegen
            await API.post('/fahrzeug/', {
                ModellID: modellId,
                Kennzeichen: newVehicle.Kennzeichen,
                Reperaturzustand: newVehicle.Reperaturzustand,
                Aktiv: !!newVehicle.Aktiv,
                Reifen: newVehicle.Reifen,
                Kilometerstand: Number(newVehicle.Kilometerstand),
                LetzterService: newVehicle.LetzterService,
                TuevDatum: newVehicle.TuevDatum,
                ErstzulassungsDatum: newVehicle.ErstzulassungsDatum
            });
            setAddOpen(false);
            fetchVehicles();
        } catch (err) {
            setAddError('Fehler beim Hinzufügen. Prüfe die Eingaben und versuche es erneut.');
        }
        setAddLoading(false);
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Linke Seite: Fahrzeugliste */}
            <Box sx={{ flex: 2, overflowY: 'auto', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4">Fahrzeugverwaltung</Typography>
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={handleAddOpen}
                    >
                        Fahrzeug hinzufügen
                    </Button>
                </Box>
                {error && <Typography color="error">{error}</Typography>}
                <Grid container spacing={2}>
                    {vehicles.map(vehicle => {
                        const edit = vehicleEdits[vehicle.FahrzeugID] || {};
                        return (
                            <Grid item xs={12} key={vehicle.FahrzeugID} size={12}>
                                <Accordion>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        aria-controls={`panel-${vehicle.FahrzeugID}-content`}
                                        id={`panel-${vehicle.FahrzeugID}-header`}
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <Typography variant="h6">
                                                {`${vehicle.Hersteller} ${vehicle.ModellName} (${vehicle.Kennzeichen})`}
                                            </Typography>
                                            <IconButton color="error" onClick={e => { e.stopPropagation(); handleDelete(vehicle.FahrzeugID); }}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <TextField
                                            label="Basispreis"
                                            value={edit.Stundenpreis ?? vehicle.Stundenpreis}
                                            onChange={e => handleEditChange(vehicle.FahrzeugID, 'Stundenpreis', e.target.value)}
                                            fullWidth sx={{ mt: 1 }}
                                            type="number"
                                            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                        />
                                        <TextField
                                            label="Kilometerstand"
                                            value={edit.Kilometerstand ?? vehicle.Kilometerstand}
                                            onChange={e => handleEditChange(vehicle.FahrzeugID, 'Kilometerstand', e.target.value)}
                                            fullWidth sx={{ mt: 1 }}
                                            type="number"
                                            InputProps={{ inputProps: { min: 0 } }}
                                        />
                                        <FormControl fullWidth sx={{ mt: 1 }}>
                                            <InputLabel>Reparaturzustand</InputLabel>
                                            <Select
                                              label="Reparaturzustand"
                                              value={edit.Reperaturzustand ?? vehicle.Reperaturzustand}
                                              onChange={e => handleEditChange(vehicle.FahrzeugID, 'Reperaturzustand', e.target.value)}
                                            >
                                              {REPARATURZUSTAND_OPTIONS.map(opt => (
                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                              ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth sx={{ mt: 1 }}>
                                            <InputLabel>Reifen</InputLabel>
                                            <Select
                                              label="Reifen"
                                              value={edit.Reifen ?? vehicle.Reifen}
                                              onChange={e => handleEditChange(vehicle.FahrzeugID, 'Reifen', e.target.value)}
                                            >
                                              {REIFEN_OPTIONS.map(opt => (
                                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                              ))}
                                            </Select>
                                        </FormControl>
                                        <DatePicker
                                            label="Letzter Service"
                                            value={edit.LetzterService ? new Date(edit.LetzterService) : (vehicle.LetzterService ? new Date(vehicle.LetzterService) : null)}
                                            onChange={date => handleEditChange(vehicle.FahrzeugID, 'LetzterService', date ? date.toISOString().slice(0, 10) : '')}
                                            format="yyyy-MM-dd"
                                            slotProps={{ textField: { fullWidth: true, sx: { mt: 1 } } }}
                                        />
                                        <DatePicker
                                            label="Letzter TÜV"
                                            views={['year', 'month']}
                                            value={edit.TuevDatum ? new Date(edit.TuevDatum + '-01') : (vehicle.TuevDatum ? new Date(vehicle.TuevDatum + '-01') : null)}
                                            onChange={date => handleEditChange(vehicle.FahrzeugID, 'TuevDatum', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                                            format="yyyy-MM"
                                            slotProps={{ textField: { fullWidth: true, sx: { mt: 1 } } }}
                                        />
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={edit.Aktiv ?? vehicle.Aktiv}
                                                        onChange={e => handleEditChange(vehicle.FahrzeugID, 'Aktiv', e.target.checked)}
                                                        color="primary"
                                                    />
                                                }
                                                label={edit.Aktiv ?? vehicle.Aktiv ? "Verfügbar" : "Nicht verfügbar"}
                                            />
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={() => handleSave(vehicle.FahrzeugID)}
                                                disabled={saving || Object.keys(vehicleEdits).length === 0}
                                            >
                                                Speichern
                                            </Button>
                                        </Box>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>
            {/* Rechte Seite: Karte */}
            <Box sx={{ flex: 1, minWidth: 320, height: '100vh', position: 'sticky', top: 0 }}>
                <MapContainer
                    center={[53.0793, 8.8017]}
                    zoom={8}
                    scrollWheelZoom
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {vehicles.map(v => {
                        const loc = locations[v.FahrzeugID];
                        if (!loc) return null;
                        return (
                            <Marker
                                key={v.FahrzeugID}
                                position={[loc.lat, loc.lon]}
                                icon={L.icon({
                                    iconUrl: '/icons/car-marker.svg',
                                    iconSize: [48, 48],
                                    iconAnchor: [24, 36]
                                })}
                            >
                                <Popup>
                                    <b>{v.ModellName}</b><br />
                                    {v.Kennzeichen}<br />
                                    {v.Hersteller}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </Box>
            {/* Dialog für neues Fahrzeug */}
            <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
                <DialogTitle>Neues Fahrzeug</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Modell</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} size={5}>
                            <TextField label="Hersteller" value={newVehicle.Hersteller}
                                onChange={e => setNewVehicle(v => ({ ...v, Hersteller: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={7}>
                            <TextField label="Name" value={newVehicle.ModellName}
                                onChange={e => setNewVehicle(v => ({ ...v, ModellName: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField label="Fahrzeugtyp" value={newVehicle.Fahrzeugtyp}
                                onChange={e => setNewVehicle(v => ({ ...v, Fahrzeugtyp: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>Getriebeart</InputLabel>
                                <Select
                                    label="Getriebeart"
                                    value={newVehicle.Getriebeart}
                                    onChange={e => setNewVehicle(v => ({ ...v, Getriebeart: e.target.value }))}
                                >
                                {GETRIEBEART_OPTIONS.map(opt => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={6}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>Kraftstoffart</InputLabel>
                                <Select
                                    label="Kraftstoffart"
                                    value={newVehicle.Kraftstoffart}
                                    onChange={e => setNewVehicle(v => ({ ...v, Kraftstoffart: e.target.value }))}
                                >
                                    {KRAFTSTOFFART_OPTIONS.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={4}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>Türen</InputLabel>
                                <Select
                                    label="Türen"
                                    value={newVehicle.Türen}
                                    onChange={e => setNewVehicle(v => ({ ...v, Türen: e.target.value }))}
                                >
                                    {TUEREN_OPTIONS.map(opt => (
                                    <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={4} alignContent={'end'}>
                            <TextField label="Sitze" type="number" value={newVehicle.Sitze}
                                onChange={e => setNewVehicle(v => ({ ...v, Sitze: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4} alignContent={'end'}>
                            <TextField label="Kofferraumvolumen (Liter)" type="number" value={newVehicle.Kofferraumvolumen}
                                onChange={e => setNewVehicle(v => ({ ...v, Kofferraumvolumen: e.target.value }))} required fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <TextField label="Leistung (PS)" type="number" value={newVehicle.Leistung}
                                onChange={e => setNewVehicle(v => ({ ...v, Leistung: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <TextField label="Stundenpreis (€)" type="number" value={newVehicle.Stundenpreis}
                                onChange={e => setNewVehicle(v => ({ ...v, Stundenpreis: e.target.value }))} required fullWidth />
                        </Grid>
                    </Grid>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Fahrzeug</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField
                                label="Kennzeichen"
                                value={newVehicle.Kennzeichen}
                                onChange={e => setNewVehicle(v => ({ ...v, Kennzeichen: e.target.value }))}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Reparaturzustand</InputLabel>
                                <Select
                                    label="Reparaturzustand"
                                    value={newVehicle.Reperaturzustand}
                                    onChange={e => setNewVehicle(v => ({ ...v, Reperaturzustand: e.target.value }))}
                                >
                                    {REPARATURZUSTAND_OPTIONS.map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth required>
                                <InputLabel>Reifen</InputLabel>
                                <Select
                                    label="Reifen"
                                    value={newVehicle.Reifen}
                                    onChange={e => setNewVehicle(v => ({ ...v, Reifen: e.target.value }))}
                                >
                                    {REIFEN_OPTIONS.map(opt => (
                                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField
                                label="Kilometerstand"
                                value={newVehicle.Kilometerstand}
                                onChange={e => setNewVehicle(v => ({ ...v, Kilometerstand: e.target.value }))}
                                required
                                fullWidth
                                type="number"
                                inputProps={{ min: 0 }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4}>
                            <DatePicker
                                label="Erstzulassung"
                                value={newVehicle.ErstzulassungsDatum ? new Date(newVehicle.ErstzulassungsDatum) : null}
                                onChange={date => setNewVehicle(v => ({ ...v, ErstzulassungsDatum: date ? date.toISOString().slice(0, 10) : '' }))
                                }
                                format="yyyy-MM-dd"
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4}>
                            <DatePicker
                                label="Letzter TÜV"
                                views={['year', 'month']}
                                value={newVehicle.TuevDatum ? new Date(newVehicle.TuevDatum + '-01') : null}
                                onChange={date => setNewVehicle(v => ({
                                    ...v,
                                    TuevDatum: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : ''
                                }))}
                                format="yyyy-MM"
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4}>
                            <DatePicker
                                label="Letzter Service"
                                value={newVehicle.LetzterService ? new Date(newVehicle.LetzterService) : null}
                                onChange={date => setNewVehicle(v => ({ ...v, LetzterService: date ? date.toISOString().slice(0, 10) : '' }))
                                }
                                format="yyyy-MM-dd"
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!newVehicle.Aktiv}
                                        onChange={e => setNewVehicle(v => ({ ...v, Aktiv: e.target.checked }))}
                                        color="primary"
                                    />
                                }
                                label={newVehicle.Aktiv ? "Verfügbar" : "Nicht verfügbar"}
                            />
                        </Grid>
                    </Grid>
                    {addError && <Typography color="error" sx={{ mt: 2 }}>{addError}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} color="secondary">Abbrechen</Button>
                    <Button
                        onClick={handleAddVehicle}
                        color="primary"
                        variant="contained"
                        disabled={!isValidNewVehicle() || addLoading}
                    >
                        Hinzufügen
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
        </LocalizationProvider>
    );
}