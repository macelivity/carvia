import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Container, Typography, TextField, Button, Box, Paper, 
    Grid, Avatar, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { de } from 'date-fns/locale';

/**
 * Hilfsfunktion - Formatiert Date-Objekt zu 'YYYY-MM-DDTHH:mm' String
 * @param {Date} date - Das zu formatierende Datum
 * @returns {string} Formatierter Datum-String
 */
function formatToDateTimeLocalString(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * VehicleSearch Komponente - Fahrzeugsuche mit Filtern
 * Ermöglicht es Benutzern, nach verfügbaren Fahrzeugen zu suchen
 */
export default function VehicleSearch() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    
    // Initiale Suchfilter
    const initialSearchFilters = {
        start_datum: null,
        end_datum: null,
        abholort_plz: '',
        abholort_stadt: '',
        rueckgabeort_plz: '',
        rueckgabeort_stadt: '',
    };
    
    const [searchFilters, setSearchFilters] = useState(initialSearchFilters);
    const [pageError, setPageError] = useState('');

    /**
     * Behandelt Änderungen in Eingabefeldern
     * @param {Object} e - Event-Objekt
     */
    const handleInputChange = (e) => {
        setSearchFilters({
            ...searchFilters,
            [e.target.name]: e.target.value,
        });
        setPageError('');
    };

    /**
     * Behandelt Änderungen des Startdatums
     * @param {Date} newValue - Neues Startdatum
     */
    const handleStartDateChange = (newValue) => {
        setSearchFilters(prev => ({ ...prev, start_datum: newValue }));
        setPageError('');
    };

    /**
     * Behandelt Änderungen des Enddatums
     * @param {Date} newValue - Neues Enddatum
     */
    const handleEndDateChange = (newValue) => {
        setSearchFilters(prev => ({ ...prev, end_datum: newValue }));
        setPageError('');
    };

    /**
     * Behandelt das Absenden des Suchformulars
     * @param {Object} e - Event-Objekt
     */
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageError('');

        // Validierung: Überprüfe ob alle Felder ausgefüllt sind
        if (!searchFilters.start_datum || !searchFilters.end_datum ||
            !searchFilters.abholort_plz || !searchFilters.abholort_stadt ||
            !searchFilters.rueckgabeort_plz || !searchFilters.rueckgabeort_stadt) {
            setPageError(t('vehicleSearch.fillAllFields'));
            return;
        }

        // Validierung: Überprüfe Datumsbereich
        if (searchFilters.start_datum && searchFilters.end_datum && 
            new Date(searchFilters.start_datum) >= new Date(searchFilters.end_datum)) {
            setPageError(t('vehicleSearch.invalidDateRange'));
            return;
        }

        const searchFilterForNavigation = {
            ...searchFilters,
            start_datum: formatToDateTimeLocalString(searchFilters.start_datum),
            end_datum: formatToDateTimeLocalString(searchFilters.end_datum),
        };

        // Navigiere zur Ergebnisseite mit Suchfiltern
        navigate('/vehicle-results', {
            state: {
                searchFilter: searchFilterForNavigation,
                searchNowAvailable: false
            }
        });
    };

    /**
     * Setzt das Suchformular zurück
     */
    const handleResetSearchForm = () => {
        setSearchFilters(initialSearchFilters);
        setPageError('');
    };

    return (
        <Box sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="md">
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
                    <Paper sx={{
                        borderRadius: 4,
                        boxShadow: 6,
                        overflow: 'hidden',
                        background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
                    }}>
                        {/* Header */}
                        <Box sx={{
                            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                            color: 'white',
                            p: 4,
                            textAlign: 'center'
                        }}>
                            <Avatar sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 2,
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)'
                            }}>
                                <SearchIcon sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                                {t('vehicleSearch.createReservationTitle', 'Create Reservation')}
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {t('vehicleSearch.subtitle')}
                            </Typography>
                        </Box>

                        {/* Formular-Bereich */}
                        <Box sx={{ p: 4 }}>
                            <Box component="form" onSubmit={handleSearchSubmit}>
                                {/* Datum & Zeit Sektion */}
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: 'primary.main', 
                                    mb: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <SearchIcon />
                                    {t('vehicleSearch.dateAndTime')}
                                </Typography>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12}>
                                        <DateTimePicker
                                            label={t('vehicleSearch.startDateTime')}
                                            value={searchFilters.start_datum}
                                            onChange={handleStartDateChange}
                                            ampm={false}
                                            slotProps={{
                                                actionBar: { actions: ["cancel", "today", "accept"] },
                                                textField: { 
                                                    fullWidth: true,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <DateTimePicker
                                            label={t('vehicleSearch.endDateTime')}
                                            value={searchFilters.end_datum}
                                            onChange={handleEndDateChange}
                                            ampm={false}
                                            slotProps={{
                                                actionBar: { actions: ["cancel", "today", "accept"] },
                                                textField: { 
                                                    fullWidth: true,
                                                    sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Pickup Location */}
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: 'primary.main', 
                                    mb: 3 
                                }}>
                                    {t('vehicleSearch.pickupLocation')}
                                </Typography>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label={t('vehicleSearch.pickupPostalCode')}
                                            name="abholort_plz"
                                            value={searchFilters.abholort_plz}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            label={t('vehicleSearch.pickupCity')}
                                            name="abholort_stadt"
                                            value={searchFilters.abholort_stadt}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Return Location */}
                                <Typography variant="h6" sx={{ 
                                    fontWeight: 700, 
                                    color: 'primary.main', 
                                    mb: 3 
                                }}>
                                    {t('vehicleSearch.returnLocation')}
                                </Typography>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    <Grid item xs={12} sm={4}>
                                        <TextField
                                            fullWidth
                                            label={t('vehicleSearch.returnPostalCode')}
                                            name="rueckgabeort_plz"
                                            value={searchFilters.rueckgabeort_plz}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            label={t('vehicleSearch.returnCity')}
                                            name="rueckgabeort_stadt"
                                            value={searchFilters.rueckgabeort_stadt}
                                            onChange={handleInputChange}
                                            variant="outlined"
                                            required
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                        />
                                    </Grid>
                                </Grid>

                                {pageError && (
                                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                        {pageError}
                                    </Alert>
                                )}

                                {/* Action Buttons */}
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            size="large"
                                            startIcon={<SearchIcon />}
                                            sx={{
                                                py: 1.5,
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
                                            {t('vehicleSearch.searchVehicles')}
                                        </Button>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <Button
                                            type="button"
                                            fullWidth
                                            variant="outlined"
                                            size="large"
                                            startIcon={<RefreshIcon />}
                                            onClick={handleResetSearchForm}
                                            sx={{
                                                py: 1.5,
                                                fontWeight: 700,
                                                borderRadius: 3,
                                                borderWidth: 2,
                                                '&:hover': {
                                                    borderWidth: 2,
                                                    transform: 'translateY(-2px)'
                                                },
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {t('vehicleSearch.resetSearch')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Box>
                        </Box>
                    </Paper>
                </LocalizationProvider>
            </Container>
        </Box>
    );
}