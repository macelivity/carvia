import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Button, Box, Avatar
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * AdminStaffCard Komponente - Verwaltungstools für Mitarbeiter und Administratoren
 * @param {Object} user - Benutzerdaten
 */
export default function AdminStaffCard({ user }) {
    const { t } = useTranslation();

    // Nur für Mitarbeiter und Admins anzeigen
    if (user.role !== 'Mitarbeiter' && user.role !== 'Admin') {
        return null;
    }

    return (
        <Card sx={{ 
            mt: 3,   // Oberer Abstand zu den ActionCards
            mb: 4,   // Unterer Abstand zum nächsten Element
            borderRadius: 4, 
            boxShadow: 4,
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc80 100%)'
        }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Avatar sx={{ 
                    width: 60, 
                    height: 60, 
                    mx: 'auto', 
                    mb: 2,
                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
                }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 30 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', mb: 3 }}>
                    {t('homepage.adminTools')}
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    {user.role === 'Mitarbeiter' && (
                        <>
                            {/* Fahrzeugverwaltung Button für Mitarbeiter */}
                            <Button
                                component={Link}
                                to="/vehicle-management"
                                variant="contained"
                                startIcon={<AdminPanelSettingsIcon />}
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                    boxShadow: 3,
                                    minWidth: '180px'
                                }}
                            >
                                {t('homepage.vehicleManagementButton')}
                            </Button>
                            
                            {/* Benutzer-Reservierungen Button für Mitarbeiter */}
                            <Button
                                component={Link}
                                to="/user-reservations"
                                variant="contained"
                                startIcon={<PersonIcon />}
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                    boxShadow: 3,
                                    minWidth: '180px'
                                }}
                            >
                                {t('navbar.userReservations')}
                            </Button>
                            
                            {/* Anfragen verwalten Button für Mitarbeiter */}
                            <Button
                                component={Link}
                                to="/accept"
                                variant="contained"
                                startIcon={<PersonAddIcon />}
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 3,
                                    background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                    boxShadow: 3,
                                    minWidth: '180px'
                                }}
                            >
                                {t('homepage.manageApplicationsButton')}
                            </Button>
                        </>
                    )}
                    
                    {user.role === 'Admin' && (
                        /* Mitarbeiterverwaltung Button für Admin (Platzhalter) */
                        <Button
                            variant="contained"
                            startIcon={<PersonIcon />}
                            onClick={() => {
                                // Platzhalter - noch keine Funktionalität implementiert
                            }}
                            sx={{
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                boxShadow: 3,
                                minWidth: '180px'
                            }}
                        >
                            {t('homepage.staffManagementButton')}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}
