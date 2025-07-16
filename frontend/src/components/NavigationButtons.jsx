import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Navigations-Button-Komponente
 * Zeigt rollenspezifische Navigationsbuttons basierend auf der Benutzerrolle
 */
export default function NavigationButtons() {
    const { user } = useAuth();
    const { t } = useTranslation();

    const buttonStyle = {
        color: 'white',
        fontWeight: 600,
        px: 3,
        py: 1,
        borderRadius: 2,
        '&:hover': {
            background: 'rgba(255,255,255,0.1)',
            transform: 'translateY(-1px)',
        },
        transition: 'all 0.2s ease-in-out'
    };

    return (
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {/* Fahrzeuge-Button - für alle sichtbar */}
            <Button
                component={Link}
                to="/vehicles"
                startIcon={<DirectionsCarIcon />}
                sx={buttonStyle}
            >
                {t('navbar.vehicles')}
            </Button>

            {/* Suchfunktion - nur für angemeldete Mitglieder */}
            {user.role === 'Mitglied' && (
                <Button
                    component={Link}
                    to="/search"
                    startIcon={<SearchIcon />}
                    sx={buttonStyle}
                >
                    {t('navbar.search')}
                </Button>
            )}
        </Box>
    );
}
