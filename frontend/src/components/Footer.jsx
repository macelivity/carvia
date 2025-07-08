import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box, Container, Typography, Paper, Divider, IconButton, Chip
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import InfoIcon from '@mui/icons-material/Info';

const Footer = () => {
    const { t } = useTranslation();
    
    return (
        <Paper 
            component="footer" 
            elevation={8}
            sx={{ 
                mt: 'auto',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                color: 'white'
            }}
        >
            <Container maxWidth="lg">
                <Box sx={{ py: 4 }}>
                    {/* Main Footer Content */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 3
                    }}>
                        {/* Brand Section */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: { xs: 3, md: 0 }
                        }}>
                            <IconButton 
                                sx={{ 
                                    mr: 2, 
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'white',
                                    '&:hover': {
                                        background: 'rgba(255,255,255,0.2)'
                                    }
                                }}
                            >
                                <DirectionsCarIcon sx={{ fontSize: 28 }} />
                            </IconButton>
                            <Typography 
                                variant="h5" 
                                sx={{ 
                                    fontWeight: 700,
                                    letterSpacing: 1.2
                                }}
                            >
                                CarVia
                            </Typography>
                        </Box>

                        {/* Links Section */}
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            gap: 3,
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                        }}>
                            <Chip
                                component={Link}
                                to="/datenschutz"
                                icon={<PrivacyTipIcon />}
                                label={t('footer.privacy')}
                                variant="outlined"
                                clickable
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        background: 'rgba(255,255,255,0.1)'
                                    },
                                    '& .MuiChip-icon': {
                                        color: 'white'
                                    }
                                }}
                            />
                            
                            <Chip
                                component={Link}
                                to="/impressum"
                                icon={<InfoIcon />}
                                label={t('footer.imprint')}
                                variant="outlined"
                                clickable
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.3)',
                                    '&:hover': {
                                        borderColor: 'white',
                                        background: 'rgba(255,255,255,0.1)'
                                    },
                                    '& .MuiChip-icon': {
                                        color: 'white'
                                    }
                                }}
                            />
                        </Box>
                    </Box>

                    <Divider sx={{ 
                        borderColor: 'rgba(255,255,255,0.2)', 
                        mb: 2 
                    }} />

                    {/* Copyright Section */}
                    <Box sx={{ textAlign: 'center' }}>
                        <Typography 
                            variant="body2" 
                            sx={{ 
                                color: 'rgba(255,255,255,0.8)',
                                fontWeight: 300
                            }}
                        >
                            © {new Date().getFullYear()} CarVia. {t('footer.allRightsReserved')}
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Paper>
    );
};

export default Footer;