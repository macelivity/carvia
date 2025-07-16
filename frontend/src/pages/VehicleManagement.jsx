/**
 * Fahrzeugverwaltungsseite - Administrative Verwaltung aller Fahrzeuge
 * Ermöglicht das Erstellen, Bearbeiten und Verwalten von Fahrzeugen und Schäden
 * Nur für Administratoren und Mitarbeiter zugänglich
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getAllVehicles, updateVehicle, getVehicleLocation, getAllDamages, createDamage, updateDamage, deleteDamage, deleteVehicle, createModell, createVehicle } from '../api/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
    Container, Grid, Typography, TextField, Button, Switch, FormControlLabel, CircularProgress, Box,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, MenuItem, Select, InputLabel, FormControl,
    Card, Avatar, Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EditIcon from '@mui/icons-material/Edit';
import BuildIcon from '@mui/icons-material/Build';
import WarningIcon from '@mui/icons-material/Warning';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import de from 'date-fns/locale/de';

// Standardwerte für neues Fahrzeug
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

// Vordefinierte Optionen für Dropdown-Menüs
const REPARATURZUSTAND_OPTIONS = [
  "Sehr gut", "Gut", "Befriedigend", "Ausreichend", "Mangelhaft"
];
const REIFEN_OPTIONS = [
  "Sommer", "Winter", "Ganzjahr"
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
    const { t } = useTranslation();

    // Localized option arrays
    const getRepairStatusOptions = () => [
        { value: "Sehr gut", label: t('vehicleManagement.veryGood') },
        { value: "Gut", label: t('vehicleManagement.good') },
        { value: "Befriedigend", label: t('vehicleManagement.satisfactory') },
        { value: "Ausreichend", label: t('vehicleManagement.sufficient') },
        { value: "Mangelhaft", label: t('vehicleManagement.deficient') }
    ];

    const getTireOptions = () => [
        { value: "Sommer", label: t('vehicleManagement.summerTires') },
        { value: "Winter", label: t('vehicleManagement.winterTires') },
        { value: "Ganzjahr", label: t('vehicleManagement.allSeasonTires') }
    ];

    const getTransmissionOptions = () => [
        { value: "Manuell", label: t('vehicleManagement.manual') },
        { value: "Automatik", label: t('vehicleManagement.automatic') }
    ];

    const getFuelTypeOptions = () => [
        { value: "Benzin", label: t('vehicleManagement.gasoline') },
        { value: "Benzin (E10 tauglich)", label: t('vehicleManagement.gasolineE10') },
        { value: "Diesel", label: t('vehicleManagement.diesel') },
        { value: "Elektro", label: t('vehicleManagement.electric') },
        { value: "Hybrid (Diesel)", label: t('vehicleManagement.hybridDiesel') },
        { value: "Hybrid (Benzin)", label: t('vehicleManagement.hybridGasoline') }
    ];

    const getDoorsOptions = () => [
        { value: "2/3", label: t('vehicleManagement.doors23') },
        { value: "4/5", label: t('vehicleManagement.doors45') },
        { value: "6/7", label: t('vehicleManagement.doors67') }
    ];
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

    // Damage management state
    const [damageDialogOpen, setDamageDialogOpen] = useState(false);
    const [selectedVehicleId, setSelectedVehicleId] = useState(null);
    const [vehicleDamages, setVehicleDamages] = useState({});
    const [newDamage, setNewDamage] = useState({ Beschreibung: '' });
    const [editingDamage, setEditingDamage] = useState(null);
    const [damageLoading, setDamageLoading] = useState(false);

    // Zugriffsschutz
    if (!user || user.role !== 'Mitarbeiter') {
        return (
            <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 6 }, mb: 6 }}>
                <Box
                    sx={{
                        background: 'linear-gradient(120deg, #ffebee 0%, #ffcdd2 100%)',
                        borderRadius: 4,
                        boxShadow: 3,
                        p: { xs: 2, sm: 4 },
                        textAlign: 'center',
                    }}
                >
                    <Avatar sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 3,
                        background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)'
                    }}>
                        🚫
                    </Avatar>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#d32f2f', mb: 2 }}>
                        {t('vehicleManagement.accessDenied')}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                        You don't have permission to access this page.
                    </Typography>
                </Box>
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
            setError(t('vehicleManagement.errorLoading'));
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
            setError(t('vehicleManagement.errorSaving'));
            window.alert(t('vehicleManagement.errorSavingDetailed'));
        }
        setSaving(false);
    };

    // Fahrzeug löschen
    const handleDelete = async (id) => {
        if (!window.confirm(t('vehicleManagement.deleteConfirmation'))) return;
        try {
            await deleteVehicle(id);
            setVehicles(vehicles => vehicles.filter(v => v.FahrzeugID !== id));
        } catch {
            window.alert(t('vehicleManagement.errorDeleting'));
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
            setAddError(t('vehicleManagement.fillAllFields'));
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
            const modellRes = await createModell(modellPayload);
            const modellId = modellRes.data.id;

            // 2. Fahrzeug anlegen
            await createVehicle({
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
            setAddError(t('vehicleManagement.errorAdding'));
        }
        setAddLoading(false);
    };

    // Damage management functions
    const fetchVehicleDamages = async (vehicleId) => {
        try {
            const response = await getAllDamages();
            const damages = response.data.filter(damage => damage.FahrzeugID === vehicleId);
            setVehicleDamages(prev => ({ ...prev, [vehicleId]: damages }));
        } catch (error) {
            // Fehler beim Laden der Schäden - stillschweigend behandeln
        }
    };

    const handleDamageDialogOpen = (vehicleId) => {
        setSelectedVehicleId(vehicleId);
        setDamageDialogOpen(true);
        fetchVehicleDamages(vehicleId);
    };

    const handleDamageDialogClose = () => {
        setDamageDialogOpen(false);
        setSelectedVehicleId(null);
        setNewDamage({ Beschreibung: '' });
        setEditingDamage(null);
    };

    const handleCreateDamage = async () => {
        if (!newDamage.Beschreibung.trim()) return;
        
        setDamageLoading(true);
        try {
            await createDamage({
                FahrzeugID: selectedVehicleId,
                Beschreibung: newDamage.Beschreibung
            });
            setNewDamage({ Beschreibung: '' });
            fetchVehicleDamages(selectedVehicleId);
        } catch (error) {
            // Fehler beim Erstellen des Schadens - stillschweigend behandeln
        }
        setDamageLoading(false);
    };

    const handleUpdateDamage = async () => {
        if (!editingDamage || !editingDamage.Beschreibung.trim()) return;
        
        setDamageLoading(true);
        try {
            await updateDamage(editingDamage.SchadenID, {
                FahrzeugID: selectedVehicleId,
                Beschreibung: editingDamage.Beschreibung
            });
            setEditingDamage(null);
            fetchVehicleDamages(selectedVehicleId);
        } catch (error) {
            // Fehler beim Aktualisieren des Schadens - stillschweigend behandeln
        }
        setDamageLoading(false);
    };

    const handleDeleteDamage = async (damageId) => {
        if (!window.confirm(t('vehicleManagement.confirmDeleteDamage'))) return;
        
        setDamageLoading(true);
        try {
            await deleteDamage(damageId);
            fetchVehicleDamages(selectedVehicleId);
        } catch (error) {
            // Fehler beim Löschen des Schadens - stillschweigend behandeln
        }
        setDamageLoading(false);
    };

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ mt: { xs: 2, sm: 6 }, mb: 6 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        {t('vehicleManagement.loading')}
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
            <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                py: 4
            }}>
                <Container maxWidth="xl">
                    {/* Hero Section */}
                    <Box
                        sx={{
                            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                            borderRadius: 4,
                            boxShadow: 4,
                            p: { xs: 2, sm: 4 },
                            mb: 4,
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                            <Avatar sx={{ 
                                width: 80, 
                                height: 80, 
                                mr: 3,
                                background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
                            }}>
                                <DirectionsCarIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 0.5, letterSpacing: 1 }}>
                                    {t('vehicleManagement.title')}
                                </Typography>
                                <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                                    {t('vehicleManagement.subtitle')}
                                </Typography>
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<AddIcon />}
                            onClick={handleAddOpen}
                            sx={{
                                py: 2,
                                px: 4,
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('vehicleManagement.addVehicle')}
                        </Button>
                    </Box>

                    {/* Abstandselement zwischen Header und Inhalt */}
                    <Box sx={{ height: '32px' }} />

                    <Box sx={{ display: 'flex', gap: 4, height: 'calc(100vh - 200px)' }}>
                        {/* Vehicle List Section */}
                        <Box sx={{ 
                            flex: 2, 
                            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                            borderRadius: 4,
                            boxShadow: 4,
                            p: 3,
                            overflowY: 'auto'
                        }}>
                            {error && (
                                <Box
                                    sx={{
                                        background: 'linear-gradient(120deg, #ffebee 0%, #ffcdd2 100%)',
                                        borderRadius: 3,
                                        p: 2,
                                        mb: 3,
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography color="error" sx={{ fontWeight: 600 }}>{error}</Typography>
                                </Box>
                            )}
                            <Grid container spacing={3}>
                                {vehicles.map(vehicle => {
                                    const edit = vehicleEdits[vehicle.FahrzeugID] || {};
                                    return (
                                        <Grid item xs={12} key={vehicle.FahrzeugID}>
                                            <Card 
                                                sx={{ 
                                                    borderRadius: 3,
                                                    boxShadow: 2,
                                                    mt: 3, // Oberen Abstand hinzufügen für bessere Optik
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        boxShadow: 6,
                                                        transform: 'translateY(-2px)'
                                                    }
                                                }}
                                            >
                                                <Accordion>
                                                    <AccordionSummary
                                                        expandIcon={<ExpandMoreIcon />}
                                                        aria-controls={`panel-${vehicle.FahrzeugID}-content`}
                                                        id={`panel-${vehicle.FahrzeugID}-header`}
                                                        sx={{
                                                            background: 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
                                                            borderRadius: '12px 12px 0 0',
                                                            '&.Mui-expanded': {
                                                                borderRadius: 0
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Avatar sx={{ 
                                                                    width: 48, 
                                                                    height: 48, 
                                                                    mr: 2,
                                                                    background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                                                                    fontSize: 20
                                                                }}>
                                                                    <DirectionsCarIcon />
                                                                </Avatar>
                                                                <Box>
                                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                        {`${vehicle.Hersteller} ${vehicle.ModellName}`}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                                        {vehicle.Kennzeichen} • {vehicle.Aktiv ? t('vehicleManagement.available') : t('vehicleManagement.unavailable')}
                                                                    </Typography>
                                                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                                                                        TÜV: {vehicle.TuevDatum || 'Nicht angegeben'} • {vehicle.Reifen || 'Unbekannt'} • {vehicle.Kilometerstand ? `${vehicle.Kilometerstand.toLocaleString()} km` : 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                            <IconButton 
                                                                color="error" 
                                                                onClick={e => { e.stopPropagation(); handleDelete(vehicle.FahrzeugID); }}
                                                                sx={{
                                                                    background: 'rgba(211, 47, 47, 0.1)',
                                                                    '&:hover': {
                                                                        background: 'rgba(211, 47, 47, 0.2)'
                                                                    }
                                                                }}
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </AccordionSummary>
                                                    <AccordionDetails sx={{ p: 3 }}>
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={12} md={6}>
                                                                <TextField
                                                                    label={t('vehicleManagement.basePrice')}
                                                                    value={edit.Stundenpreis ?? vehicle.Stundenpreis}
                                                                    onChange={e => handleEditChange(vehicle.FahrzeugID, 'Stundenpreis', e.target.value)}
                                                                    fullWidth
                                                                    type="number"
                                                                    InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                                                                    sx={{ 
                                                                        '& .MuiOutlinedInput-root': { 
                                                                            borderRadius: 2,
                                                                            background: 'white'
                                                                        }
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <TextField
                                                                    label={t('vehicleManagement.mileage')}
                                                                    value={edit.Kilometerstand ?? vehicle.Kilometerstand}
                                                                    onChange={e => handleEditChange(vehicle.FahrzeugID, 'Kilometerstand', e.target.value)}
                                                                    fullWidth
                                                                    type="number"
                                                                    InputProps={{ inputProps: { min: 0 } }}
                                                                    sx={{ 
                                                                        '& .MuiOutlinedInput-root': { 
                                                                            borderRadius: 2,
                                                                            background: 'white'
                                                                        }
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>{t('vehicleManagement.repairStatus')}</InputLabel>
                                                                    <Select
                                                                        label={t('vehicleManagement.repairStatus')}
                                                                        value={edit.Reperaturzustand ?? vehicle.Reperaturzustand}
                                                                        onChange={e => handleEditChange(vehicle.FahrzeugID, 'Reperaturzustand', e.target.value)}
                                                                        sx={{ 
                                                                            borderRadius: 2,
                                                                            background: 'white'
                                                                        }}
                                                                    >
                                                                        {getRepairStatusOptions().map(opt => (
                                                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <FormControl fullWidth>
                                                                    <InputLabel>{t('vehicleManagement.tires')}</InputLabel>
                                                                    <Select
                                                                        label={t('vehicleManagement.tires')}
                                                                        value={edit.Reifen ?? vehicle.Reifen}
                                                                        onChange={e => handleEditChange(vehicle.FahrzeugID, 'Reifen', e.target.value)}
                                                                        sx={{ 
                                                                            borderRadius: 2,
                                                                            background: 'white'
                                                                        }}
                                                                    >
                                                                        {getTireOptions().map(opt => (
                                                                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </FormControl>
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <DatePicker
                                                                    label={t('vehicleManagement.lastService')}
                                                                    value={edit.LetzterService ? new Date(edit.LetzterService) : (vehicle.LetzterService ? new Date(vehicle.LetzterService) : null)}
                                                                    onChange={date => handleEditChange(vehicle.FahrzeugID, 'LetzterService', date ? date.toISOString().slice(0, 10) : '')}
                                                                    format="yyyy-MM-dd"
                                                                    slotProps={{ 
                                                                        textField: { 
                                                                            fullWidth: true,
                                                                            sx: { 
                                                                                '& .MuiOutlinedInput-root': { 
                                                                                    borderRadius: 2,
                                                                                    background: 'white'
                                                                                }
                                                                            }
                                                                        } 
                                                                    }}
                                                                />
                                                            </Grid>
                                                            <Grid item xs={12} md={6}>
                                                                <DatePicker
                                                                    label={t('vehicleManagement.lastTuev')}
                                                                    views={['year', 'month']}
                                                                    value={edit.TuevDatum ? new Date(edit.TuevDatum + '-01') : (vehicle.TuevDatum ? new Date(vehicle.TuevDatum.length === 7 ? vehicle.TuevDatum + '-01' : vehicle.TuevDatum) : null)}
                                                                    onChange={date => handleEditChange(vehicle.FahrzeugID, 'TuevDatum', date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}` : '')}
                                                                    format="yyyy-MM"
                                                                    slotProps={{ 
                                                                        textField: { 
                                                                            fullWidth: true,
                                                                            sx: { 
                                                                                '& .MuiOutlinedInput-root': { 
                                                                                    borderRadius: 2,
                                                                                    background: 'white'
                                                                                }
                                                                            }
                                                                        } 
                                                                    }}
                                                                />
                                                            </Grid>
                                                        </Grid>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Switch
                                                                        checked={edit.Aktiv ?? vehicle.Aktiv}
                                                                        onChange={e => handleEditChange(vehicle.FahrzeugID, 'Aktiv', e.target.checked)}
                                                                        color="primary"
                                                                    />
                                                                }
                                                                label={edit.Aktiv ?? vehicle.Aktiv ? t('vehicleManagement.available') : t('vehicleManagement.unavailable')}
                                                                sx={{ 
                                                                    '& .MuiFormControlLabel-label': {
                                                                        fontWeight: 600
                                                                    }
                                                                }}
                                                            />
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button
                                                                    variant="outlined"
                                                                    onClick={() => handleDamageDialogOpen(vehicle.FahrzeugID)}
                                                                    startIcon={<BuildIcon />}
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        borderRadius: 2,
                                                                        borderColor: 'warning.main',
                                                                        color: 'warning.main',
                                                                        '&:hover': {
                                                                            borderColor: 'warning.dark',
                                                                            backgroundColor: 'warning.light',
                                                                            color: 'warning.dark'
                                                                        }
                                                                    }}
                                                                >
                                                                    {t('vehicleManagement.manageDamages')}
                                                                </Button>
                                                                <Button
                                                                    variant="contained"
                                                                    onClick={() => handleSave(vehicle.FahrzeugID)}
                                                                    disabled={saving || Object.keys(vehicleEdits).length === 0}
                                                                    startIcon={<EditIcon />}
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        borderRadius: 2,
                                                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                                                        px: 3
                                                                    }}
                                                                >
                                                                    {t('vehicleManagement.save')}
                                                                </Button>
                                                            </Box>
                                                        </Box>
                                                    </AccordionDetails>
                                                </Accordion>
                                            </Card>
                                        </Grid>
                                    );
                                })}
                            </Grid>
                        </Box>

                        {/* Map Section */}
                        <Box sx={{ 
                            flex: 1, 
                            minWidth: 320,
                            background: 'white',
                            borderRadius: 4,
                            boxShadow: 4,
                            overflow: 'hidden'
                        }}>
                            <Box sx={{ 
                                background: 'linear-gradient(120deg, #e3f2fd 0%, #bbdefb 100%)',
                                p: 2,
                                borderBottom: 1,
                                borderColor: 'divider'
                            }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', textAlign: 'center' }}>
                                    🗺️ {t('vehicleManagement.vehicleLocations')}
                                </Typography>
                            </Box>
                            <MapContainer
                                center={[53.0793, 8.8017]}
                                zoom={8}
                                scrollWheelZoom
                                style={{ height: 'calc(100% - 60px)', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                {Object.entries(locations).map(([fahrzeugId, pos]) => {
                                    const vehicle = vehicles.find(v => v.FahrzeugID === parseInt(fahrzeugId));
                                    return (
                                        <Marker 
                                            key={fahrzeugId} 
                                            position={[pos.lat, pos.lon]}
                                            icon={L.icon({
                                                iconUrl: '/icons/car-marker.svg',
                                                iconSize: [40, 40],
                                                iconAnchor: [20, 40]
                                            })}
                                        >
                                            <Popup>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                                    {vehicle?.Hersteller} {vehicle?.ModellName}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {vehicle?.Kennzeichen}
                                                </Typography>
                                                <Typography variant="body2">
                                                    {vehicle?.Stundenpreis}€/h
                                                </Typography>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MapContainer>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Add Vehicle Dialog */}
            <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
                <DialogTitle>{t('vehicleManagement.newVehicle')}</DialogTitle>
                <DialogContent>
                    <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>{t('vehicleManagement.model')}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} size={5}>
                            <TextField label={t('vehicleManagement.manufacturer')} value={newVehicle.Hersteller}
                                onChange={e => setNewVehicle(v => ({ ...v, Hersteller: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={7}>
                            <TextField label={t('vehicleManagement.name')} value={newVehicle.ModellName}
                                onChange={e => setNewVehicle(v => ({ ...v, ModellName: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField label={t('vehicleManagement.vehicleType')} value={newVehicle.Fahrzeugtyp}
                                onChange={e => setNewVehicle(v => ({ ...v, Fahrzeugtyp: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>{t('vehicleManagement.transmission')}</InputLabel>
                                <Select
                                    label={t('vehicleManagement.transmission')}
                                    value={newVehicle.Getriebeart}
                                    onChange={e => setNewVehicle(v => ({ ...v, Getriebeart: e.target.value }))}
                                >
                                {getTransmissionOptions().map(opt => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={6}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>{t('vehicleManagement.fuelType')}</InputLabel>
                                <Select
                                    label={t('vehicleManagement.fuelType')}
                                    value={newVehicle.Kraftstoffart}
                                    onChange={e => setNewVehicle(v => ({ ...v, Kraftstoffart: e.target.value }))}
                                >
                                    {getFuelTypeOptions().map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={4}>
                            <FormControl fullWidth sx={{ mt: 1 }}>
                                <InputLabel>{t('vehicleManagement.doors')}</InputLabel>
                                <Select
                                    label={t('vehicleManagement.doors')}
                                    value={newVehicle.Türen}
                                    onChange={e => setNewVehicle(v => ({ ...v, Türen: e.target.value }))}
                                >
                                    {getDoorsOptions().map(opt => (
                                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4} size={4} alignContent={'end'}>
                            <TextField label={t('vehicleManagement.seats')} type="number" value={newVehicle.Sitze}
                                onChange={e => setNewVehicle(v => ({ ...v, Sitze: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4} alignContent={'end'}>
                            <TextField label={t('vehicleManagement.trunkVolumeLiters')} type="number" value={newVehicle.Kofferraumvolumen}
                                onChange={e => setNewVehicle(v => ({ ...v, Kofferraumvolumen: e.target.value }))} required fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <TextField label={t('vehicleManagement.powerPS')} type="number" value={newVehicle.Leistung}
                                onChange={e => setNewVehicle(v => ({ ...v, Leistung: e.target.value }))} required fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <TextField label={t('vehicleManagement.hourlyPrice')} type="number" value={newVehicle.Stundenpreis}
                                onChange={e => setNewVehicle(v => ({ ...v, Stundenpreis: e.target.value }))} required fullWidth />
                        </Grid>
                    </Grid>
                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>{t('vehicleManagement.vehicle')}</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField
                                label={t('vehicleManagement.licensePlate')}
                                value={newVehicle.Kennzeichen}
                                onChange={e => setNewVehicle(v => ({ ...v, Kennzeichen: e.target.value }))}
                                required
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth required>
                                <InputLabel>{t('vehicleManagement.repairStatus')}</InputLabel>
                                <Select
                                    label={t('vehicleManagement.repairStatus')}
                                    value={newVehicle.Reperaturzustand}
                                    onChange={e => setNewVehicle(v => ({ ...v, Reperaturzustand: e.target.value }))}
                                >
                                    {getRepairStatusOptions().map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} size={6}>
                            <FormControl fullWidth required>
                                <InputLabel>{t('vehicleManagement.tires')}</InputLabel>
                                <Select
                                    label={t('vehicleManagement.tires')}
                                    value={newVehicle.Reifen}
                                    onChange={e => setNewVehicle(v => ({ ...v, Reifen: e.target.value }))}
                                >
                                    {getTireOptions().map(opt => (
                                        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} size={12}>
                            <TextField
                                label={t('vehicleManagement.mileage')}
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
                                label={t('vehicleManagement.firstRegistration')}
                                value={newVehicle.ErstzulassungsDatum ? new Date(newVehicle.ErstzulassungsDatum) : null}
                                onChange={date => setNewVehicle(v => ({ ...v, ErstzulassungsDatum: date ? date.toISOString().slice(0, 10) : '' }))
                                }
                                format="yyyy-MM-dd"
                                slotProps={{ textField: { fullWidth: true } }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} size={4}>
                            <DatePicker
                                label={t('vehicleManagement.lastTuev')}
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
                                label={t('vehicleManagement.lastService')}
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
                                label={newVehicle.Aktiv ? t('vehicleManagement.available') : t('vehicleManagement.unavailable')}
                            />
                        </Grid>
                    </Grid>
                    {addError && <Typography color="error" sx={{ mt: 2 }}>{addError}</Typography>}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleAddClose} color="secondary">{t('vehicleManagement.cancel')}</Button>
                    <Button
                        onClick={handleAddVehicle}
                        color="primary"
                        variant="contained"
                        disabled={!isValidNewVehicle() || addLoading}
                    >
                        {t('vehicleManagement.add')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Damage Management Dialog */}
            <Dialog open={damageDialogOpen} onClose={handleDamageDialogClose} maxWidth="md" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningIcon color="warning" />
                        {t('vehicleManagement.damageManagement')}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {/* Add New Damage Section */}
                    <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(76, 175, 80, 0.05)', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                            {t('vehicleManagement.addNewDamage')}
                        </Typography>
                        <TextField
                            label={t('vehicleManagement.damageDescription')}
                            value={newDamage.Beschreibung}
                            onChange={e => setNewDamage({ Beschreibung: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            sx={{ 
                                mb: 2,
                                '& .MuiOutlinedInput-root': { 
                                    borderRadius: 2,
                                    background: 'white'
                                }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleCreateDamage}
                            disabled={damageLoading || !newDamage.Beschreibung.trim()}
                            startIcon={<AddIcon />}
                            sx={{
                                borderRadius: 2,
                                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                                px: 3,
                                fontWeight: 700,
                                '&:hover': {
                                    background: 'linear-gradient(135deg, #2e7d32 0%, #388e3c 100%)'
                                }
                            }}
                        >
                            {damageLoading ? <CircularProgress size={20} /> : t('vehicleManagement.addDamage')}
                        </Button>
                    </Box>

                    {/* Edit Damage Section (shown when editing) */}
                    {editingDamage && (
                        <Box sx={{ mb: 3, p: 2, borderRadius: 2, background: 'rgba(255, 193, 7, 0.05)', border: '1px solid rgba(255, 193, 7, 0.2)' }}>
                            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                                {t('vehicleManagement.editDamage')}
                            </Typography>
                            <TextField
                                label={t('vehicleManagement.damageDescription')}
                                value={editingDamage.Beschreibung}
                                onChange={e => setEditingDamage(prev => ({ ...prev, Beschreibung: e.target.value }))}
                                fullWidth
                                multiline
                                rows={3}
                                variant="outlined"
                                sx={{ 
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: 2,
                                        background: 'white'
                                    }
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleUpdateDamage}
                                    disabled={damageLoading || !editingDamage.Beschreibung.trim()}
                                    startIcon={<EditIcon />}
                                    sx={{
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                        px: 3,
                                        fontWeight: 700
                                    }}
                                >
                                    {damageLoading ? <CircularProgress size={20} /> : t('vehicleManagement.updateDamage')}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => setEditingDamage(null)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t('vehicleManagement.cancel')}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {/* Existing Damages List */}
                    <Typography variant="subtitle2" sx={{ mt: 3, mb: 1, fontWeight: 600 }}>
                        {t('vehicleManagement.existingDamages')}
                    </Typography>
                    {vehicleDamages[selectedVehicleId] && vehicleDamages[selectedVehicleId].length > 0 ? (
                        <List>
                            {vehicleDamages[selectedVehicleId].map(damage => (
                                <ListItem key={damage.SchadenID} sx={{ borderRadius: 2, mb: 1, background: 'rgba(0, 0, 0, 0.03)' }}>
                                    <ListItemText
                                        primary={damage.Beschreibung}
                                        primaryTypographyProps={{ fontWeight: 600 }}
                                    />
                                    <ListItemSecondaryAction>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                edge="end"
                                                color="primary"
                                                onClick={() => setEditingDamage(damage)}
                                                sx={{ 
                                                    background: 'rgba(25, 118, 210, 0.1)',
                                                    '&:hover': {
                                                        background: 'rgba(25, 118, 210, 0.2)'
                                                    }
                                                }}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                color="error"
                                                onClick={() => handleDeleteDamage(damage.SchadenID)}
                                                sx={{ 
                                                    background: 'rgba(211, 47, 47, 0.1)',
                                                    '&:hover': {
                                                        background: 'rgba(211, 47, 47, 0.2)'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Box sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                            <Typography>{t('vehicleManagement.noDamagesFound')}</Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDamageDialogClose} color="secondary" sx={{ borderRadius: 2 }}>
                        {t('vehicleManagement.close')}
                    </Button>
                </DialogActions>
            </Dialog>
        </LocalizationProvider>
    );
}