import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { de } from 'date-fns/locale'; // German locale for date-fns

// Helper function to format Date object to 'YYYY-MM-DDTHH:mm' string
function formatToDateTimeLocalString(date) {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function VehicleSearch() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const initialSearchFilters = {
        start_datum: null, // Use null for DateTimePicker
        end_datum: null,   // Use null for DateTimePicker
        abholort_plz: '',
        abholort_stadt: '',
        rueckgabeort_plz: '',
        rueckgabeort_stadt: '',
    };
    const [searchFilters, setSearchFilters] = useState(initialSearchFilters);
    const [pageError, setPageError] = useState('');
    const [useCurrentTime, setUseCurrentTime] = useState(false);

    const handleInputChange = (e) => {
        setSearchFilters({
            ...searchFilters,
            [e.target.name]: e.target.value,
        });
        setPageError('');
    };

    const handleStartDateChange = (newValue) => {
        setSearchFilters(prev => ({ ...prev, start_datum: newValue }));
        setPageError('');
    };

    const handleEndDateChange = (newValue) => {
        setSearchFilters(prev => ({ ...prev, end_datum: newValue }));
        setPageError('');
    };

    const handleUseCurrentTimeChange = (e) => {
        setUseCurrentTime(e.target.checked);
        if (e.target.checked) {
            setSearchFilters(prev => ({ ...prev, start_datum: null })); // Clear start_datum when "Jetzt starten"
        }
        setPageError('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageError('');

        const startDateToValidate = useCurrentTime ? new Date() : searchFilters.start_datum;
        const endDateToValidate = searchFilters.end_datum;

        if ((!useCurrentTime && !startDateToValidate) || !endDateToValidate ||
            !searchFilters.abholort_plz || !searchFilters.abholort_stadt ||
            !searchFilters.rueckgabeort_plz || !searchFilters.rueckgabeort_stadt) {
            setPageError(t('vehicleSearch.fillAllFields'));
            return;
        }

        if (startDateToValidate && endDateToValidate && new Date(startDateToValidate) >= new Date(endDateToValidate)) {
            setPageError(t('vehicleSearch.invalidDateRange'));
            return;
        }

        const searchFilterForNavigation = {
            ...searchFilters, // Includes PLZ, Stadt etc.
            start_datum: useCurrentTime ? formatToDateTimeLocalString(new Date()) : formatToDateTimeLocalString(searchFilters.start_datum),
            end_datum: formatToDateTimeLocalString(searchFilters.end_datum),
        };

        navigate('/vehicles', {
            state: {
                searchFilter: searchFilterForNavigation,
                searchNowAvailable: useCurrentTime
            }
        });
    };

    const handleResetSearchForm = () => {
        setSearchFilters(initialSearchFilters);
        setUseCurrentTime(false);
        setPageError('');
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
            <Box sx={{ p: 3, maxWidth: 'md', mx: 'auto' }}>
                <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: 'text.primary', pb: 2, mb: 4, borderBottom: 1 }}>
                        {t('vehicleSearch.title')}
                    </Typography>

                    <form onSubmit={handleSearchSubmit}>
                        <Grid container spacing={2}>
                            <Grid item size={12}>
                                <DateTimePicker
                                    label={t('vehicleSearch.startDateTime')}
                                    value={searchFilters.start_datum}
                                    onChange={handleStartDateChange}
                                    ampm={false} // Use 24-hour format
                                    slotProps={{
                                        actionBar: { actions: ["cancel", "today", "accept"] },
                                        textField: { fullWidth: true }
                                    }}
                                />
                            </Grid>
                            <Grid item size={6}>
                                <TextField
                                    type="text"
                                    name="abholort_plz"
                                    id="abholort_plz"
                                    label={t('vehicleSearch.pickupPostalCode')}
                                    value={searchFilters.abholort_plz}
                                    onChange={handleInputChange}
                                    placeholder={t('vehicleSearch.pickupPostalCodePlaceholder')}
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item size={6}>
                                <TextField
                                    type="text"
                                    name="abholort_stadt"
                                    id="abholort_stadt"
                                    label={t('vehicleSearch.pickupCity')}
                                    value={searchFilters.abholort_stadt}
                                    onChange={handleInputChange}
                                    placeholder={t('vehicleSearch.pickupCityPlaceholder')}
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item size={12}>
                                <DateTimePicker
                                    label={t('vehicleSearch.endDateTime')}
                                    value={searchFilters.end_datum}
                                    onChange={handleEndDateChange}
                                    ampm={false} // Use 24-hour format
                                    slotProps={{
                                        actionBar: { actions: ["cancel", "today", "accept"] },
                                        textField: { fullWidth: true }
                                    }}
                                />
                            </Grid>
                            <Grid item size={6}>
                                <TextField
                                    type="text"
                                    name="rueckgabeort_plz"
                                    id="rueckgabeort_plz"
                                    label={t('vehicleSearch.returnPostalCode')}
                                    value={searchFilters.rueckgabeort_plz}
                                    onChange={handleInputChange}
                                    placeholder={t('vehicleSearch.returnPostalCodePlaceholder')}
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item size={6}>
                                <TextField
                                    type="text"
                                    name="rueckgabeort_stadt"
                                    id="rueckgabeort_stadt"
                                    label={t('vehicleSearch.returnCity')}
                                    value={searchFilters.rueckgabeort_stadt}
                                    onChange={handleInputChange}
                                    placeholder={t('vehicleSearch.returnCityPlaceholder')}
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                />
                            </Grid>
                        </Grid>
                        {pageError && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {pageError}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 3, pt: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="success"
                                size="large"
                                sx={{ flexGrow: { sm: 1 } }}
                            >
                                {t('vehicleSearch.searchVehicles')}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleResetSearchForm}
                                variant="outlined"
                                color="secondary"
                                size="large"
                                sx={{ flexGrow: { sm: 1 } }}
                            >
                                {t('vehicleSearch.resetSearch')}
                            </Button>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </LocalizationProvider>
    );
}