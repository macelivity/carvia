import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card, CardContent, Typography, Button, Box, Grid, Avatar
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * GuestWelcomeCard Komponente - Begrüßungskarte für nicht angemeldete Benutzer
 */
export default function GuestWelcomeCard() {
    const { t } = useTranslation();

    return (
        <Card sx={{ 
            mb: 4, 
            borderRadius: 4, 
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
            <CardContent sx={{ p: 4 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Avatar sx={{ 
                        width: 80, 
                        height: 80, 
                        mx: 'auto', 
                        mb: 2,
                        background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
                    }}>
                        <DirectionsCarIcon sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                        {t('homepage.forGuests')}
                    </Typography>
                </Box>
                
                <Grid container spacing={3} justifyContent="center">
                    {/* Login Button */}
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/login"
                            variant="contained"
                            size="large"
                            fullWidth
                            startIcon={<LoginIcon />}
                            sx={{
                                py: 2,
                                fontWeight: 700,
                                borderRadius: 3,
                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                boxShadow: 3,
                                '&:hover': {
                                    boxShadow: 6,
                                    transform: 'translateY(-2px)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('homepage.loginButton')}
                        </Button>
                    </Grid>
                    
                    {/* Register Button */}
                    <Grid item xs={12} sm={6}>
                        <Button
                            component={Link}
                            to="/register"
                            variant="outlined"
                            size="large"
                            fullWidth
                            startIcon={<PersonAddIcon />}
                            sx={{
                                py: 2,
                                fontWeight: 700,
                                borderRadius: 3,
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                boxShadow: 1,
                                '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)',
                                    borderColor: 'primary.dark',
                                    background: 'rgba(25, 118, 210, 0.04)'
                                },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {t('homepage.registerButton')}
                        </Button>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
