import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Button, Box, Avatar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

/**
 * ActionCards Komponente - Hauptaktions-Karten für angemeldete Benutzer
 * @param {Object} user - Benutzerdaten
 */
export default function ActionCards({ user }) {
    const { t } = useTranslation();
    
    // Bestimme ob Benutzer Mitarbeiter oder Admin ist
    const isStaffOrAdmin = user.role === 'Mitarbeiter' || user.role === 'Admin';

    return (
        <Box sx={{ display: 'flex', gap: 2, mb: 8, flexDirection: { xs: 'column', md: 'row' } }}>
            {/* Neue Reservierung Karte */}
            <Box sx={{ flex: 1 }}>
                <Card sx={{ 
                    height: '100%',
                    borderRadius: 4, 
                    boxShadow: 4,
                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                    cursor: isStaffOrAdmin ? 'not-allowed' : 'pointer',
                    opacity: isStaffOrAdmin ? 0.5 : 1,
                    filter: isStaffOrAdmin ? 'grayscale(0.5)' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 8,
                        transform: isStaffOrAdmin ? 'none' : 'translateY(-4px)'
                    }
                }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Avatar sx={{ 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 3,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                        }}>
                            <SearchIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>
                            {t('homepage.makeNewReservation')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                            {t('homepage.searchDescription')}
                        </Typography>
                        <Button
                            component={Link}
                            to="/search"
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<SearchIcon />}
                            disabled={isStaffOrAdmin}
                            sx={{
                                py: 2,
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                boxShadow: 3,
                                opacity: isStaffOrAdmin ? 0.7 : 1,
                                cursor: isStaffOrAdmin ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {t('homepage.startSearch')}
                        </Button>
                        {isStaffOrAdmin && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                {t('homepage.searchDisabled', 'Admins and staff cannot make personal reservations.')}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Reservierungen anzeigen Karte */}
            <Box sx={{ flex: 1 }}>
                <Card sx={{ 
                    height: '100%',
                    borderRadius: 4, 
                    boxShadow: 4,
                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                    cursor: isStaffOrAdmin ? 'not-allowed' : 'pointer',
                    opacity: isStaffOrAdmin ? 0.5 : 1,
                    filter: isStaffOrAdmin ? 'grayscale(0.5)' : 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        boxShadow: 8,
                        transform: isStaffOrAdmin ? 'none' : 'translateY(-4px)'
                    }
                }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <Avatar sx={{ 
                            width: 80, 
                            height: 80, 
                            mx: 'auto', 
                            mb: 3,
                            background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)'
                        }}>
                            <CalendarTodayIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 2 }}>
                            {t('homepage.seeReservations')}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                            {t('homepage.reservationsDescription')}
                        </Typography>
                        <Button
                            component={Link}
                            to="/reservations"
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<CalendarTodayIcon />}
                            disabled={isStaffOrAdmin}
                            sx={{
                                py: 2,
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                                boxShadow: 3,
                                opacity: isStaffOrAdmin ? 0.7 : 1,
                                cursor: isStaffOrAdmin ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {t('homepage.viewReservations')}
                        </Button>
                        {isStaffOrAdmin && (
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                {t('homepage.reservationDisabled', 'Admins and staff cannot view personal reservations.')}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}
