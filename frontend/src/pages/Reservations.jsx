/**
 * Reservierungsseite - Zeigt alle Benutzerreservierungen an
 * Unterscheidet zwischen zukünftigen und vergangenen Reservierungen
 * Ermöglicht das Anzeigen von Rechnungen und Stornieren zukünftiger Reservierungen
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRechnungByReservierungsId, getUserReservations, getProfile, deleteReservation } from '../api/api';
import { useTranslation } from 'react-i18next';
import {
    Container, Typography, Card, CardContent, Button, Box, Grid,
    CircularProgress, Alert, Avatar, Chip, Divider, Dialog, DialogTitle, 
    DialogContent, DialogActions
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Hilfsfunktion: Datum formatieren
 * @param {string} dateString - ISO-Datum als String
 * @returns {string} - Formatiertes deutsches Datum mit Uhrzeit
 */
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
};

/**
 * Komponente: Reservierungskarte
 * Zeigt Details einer einzelnen Reservierung mit Aktionsbuttons an
 */
function ReservationCard({ reservation, onViewInvoice, onDelete, t, isFuture = false }) {
    return (
        <Card sx={{
            borderRadius: 3,
            boxShadow: 3,
            background: isFuture 
                ? 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)' 
                : 'linear-gradient(120deg, #f3e5f5 0%, #fce4ec 100%)',
            transition: 'all 0.3s ease',
            mb: 4, // Add margin bottom for spacing between cards
            '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
            }
        }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                            {t('reservations.reservationId')}: {reservation.ReservierungID}
                        </Typography>
                        <Chip 
                            label={isFuture ? t('reservations.upcoming') : t('reservations.completed')}
                            color={isFuture ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    </Box>
                    <Avatar sx={{
                        background: isFuture 
                            ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                            : 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                        width: 48,
                        height: 48
                    }}>
                        <DirectionsCarIcon />
                    </Avatar>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        <strong>{t('reservations.vehicleId')}:</strong> {reservation.FahrzeugID}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        <strong>{t('reservations.tariffId')}:</strong> {reservation.TarifID}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        <strong>{t('reservations.period')}:</strong> {formatDate(reservation.StartDatum)} – {formatDate(reservation.EndDatum)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, flexDirection: isFuture ? 'column' : 'row' }}>
                    <Button
                        component={Link}
                        to={`/rechnung?reservation=${reservation.ReservierungID}`}
                        variant="contained"
                        startIcon={<ReceiptIcon />}
                        fullWidth
                        sx={{
                            py: 1.5,
                            fontWeight: 700,
                            borderRadius: 2,
                            background: isFuture 
                                ? 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                                : 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                            boxShadow: 2
                        }}
                    >
                        {t('reservations.viewInvoice')}
                    </Button>
                    
                    {isFuture && onDelete && (
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            fullWidth
                            onClick={() => onDelete(reservation)}
                            sx={{
                                py: 1.5,
                                fontWeight: 700,
                                borderRadius: 2,
                                borderWidth: 2,
                                '&:hover': {
                                    borderWidth: 2,
                                    backgroundColor: 'error.main',
                                    color: 'white'
                                }
                            }}
                        >
                            {t('reservations.deleteReservation')}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

/**
 * Hauptkomponente: Reservierungsübersicht
 * Lädt und zeigt alle Benutzerreservierungen in separaten Kategorien an
 */
export default function Reservations() {
    const { t } = useTranslation();
    
    // Zustandsvariablen für Reservierungsdaten
    const [futureReservations, setFutureReservations] = useState([]);
    const [pastReservations, setPastReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Zustandsvariablen für Löschbestätigungsdialog
    const [deleteDialog, setDeleteDialog] = useState({ open: false, reservation: null });
    const [deleteLoading, setDeleteLoading] = useState(false);

    /**
     * Effect: Lädt alle Benutzerreservierungen beim Komponenten-Mount
     * Trennt sie in zukünftige und vergangene Reservierungen
     */
    useEffect(() => {
        const fetchUserReservations = async () => {
            setLoading(true);
            setError(null);
            
            try {
                // Erst Benutzerprofil abrufen um Benutzer-ID zu erhalten
                const profileRes = await getProfile();
                const userId = profileRes.data.user.UserID || profileRes.data.user.user_id;
                
                if (!userId) {
                    throw new Error('Benutzer-ID nicht gefunden');
                }
                
                // Dann spezifische Benutzerreservierungen abrufen
                const reservationsRes = await getUserReservations(userId);
                const allReservations = reservationsRes.data;
                const now = new Date();

                const future = [];
                const past = [];

                // Reservierungen basierend auf Enddatum kategorisieren
                allReservations.forEach(r => {
                    const endDate = new Date(r.EndDatum);
                    if (endDate > now) {
                        future.push({ ...r, rechnung: null });
                    } else {
                        past.push({ ...r, rechnung: null });
                    }
                });

                // Nach Startdatum sortieren
                future.sort((a, b) => new Date(a.StartDatum) - new Date(b.StartDatum));
                past.sort((a, b) => new Date(b.StartDatum) - new Date(a.StartDatum));

                setFutureReservations(future);
                setPastReservations(past);
            } catch (err) {
                setError(t('reservations.errorLoadingReservations'));
                setFutureReservations([]);
                setPastReservations([]);
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserReservations();
    }, [t]);

    /**
     * Handler: Öffnet Löschbestätigungsdialog für eine Reservierung
     */
    const handleDeleteReservation = (reservation) => {
        setDeleteDialog({ open: true, reservation });
    };

    /**
     * Handler: Bestätigt und führt Reservierungslöschung durch
     */
    const handleDeleteConfirm = async () => {
        if (!deleteDialog.reservation) return;
        
        setDeleteLoading(true);
        try {
            await deleteReservation(deleteDialog.reservation.ReservierungID);
            
            // Remove the deleted reservation from the state
            setFutureReservations(prev => 
                prev.filter(r => r.ReservierungID !== deleteDialog.reservation.ReservierungID)
            );
            
            setDeleteDialog({ open: false, reservation: null });
        } catch (err) {
            setError(t('reservations.deleteError'));
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setDeleteDialog({ open: false, reservation: null });
    };

    if (loading) {
        return (
            <Box sx={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <CircularProgress size={60} sx={{ color: 'white' }} />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
                <Box sx={{
                    background: 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)',
                    borderRadius: 4,
                    boxShadow: 3,
                    p: { xs: 2, sm: 4 },
                    mb: 6,
                    textAlign: 'center'
                }}>
                    <Avatar sx={{
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2,
                        background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
                    }}>
                        <CalendarTodayIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h3" sx={{ 
                        fontWeight: 800, 
                        color: 'primary.main', 
                        mb: 1, 
                        letterSpacing: 1 
                    }}>
                        {t('reservations.title')}
                    </Typography>
                    <Typography variant="subtitle1" sx={{ 
                        color: 'text.secondary', 
                        maxWidth: 600, 
                        mx: 'auto' 
                    }}>
                        {t('reservations.subtitle')}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={6} sx={{ mt: 4 }}>
                    {/* Future Reservations */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{
                            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                            borderRadius: 4,
                            boxShadow: 3,
                            p: 3,
                            height: 'fit-content',
                            mt: 4 // Add margin-top to create spacing from the header card
                        }}>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                color: 'primary.main', 
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <CalendarTodayIcon />
                                {t('reservations.futureReservations')}
                            </Typography>
                            
                            {futureReservations.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    {futureReservations.map(r => (
                                        <ReservationCard 
                                            key={r.ReservierungID} 
                                            reservation={r} 
                                            t={t} 
                                            isFuture={true}
                                            onDelete={handleDeleteReservation}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    py: 6,
                                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                    borderRadius: 3
                                }}>
                                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                                        {t('reservations.noFutureReservations')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                                        {t('reservations.wantToSeeVehicles')}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to="/search"
                                        variant="contained"
                                        startIcon={<SearchIcon />}
                                        sx={{
                                            py: 1.5,
                                            px: 3,
                                            fontWeight: 700,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                                            boxShadow: 3
                                        }}
                                    >
                                        {t('reservations.toVehicleOverview')}
                                    </Button>
                                </Box>
                            )}
                        </Box>
                    </Grid>

                    {/* Past Reservations */}
                    <Grid item xs={12} lg={6}>
                        <Box sx={{
                            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                            borderRadius: 4,
                            boxShadow: 3,
                            p: 3,
                            height: 'fit-content',
                            mt: 4 // Add margin-top to create spacing from the header card
                        }}>
                            <Typography variant="h5" sx={{ 
                                fontWeight: 700, 
                                color: '#7b1fa2', 
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                            }}>
                                <ReceiptIcon />
                                {t('reservations.pastReservations')}
                            </Typography>
                            
                            {pastReservations.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    {pastReservations.map(r => (
                                        <ReservationCard 
                                            key={r.ReservierungID} 
                                            reservation={r} 
                                            t={t} 
                                            isFuture={false}
                                        />
                                    ))}
                                </Box>
                            ) : (
                                <Box sx={{ 
                                    textAlign: 'center', 
                                    py: 6,
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                    borderRadius: 3
                                }}>
                                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                                        {t('reservations.noPastReservations')}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Grid>
                </Grid>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialog.open}
                    onClose={handleDeleteCancel}
                    aria-labelledby="delete-confirmation-dialog"
                >
                    <DialogTitle id="delete-confirmation-dialog">
                        {t('reservations.confirmDeleteTitle')}
                    </DialogTitle>
                    <DialogContent>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('reservations.confirmDeleteMessage')}
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDeleteCancel} color="primary">
                            {t('common.cancel')}
                        </Button>
                        <Button 
                            onClick={handleDeleteConfirm} 
                            color="error" 
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? <CircularProgress size={24} /> : t('common.delete')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Box>
    );
}