import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAllVehicles, updateVehicle, getVehicleLocation } from '../api/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Container, Grid, Paper, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress, Box
} from '@mui/material';

export default function VehicleManagement() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState([]);
    const [vehicleEdits, setVehicleEdits] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [locations, setLocations] = useState({});

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
        setLoading(true);
        getAllVehicles()
            .then(async res => {
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
            })
            .catch(() => setError('Fahrzeuge konnten nicht geladen werden.'))
            .finally(() => setLoading(false));
    }, []);

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

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Linke Seite: Fahrzeugliste */}
            <Box sx={{ flex: 2, overflowY: 'auto', p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>Fahrzeugverwaltung</Typography>
                {error && <Typography color="error">{error}</Typography>}
                <Grid container spacing={2}>
                    {vehicles.map(vehicle => {
                        const edit = vehicleEdits[vehicle.FahrzeugID] || {};
                        return (
                            <Grid item size={9} xs={12} md={6} key={vehicle.FahrzeugID}>
                                <Paper sx={{ p: 2 }}>
                                    <Typography variant="h6">{`${vehicle.Hersteller} ${vehicle.ModellName} (${vehicle.Kennzeichen})`}</Typography>
                                    <TextField
                                        label="Basispreis"
                                        value={edit.Stundenpreis ?? vehicle.Stundenpreis}
                                        onChange={e => handleEditChange(vehicle.FahrzeugID, 'Stundenpreis', e.target.value)}
                                        fullWidth sx={{ mt: 1 }}
                                        type="number"
                                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                    />
                                    <div className='flex flex-row justify-between'>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={edit.Aktiv ?? vehicle.Aktiv}
                                                    onChange={e => handleEditChange(vehicle.FahrzeugID, 'Aktiv', e.target.checked)}
                                                    color="primary"
                                                />
                                            }
                                            label={edit.Aktiv ?? vehicle.Aktiv ? "Verfügbar" : "Nicht verfügbar"}
                                            sx={{ mt: 1 }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={() => handleSave(vehicle.FahrzeugID)}
                                            disabled={saving}
                                        >
                                            Speichern
                                        </Button>
                                    </div>
                                </Paper>
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
        </Box>
    );
}