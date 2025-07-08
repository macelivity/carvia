import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { getCoordinatesFromCity, getAllVehicles } from '../api/api';
import L from 'leaflet';
import {
    Container,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Box,
    Avatar,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
    Chip
} from '@mui/material';
import {
    DirectionsCar as DirectionsCarIcon,
    Search as SearchIcon,
    LocationOn as LocationOnIcon,
    ArrowBackIos as ArrowBackIosIcon,
    ArrowForwardIos as ArrowForwardIosIcon,
    Login as LoginIcon,
    CalendarToday as CalendarTodayIcon,
    Speed as SpeedIcon,
    People as PeopleIcon,
    LocalGasStation as LocalGasStationIcon,
    CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Main Vehicles Component
export default function Vehicles() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch vehicles data
    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const response = await getAllVehicles();
                const vehiclesWithCoords = response.data.map((vehicle, index) => ({
                    ...vehicle,
                    latitude: vehicle.latitude || (53.0793 + (Math.random() - 0.5) * 0.1),
                    longitude: vehicle.longitude || (8.8017 + (Math.random() - 0.5) * 0.1)
                }));
                setVehicles(vehiclesWithCoords);
            } catch (err) {
                console.error('Error fetching vehicles:', err);
                setError('Fehler beim Laden der Fahrzeuge');
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            py: 4
        }}>
            <Container maxWidth="xl" sx={{ px: 0 }}>
                {/* Hero Section */}
                <HeroSection t={t} />
                {/* Main Content Grid */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Grid container spacing={2} sx={{ mb: 6, flexWrap: { xs: 'wrap', lg: 'nowrap' }, overflowX: { xs: 'visible', lg: 'auto' }, alignItems: 'stretch', maxWidth: '1300px', width: '100%' }}>
                      <Grid item xs={12} lg={'auto'} sx={{ flex: { lg: '0 0 420px' }, maxWidth: { lg: '420px' }, minWidth: { lg: '420px' }, height: 'auto' }}>
                          <LocationSearchCard vehicles={vehicles} loading={loading} error={error} t={t} />
                      </Grid>
                      <Grid item xs={12} lg={'auto'} sx={{ flex: { lg: '0 0 420px' }, maxWidth: { lg: '420px' }, minWidth: { lg: '420px' }, height: 'auto' }}>
                          <VehicleCarouselCard vehicles={vehicles} loading={loading} error={error} t={t} />
                      </Grid>
                      <Grid item xs={12} lg={'auto'} sx={{ flex: { lg: '0 0 420px' }, maxWidth: { lg: '420px' }, minWidth: { lg: '420px' }, height: 'auto' }}>
                          <HowItWorksCard t={t} />
                      </Grid>
                  </Grid>
                </Box>
                {/* Call to Action Section - align with above cards */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: 0 }}>
                    <Box sx={{ maxWidth: '1300px', width: '100%' }}>
                        <CallToActionCard user={user} t={t} />
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}

// Hero Section Component
const HeroSection = ({ t }) => (
    <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Avatar sx={{ 
            width: 100, 
            height: 100, 
            mx: 'auto', 
            mb: 3,
            background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
        }}>
            <DirectionsCarIcon sx={{ fontSize: 50 }} />
        </Avatar>
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
            {t('vehicles.title') || 'Unsere Fahrzeuge'}
        </Typography>
        <Typography 
            variant="h5" 
            sx={{ 
                color: 'rgba(255,255,255,0.9)', 
                mb: 4,
                fontWeight: 300,
                fontSize: { xs: '1.2rem', md: '1.5rem' },
                maxWidth: '800px',
                mx: 'auto'
            }}
        >
            {t('vehicles.description') || 'Entdecke unsere vielfältige Fahrzeugflotte und finde das perfekte Auto für deine Bedürfnisse'}
        </Typography>
    </Box>
);

