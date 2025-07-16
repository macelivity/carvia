/**
 * Datenschutzseite - Zeigt die Datenschutzerklärung der Anwendung
 * Informiert Benutzer über Datensammlung, -verarbeitung und -schutz
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Typography, Paper, Box } from '@mui/material';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';

/**
 * Komponente: Datenschutz-Abschnitt
 * Stellt einen einzelnen Abschnitt der Datenschutzerklärung dar
 */
function PrivacySection({ title, content }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {title}
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, color: 'text.secondary' }}>
                {content.split('\\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        {index < content.split('\\n').length - 1 && <br />}
                    </React.Fragment>
                ))}
            </Typography>
        </Box>
    );
}

/**
 * Hauptkomponente: Datenschutzseite
 * Zeigt alle Abschnitte der Datenschutzerklärung in einem strukturierten Layout
 */
const Datenschutz = () => {
    const { t } = useTranslation();
    
    // Datenschutz-Abschnitte konfigurieren
    const privacySections = [
        {
            title: t('datenschutz.section1Title'),
            content: t('datenschutz.section1Content')
        },
        {
            title: t('datenschutz.section2Title'),
            content: t('datenschutz.section2Content')
        },
        {
            title: t('datenschutz.section3Title'),
            content: t('datenschutz.section3Content')
        },
        {
            title: t('datenschutz.section4Title'),
            content: t('datenschutz.section4Content')
        },
        {
            title: t('datenschutz.section5Title'),
            content: t('datenschutz.section5Content')
        },
        {
            title: t('datenschutz.section6Title'),
            content: t('datenschutz.section6Content')
        }
    ];
    
    return (
        <Box sx={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            py: 6
        }}>
            <Container maxWidth="md">
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
                        <PrivacyTipIcon sx={{ fontSize: 48, mb: 2 }} />
                        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                            {t('datenschutz.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {t('datenschutz.subtitle')}
                        </Typography>
                    </Box>

                    {/* Datenschutz-Inhalt */}
                    <Box sx={{ p: 4 }}>
                        {privacySections.map((section, index) => (
                            <PrivacySection 
                                key={index}
                                title={section.title}
                                content={section.content}
                            />
                        ))}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Datenschutz;