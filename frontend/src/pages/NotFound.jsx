import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Container, Typography, Button, Box, Paper, Avatar
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HomeIcon from '@mui/icons-material/Home';

/**
 * NotFound Komponente - 404-Fehlerseite
 * Wird angezeigt, wenn eine nicht existierende Route aufgerufen wird
 */
const NotFound = () => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            py: 4
        }}>
            <Container maxWidth="sm">
                <Paper sx={{
                    borderRadius: 4,
                    boxShadow: 6,
                    overflow: 'hidden',
                    background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                    textAlign: 'center'
                }}>
                    {/* Header-Bereich */}
                    <Box sx={{
                        background: 'linear-gradient(90deg, #f44336 0%, #e57373 100%)',
                        color: 'white',
                        p: 6
                    }}>
                        <Avatar sx={{
                            width: 120,
                            height: 120,
                            mx: 'auto',
                            mb: 3,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            fontSize: 60
                        }}>
                            <ErrorOutlineIcon sx={{ fontSize: 60 }} />
                        </Avatar>
                        <Typography variant="h1" sx={{ 
                            fontWeight: 800, 
                            mb: 2,
                            fontSize: { xs: '4rem', sm: '6rem' },
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            404
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                            {t('notFound.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {t('notFound.message')}
                        </Typography>
                    </Box>

                    {/* Inhalt-Bereich */}
                    <Box sx={{ p: 6 }}>
                        <Typography variant="body1" sx={{ 
                            color: 'text.secondary', 
                            mb: 4,
                            fontSize: '1.1rem'
                        }}>
                            {t('notFound.description')}
                        </Typography>
                        
                        <Button
                            component={Link}
                            to="/"
                            variant="contained"
                            size="large"
                            startIcon={<HomeIcon />}
                            sx={{
                                py: 1.5,
                                px: 4,
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
                            {t('notFound.backHome')}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default NotFound;
