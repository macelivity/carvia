import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Paper, Typography, Button
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

/**
 * QuickActions Komponente - Schnelle Aktionen für alle Benutzer
 */
export default function QuickActions() {
    const { t } = useTranslation();

    return (
        <Paper sx={{ 
            p: 4, 
            mt: 6,
            borderRadius: 4, 
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
            textAlign: 'center'
        }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                {t('homepage.exploreVehicles')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                {t('homepage.exploreDescription')}
            </Typography>
            <Button
                component={Link}
                to="/vehicles"
                variant="outlined"
                size="large"
                startIcon={<DirectionsCarIcon />}
                sx={{
                    py: 2,
                    px: 4,
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
                {t('homepage.seeVehicles')}
            </Button>
        </Paper>
    );
}