// Location Search Card Component
const LocationSearchCard = ({ vehicles, loading, error, t }) => {
    const [city, setCity] = useState('');
    const [searchCoords, setSearchCoords] = useState({ lat: 53.0793, lon: 8.8017 });
    const [isSearching, setIsSearching] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const [searchStatus, setSearchStatus] = useState('');

    const handleLocationSearch = async () => {
        if (!city.trim()) {
            setSearchStatus('error');
            setTimeout(() => setSearchStatus(''), 2000);
            return;
        }
        
        setIsSearching(true);
        try {
            const result = await getCoordinatesFromCity(city.trim());
            if (result && result.lat && result.lon) {
                setSearchCoords({ lat: result.lat, lon: result.lon });
                setMapKey(prev => prev + 1);
                setSearchStatus('success');
            } else {
                setSearchStatus('error');
            }
        } catch (error) {
            console.error('Location search error:', error);
            setSearchStatus('error');
        } finally {
            setIsSearching(false);
            setTimeout(() => setSearchStatus(''), 2000);
        }
    };

    const validMarkers = vehicles.filter(v => 
        typeof v.latitude === 'number' && typeof v.longitude === 'number'
    );

    return (
        <Card sx={{ 
            height: '100%',
            borderRadius: 4, 
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <LoadingState message={t('vehicles.loadingVehicles') || 'Fahrzeuge werden geladen...'} />
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                            {t('vehicles.findVehiclesNearYou') || 'Finde Fahrzeuge in deiner Nähe'}
                        </Typography>
                        
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label={t('vehicles.cityLabel') || 'Stadt'}
                                    placeholder={t('vehicles.cityPlaceholder') || 'Bremen'}
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleLocationSearch()}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocationOnIcon color="primary" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': { 
                                            borderRadius: 2,
                                            background: 'white',
                                            ...(searchStatus === 'success' && {
                                                '& fieldset': { borderColor: '#4caf50', borderWidth: '2px' }
                                            }),
                                            ...(searchStatus === 'error' && {
                                                '& fieldset': { borderColor: '#f44336', borderWidth: '2px' }
                                            })
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    onClick={handleLocationSearch}
                                    disabled={isSearching}
                                    sx={{
                                        px: 3,
                                        borderRadius: 2,
                                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                                    }}
                                >
                                    {isSearching ? <CircularProgress size={24} color="inherit" /> : <SearchIcon />}
                                </Button>
                            </Box>
                        </Box>

                        <Box sx={{ flex: 1, height: 400, borderRadius: 3, overflow: 'hidden', boxShadow: 3 }}>
                            <MapContainer 
                                key={mapKey}
                                center={[searchCoords.lat, searchCoords.lon]} 
                                zoom={12} 
                                scrollWheelZoom={true} 
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                
                                <Marker	
                                    position={[searchCoords.lat, searchCoords.lon]}
                                    icon={L.icon({
                                        iconUrl: '/icons/pickup-marker.svg',
                                        iconSize: [48, 48],
                                        iconAnchor: [24, 48]
                                    })}
                                >
                                    <Popup>{city || t('vehicles.yourLocation') || 'Ihr Standort'}</Popup>
                                </Marker>

                                {validMarkers.slice(0, 10).map(car => (
                                    <Marker 
                                        key={car.FahrzeugID} 
                                        position={[car.latitude, car.longitude]}
                                        icon={L.icon({
                                            iconUrl: '/icons/car-marker.svg',
                                            iconSize: [40, 40],
                                            iconAnchor: [20, 40]
                                        })}
                                    >
                                        <Popup>
                                            <b>{car.Hersteller} {car.ModellName}</b><br/>
                                            {car.Stundenpreis}€/h<br/>
                                            <small>{car.Fahrzeugtyp}</small>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// Vehicle Carousel Card Component
const VehicleCarouselCard = ({ vehicles, loading, error, t }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const vehiclesPerPage = 3; // Show three vehicles at a time
    const cardHeight = 120; // match compact VehicleCard height

    const nextSlide = () => {
        const maxIndex = Math.max(0, vehicles.length - vehiclesPerPage);
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + vehiclesPerPage));
    };

    const prevSlide = () => {
        const maxIndex = Math.max(0, vehicles.length - vehiclesPerPage);
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : Math.max(0, prev - vehiclesPerPage)));
    };

    const getCurrentVehicles = () => {
        return vehicles.slice(currentIndex, currentIndex + vehiclesPerPage);
    };

    return (
        <Card sx={{
            height: '100%',
            width: '100%',
            minWidth: 0,
            borderRadius: 4,
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
        }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                {loading ? (
                    <LoadingState message={t('vehicles.loadingVehicleData') || 'Fahrzeugdaten werden geladen...'} />
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                ) : (
                    <>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                            {t('vehicles.ourFleet') || 'Unsere Fahrzeugflotte'}
                        </Typography>
                        {vehicles.length > 0 && (
                            <>
                                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', width: '100%', minHeight: 0, gap: 1.5 }}>
                                    {getCurrentVehicles().map((vehicle, index) => (
                                        <Box key={vehicle.FahrzeugID || index} sx={{ width: '100%', height: `${cardHeight}px`, minHeight: `${cardHeight}px`, maxHeight: `${cardHeight}px` }}>
                                            <VehicleCard vehicle={vehicle} compact={true} t={t} />
                                        </Box>
                                    ))}
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center', mt: 3 }}>
                                    <IconButton 
                                        onClick={prevSlide} 
                                        disabled={vehicles.length <= vehiclesPerPage}
                                        sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            '&:disabled': { bgcolor: 'grey.300' },
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        <ArrowBackIosIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mx: 2 }}>
                                        {t('vehicles.carouselCount', { shown: Math.min(currentIndex + vehiclesPerPage, vehicles.length), total: vehicles.length }) !== 'vehicles.carouselCount'
                                            ? t('vehicles.carouselCount', { shown: Math.min(currentIndex + vehiclesPerPage, vehicles.length), total: vehicles.length })
                                            : `${Math.min(currentIndex + vehiclesPerPage, vehicles.length)} / ${vehicles.length}`
                                        }
                                    </Typography>
                                    <IconButton 
                                        onClick={nextSlide} 
                                        disabled={vehicles.length <= vehiclesPerPage}
                                        sx={{ 
                                            bgcolor: 'primary.main', 
                                            color: 'white',
                                            '&:hover': { bgcolor: 'primary.dark' },
                                            '&:disabled': { bgcolor: 'grey.300' },
                                            width: 36,
                                            height: 36
                                        }}
                                    >
                                        <ArrowForwardIosIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

// Individual Vehicle Card Component
const VehicleCard = ({ vehicle, compact = false, t }) => (
    <Card sx={{ 
        background: 'linear-gradient(120deg, #f5faff 0%, #e3f2fd 100%)',
        borderRadius: 3,
        boxShadow: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
            boxShadow: 6,
            transform: 'translateY(-2px)'
        },
        width: '100%',
        minWidth: 0,
        height: compact ? '120px' : '180px',
        minHeight: compact ? '120px' : '180px',
        maxHeight: compact ? '120px' : '180px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
    }}>
        <CardContent sx={{ p: compact ? 1.5 : 3, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: compact ? 1 : 2, width: '100%' }}>
                <Avatar sx={{ 
                    width: compact ? 28 : 40, 
                    height: compact ? 28 : 40, 
                    mr: compact ? 1 : 2,
                    background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)'
                }}>
                    <DirectionsCarIcon sx={{ fontSize: compact ? 14 : 20 }} />
                </Avatar>
                <Box sx={{ flex: 1, width: '100%', minWidth: 0 }}>
                    <Typography variant={compact ? "body1" : "h6"} sx={{ fontWeight: 700, color: 'primary.main', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {vehicle.Hersteller} {vehicle.ModellName}
                    </Typography>
                    <Typography variant={compact ? "caption" : "body2"} sx={{ color: 'text.secondary', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                        {vehicle.Fahrzeugtyp}
                    </Typography>
                </Box>
                {/* Price aligned to the right */}
                <Box sx={{ 
                    textAlign: 'right', 
                    minWidth: compact ? '60px' : '80px'
                }}>
                    <Typography variant={compact ? "h6" : "h5"} sx={{ fontWeight: 700, color: '#2e7d32', lineHeight: 1 }}>
                        {vehicle.Stundenpreis}€/h
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {t ? (t('vehicles.pricePerHour') || 'Stundenpreis') : 'Stundenpreis'}
                    </Typography>
                </Box>
            </Box>
            {/* Features in a horizontal layout */}
            <Box sx={{ display: 'flex', gap: compact ? 1 : 1.5, width: '100%', flexWrap: 'wrap' }}>
                <VehicleFeature icon={<PeopleIcon />} label={t ? (t('vehicles.seats') || 'Sitze') : 'Sitze'} value={`${vehicle.Sitze}`} compact={compact} />
                <VehicleFeature icon={<SpeedIcon />} label={t ? (t('vehicles.transmission') || 'Getriebe') : 'Getriebe'} value={vehicle.Getriebeart} compact={compact} />
                <VehicleFeature icon={<LocalGasStationIcon />} label={t ? (t('vehicles.fuelType') || 'Kraftstoff') : 'Kraftstoff'} value={vehicle.Kraftstoffart} compact={compact} />
            </Box>
        </CardContent>
    </Card>
);

// Vehicle Feature Component
const VehicleFeature = ({ icon, label, value, compact = false }) => (
    <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: compact ? 0.4 : 0.8, 
        borderRadius: 1.5, 
        backgroundColor: 'rgba(25, 118, 210, 0.08)',
        minWidth: 'fit-content',
        flex: 1
    }}>
        <Box sx={{ color: 'primary.main', mr: 0.5 }}>
            {React.cloneElement(icon, { sx: { fontSize: compact ? 12 : 16 } })}
        </Box>
        <Typography variant={compact ? "caption" : "body2"} sx={{ color: 'primary.main', fontWeight: 600, fontSize: compact ? '0.7rem' : '0.875rem' }}>
            {value}
        </Typography>
    </Box>
);

// How It Works Card Component
const HowItWorksCard = ({ t }) => {
    const steps = [
        {
            title: t('vehicles.step1Title') || 'Fahrzeug finden',
            description: t('vehicles.step1Desc') || 'Nutze die Karte oder suche nach deiner Stadt, um verfügbare Fahrzeuge in der Nähe zu finden.',
            color: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
        },
        {
            title: t('vehicles.step2Title') || 'Reservierung',
            description: t('vehicles.step2Desc') || 'Wähle dein gewünschtes Fahrzeug und den Zeitraum aus. Buche schnell und einfach online.',
            color: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
        },
        {
            title: t('vehicles.step3Title') || 'Losfahren',
            description: t('vehicles.step3Desc') || 'Öffne das Fahrzeug mit der App, führe eine kurze Überprüfung durch und starte deine Fahrt.',
            color: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)'
        },
        {
            title: t('vehicles.step4Title') || 'Zurückgeben',
            description: t('vehicles.step4Desc') || 'Parkiere das Fahrzeug am vereinbarten Ort und beende die Fahrt in der App. Fertig!',
            color: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)'
        }
    ];

    return (
        <Card sx={{ 
            height: '100%',
            borderRadius: 4, 
            boxShadow: 6,
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
            <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
                    {t('vehicles.howItWorks') || 'So funktioniert\'s'}
                </Typography>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {steps.map((step, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Avatar sx={{ 
                                width: 40, 
                                height: 40,
                                background: step.color,
                                fontWeight: 700,
                                fontSize: '1.1rem'
                            }}>
                                {index + 1}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>
                                    {step.title}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                                    {step.description}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Box>
                
                {/* Benefits Section */}
                <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    borderRadius: 2, 
                    background: 'linear-gradient(120deg, rgba(25, 118, 210, 0.08) 0%, rgba(66, 165, 245, 0.05) 100%)' 
                }}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        <Chip icon={<CheckCircleIcon />} label={t('vehicles.noDeposit') || 'Keine Anzahlung'} color="primary" variant="outlined" />
                        <Chip icon={<CheckCircleIcon />} label={t('vehicles.flexibleBooking') || 'Flexible Buchung'} color="primary" variant="outlined" />
                        <Chip icon={<CheckCircleIcon />} label={t('vehicles.available247') || '24/7 Verfügbar'} color="primary" variant="outlined" />
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

// Call to Action Card Component
const CallToActionCard = ({ user, t }) => (
    <Paper sx={{ 
        p: 6, 
        borderRadius: 4, 
        boxShadow: 6,
        background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
        textAlign: 'center'
    }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: 'primary.main', mb: 2 }}>
            {t('vehicles.readyToStart') || 'Bereit durchzustarten?'}
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 4 }}>
            {user.role === 'guest' 
                ? (t('vehicles.getStartedGuest') || 'Melde dich an oder registriere dich, um ein Fahrzeug zu reservieren')
                : (t('vehicles.getStartedMember') || 'Starte jetzt deine nächste Reservierung')
            }
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
            {user.role === 'guest' ? (
                <>
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        sx={{
                            py: 2,
                            px: 4,
                            fontWeight: 700,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                            boxShadow: 3,
                            '&:hover': {
                                boxShadow: 6,
                                transform: 'translateY(-2px)'
                            },
                            transition: 'all 0.3s ease',
                            minWidth: '200px'
                        }}
                    >
                        {t('vehicles.loginToBook') || 'Zur Anmeldung'}
                    </Button>
                    <Button
                        component={Link}
                        to="/register"
                        variant="outlined"
                        size="large"
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
                            transition: 'all 0.3s ease',
                            minWidth: '200px'
                        }}
                    >
                        {t('vehicles.registerNow') || 'Jetzt Registrieren'}
                    </Button>
                </>
            ) : (
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
                    {t('homepage.createReservationButton', 'Create Reservation')}
                </Button>
            )}
        </Box>
    </Paper>
);

// Loading State Component
const LoadingState = ({ message }) => (
    <Box sx={{ textAlign: 'center', py: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            {message}
        </Typography>
    </Box>
);
