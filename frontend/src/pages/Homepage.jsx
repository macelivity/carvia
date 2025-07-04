import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Container, Typography, Button, Card, CardContent, Box, Grid,
  Paper, Avatar, IconButton, Chip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Homepage() {
    const { t } = useTranslation();
    const { user } = useAuth();

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            py: 4
        }}>
            <Container maxWidth="lg">
                {/* Hero Section */}
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

                {user.role === "guest" ? (
                    <>
                        {/* Guest Welcome Card */}
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
                                    <Grid item xs={12} sm={6} md={4}>
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
                                    <Grid item xs={12} sm={6} md={4}>
                                        <Button
                                            component={Link}
                                            to="/register"
                                            variant="contained"
                                            size="large"
                                            fullWidth
                                            startIcon={<PersonAddIcon />}
                                            sx={{
                                                py: 2,
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
                                            {t('homepage.registerButton')}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <>
                        {/* User Welcome Card */}
                        <Card sx={{ 
                            mb: 4, 
                            borderRadius: 4, 
                            boxShadow: 6,
                            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                    <Avatar sx={{ 
                                        width: 64, 
                                        height: 64, 
                                        mr: 3,
                                        background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                                        fontSize: 24,
                                        fontWeight: 700
                                    }}>
                                        {user.username?.[0]?.toUpperCase() || <PersonIcon />}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 0.5 }}>
                                            {t('homepage.welcomeBack')} {user.username}!
                                        </Typography>
                                        <Chip 
                                            label={user.role} 
                                            color="primary" 
                                            variant="outlined"
                                            size="small"
                                        />
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Main Action Cards */}
                        <Grid container spacing={4} sx={{ mb: 4 }}>
                            {/* Make New Reservation Card */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    height: '100%',
                                    borderRadius: 4, 
                                    boxShadow: 4,
                                    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)'
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
                                            sx={{
                                                py: 2,
                                                fontWeight: 700,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                                boxShadow: 3
                                            }}
                                        >
                                            {t('homepage.startSearch')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* See Reservations Card */}
                            <Grid item xs={12} md={6}>
                                <Card sx={{ 
                                    height: '100%',
                                    borderRadius: 4, 
                                    boxShadow: 4,
                                    background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        boxShadow: 8,
                                        transform: 'translateY(-4px)'
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
                                            sx={{
                                                py: 2,
                                                fontWeight: 700,
                                                borderRadius: 3,
                                                background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                                                boxShadow: 3
                                            }}
                                        >
                                            {t('homepage.viewReservations')}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Admin/Staff Card */}
                        {(user.role === 'Mitarbeiter' || user.role === 'Admin') && (
                            <Card sx={{ 
                                mb: 4, 
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
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00', mb: 2 }}>
                                        {t('homepage.adminTools')}
                                    </Typography>
                                    <Button
                                        component={Link}
                                        to="/vehicle-management"
                                        variant="contained"
                                        startIcon={<AdminPanelSettingsIcon />}
                                        sx={{
                                            fontWeight: 700,
                                            borderRadius: 3,
                                            background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                                            boxShadow: 3
                                        }}
                                    >
                                        {t('homepage.vehicleManagementButton')}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                {/* Quick Actions Section */}
                <Paper sx={{ 
                    p: 4, 
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
            </Container>
        </Box>
    );
}
