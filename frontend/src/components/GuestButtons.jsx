import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * Gast-Button-Komponente
 * Zeigt Login- und Registrierungsbuttons für nicht angemeldete Benutzer
 */
export default function GuestButtons() {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
                component={Link}
                to="/login"
                startIcon={<LoginIcon />}
                variant="outlined"
                sx={{
                    color: 'white',
                    borderColor: 'rgba(255,255,255,0.3)',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                        borderColor: 'white',
                        background: 'rgba(255,255,255,0.1)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                {t('navbar.login')}
            </Button>
            <Button
                component={Link}
                to="/register"
                startIcon={<PersonAddIcon />}
                variant="contained"
                sx={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 600,
                    borderRadius: 2,
                    '&:hover': {
                        background: 'rgba(255,255,255,0.3)',
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                {t('navbar.register')}
            </Button>
        </Box>
    );
}
