/**
 * Impressumsseite - Zeigt rechtliche Informationen und Kontaktdaten
 * Erfüllt gesetzliche Anforderungen für kommerzielle Websites
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Paper, Box, Grid } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import BusinessIcon from '@mui/icons-material/Business';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

/**
 * Komponente: Impressums-Abschnitt
 * Stellt einen einzelnen Abschnitt des Impressums dar
 */
function ImpressumSection({ icon, title, content, isContact = false }) {
    return (
        <Box sx={{ 
            p: 3, 
            background: 'rgba(255,255,255,0.6)', 
            borderRadius: 3,
            height: '100%'
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                {icon}
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', ml: 1 }}>
                    {title}
                </Typography>
            </Box>
            <Typography 
                variant="body1" 
                sx={{ 
                    lineHeight: 1.6, 
                    color: 'text.secondary',
                    whiteSpace: 'pre-line'
                }}
            >
                {content}
            </Typography>
        </Box>
    );
}

/**
 * Hauptkomponente: Impressumsseite  
 * Zeigt alle rechtlichen Informationen in einem strukturierten Layout
 */
const Impressum = () => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            py: 6
        }}>
            <Container maxWidth="lg">
                <Paper sx={{
                    borderRadius: 4,
                    boxShadow: 6,
                    overflow: 'hidden',
                    background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
                }}>
                    {/* Header */}
                    <Box sx={{
                        background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                        color: 'white',
                        p: 4,
                        textAlign: 'center'
                    }}>
                        <InfoIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {t('impressum.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {t('impressum.subtitle')}
                        </Typography>
                    </Box>

                    {/* Impressums-Inhalt */}
                    <Box sx={{ p: 4 }}>
                        <Grid container spacing={3}>
                            {/* Firmeninformationen */}
                            <Grid item xs={12} md={6}>
                                <ImpressumSection
                                    icon={<BusinessIcon color="primary" />}
                                    title={t('impressum.legalInfo')}
                                    content={`${t('impressum.companyName')}\n${t('impressum.address')}\n${t('impressum.city')}\n${t('impressum.country')}`}
                                />
                            </Grid>

                            {/* Vertretung */}
                            <Grid item xs={12} md={6}>
                                <ImpressumSection
                                    icon={<ContactPhoneIcon color="primary" />}
                                    title={t('impressum.representedBy')}
                                    content={`${t('impressum.representative')}\n\n${t('impressum.contact')}\n${t('impressum.phone')}\n${t('impressum.email')}`}
                                />
                            </Grid>

                            {/* Handelsregister */}
                            <Grid item xs={12} md={6}>
                                <ImpressumSection
                                    icon={<AccountBalanceIcon color="primary" />}
                                    title={t('impressum.commercialRegister')}
                                    content={`${t('impressum.registerEntry')}\n${t('impressum.registerCourt')}\n${t('impressum.registerNumber')}`}
                                />
                            </Grid>

                            {/* Steuerliche Angaben */}
                            <Grid item xs={12} md={6}>
                                <ImpressumSection
                                    icon={<InfoIcon color="primary" />}
                                    title={t('impressum.vatId')}
                                    content={`${t('impressum.vatNumber')}\n${t('impressum.vatNumberValue')}`}
                                />
                            </Grid>

                            {/* Verantwortlich für Inhalte */}
                            <Grid item xs={12}>
                                <ImpressumSection
                                    icon={<BusinessIcon color="primary" />}
                                    title={t('impressum.responsibleContent')}
                                    content={`${t('impressum.responsiblePerson')}\n${t('impressum.address')}\n${t('impressum.city')}`}
                                />
                            </Grid>
                        </Grid>

                        {/* Disclaimer */}
                        <Box sx={{ 
                            mt: 4, 
                            p: 3, 
                            background: 'rgba(25, 118, 210, 0.1)', 
                            borderRadius: 3,
                            border: '1px solid rgba(25, 118, 210, 0.2)'
                        }}>
                            <Typography variant="body2" sx={{ 
                                color: 'text.secondary',
                                fontStyle: 'italic',
                                textAlign: 'center'
                            }}>
                                {t('impressum.disclaimer')}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Impressum;