import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Box } from '@mui/material';
import GuestWelcomeCard from '../components/GuestWelcomeCard';
import UserWelcomeCard from '../components/UserWelcomeCard';
import ActionCards from '../components/ActionCards';
import AdminStaffCard from '../components/AdminStaffCard';
import QuickActions from '../components/QuickActions';

/**
 * Homepage Komponente - Startseite der Anwendung
 * Zeigt unterschiedliche Inhalte basierend auf dem Benutzerstatus an
 */
export default function Homepage() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <Box sx={{ 
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Hero-Bereich */}
                <Box sx={{ textAlign: 'center', mb: 6 }}>
                    <Typography 
                        variant="h2" 
                        sx={{ 
                            fontWeight: 800, 
                            color: 'white', 
                            mb: 2,
                            fontSize: { xs: '2.5rem', md: '3.5rem' },
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                    >
                        {t('homepage.title')}
                    </Typography>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: 'rgba(255,255,255,0.9)', 
                            mb: 4,
                            fontWeight: 300,
                            fontSize: { xs: '1.2rem', md: '1.5rem' }
                        }}
                    >
                        {t('homepage.description')}
                    </Typography>
                </Box>

                {/* Benutzerspezifische Inhalte */}
                {user.role === "guest" ? (
                    <GuestWelcomeCard />
                ) : (
                    <>
                        <UserWelcomeCard user={user} />
                        <ActionCards user={user} />
                        <AdminStaffCard user={user} />
                    </>
                )}

                {/* Schnelle Aktionen für alle Benutzer */}
                <QuickActions />
            </Container>
        </Box>
    );
}
