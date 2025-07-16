import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Box, Avatar, Chip
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';

/**
 * UserWelcomeCard Komponente - Begrüßungskarte für angemeldete Benutzer
 * @param {Object} user - Benutzerdaten
 */
export default function UserWelcomeCard({ user }) {
    const { t } = useTranslation();

    return (
        <Card sx={{ 
            mb: 4, 
            borderRadius: 4, 
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar sx={{ 
                        width: 80, 
                        height: 80,
                        background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                        fontSize: 32,
                        fontWeight: 700
                    }}>
                        {user.Vorname?.[0]?.toUpperCase() || <PersonIcon />}
                    </Avatar>
                    <Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                            {t('homepage.welcomeBack')} {user.Vorname}!
                        </Typography>
                        <Chip
                            label={t(`roles.${user.role.toLowerCase()}`)}
                            color="primary" 
                            variant="outlined"
                            size="small"
                        />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
