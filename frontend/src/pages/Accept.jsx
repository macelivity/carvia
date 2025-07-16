import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getPendingApplications, updateApplicationStatus } from '../api/api';
import {
  Box, Typography, Paper, Button, Grid, Chip, CircularProgress, Alert, Container, Avatar
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

/**
 * Accept Komponente - Verwaltung von Benutzeranträgen
 * Ermöglicht Administratoren und Mitarbeitern die Annahme oder Ablehnung von Registrierungsanträgen
 */
export default function Accept() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  /**
   * Lädt ausstehende Anträge beim Komponenten-Mount
   */
  useEffect(() => {
    // Zugriffskontrolle: Nur Admins und Mitarbeiter dürfen diese Seite sehen
    if (!user || !['Admin', 'Mitarbeiter'].includes(user?.role)) {
      navigate('/');
      return;
    }
    
    const fetchApplications = async () => {
      try {
        const response = await getPendingApplications();
        setApplications(response.data);
      } catch (error) {
        setError(t('applications.fetchError'));
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user, navigate, t]);

  /**
   * Behandelt die Annahme oder Ablehnung eines Antrags
   * @param {number} user_id - ID des Benutzers
   * @param {boolean} accepted - True für Annahme, false für Ablehnung
   */
  const handleAction = async (user_id, accepted) => {
    setActionLoading(user_id);
    setError('');
    try {
      await updateApplicationStatus(user_id, accepted);
      // Entferne den bearbeiteten Antrag aus der Liste
      setApplications(applications.filter(u => u.UserID !== user_id));
    } catch (error) {
      setError(t('applications.actionError'));
    } finally {
      setActionLoading(null);
    }
  };

  // Lade-Status anzeigen
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  // Fehler-Status anzeigen
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Header-Bereich */}
        <Paper sx={{
          p: 4,
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
          textAlign: 'center'
        }}>
          <Avatar sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
          }}>
            <PersonAddIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            {t('applications.title')}
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>
            {t('applications.subtitle', 'Verwalten Sie ausstehende Registrierungsanträge')}
          </Typography>
        </Paper>

        {/* Anträge-Liste */}
        {applications.length === 0 ? (
          <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {t('applications.noApplications')}
            </Alert>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {applications.map(app => (
              <Grid item xs={12} lg={6} key={app.UserID}>
                <Paper sx={{ 
                  p: 3, 
                  mt: 3, // Oberen Abstand hinzufügen
                  borderRadius: 4, 
                  boxShadow: 4,
                  background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 6
                  }
                }}>
                  {/* Benutzer-Informationen */}
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {app.Vorname} {app.Nachname} ({app.Username})
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('applications.email')}:</strong> {app.Email}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('applications.birthdate')}:</strong> {app.Geburtsdatum}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>{t('applications.address')}:</strong> {app.Strasse} {app.HausNummer}, {app.PLZ} {app.Ort}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <strong>{t('applications.bankInfo')}:</strong> {app.IBAN} | {app.BIC}
                    </Typography>
                  </Box>

                  {/* Überprüfungs-Status */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Überprüfungsstatus:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      <Chip 
                        label={app.identitycheck_valid ? t('applications.idCheckOk') : t('applications.idCheckPending')} 
                        color={app.identitycheck_valid ? 'success' : 'warning'} 
                        size="small"
                      />
                      <Chip 
                        label={app.licensecheck_valid ? t('applications.licenseCheckOk') : t('applications.licenseCheckPending')} 
                        color={app.licensecheck_valid ? 'success' : 'warning'} 
                        size="small"
                      />
                      <Chip 
                        label={app.credidworthycheck_valid ? t('applications.creditCheckOk') : t('applications.creditCheckPending')} 
                        color={app.credidworthycheck_valid ? 'success' : 'warning'} 
                        size="small"
                      />
                    </Box>
                  </Box>

                  {/* Aktions-Buttons */}
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button 
                      variant="contained" 
                      color="success" 
                      fullWidth
                      startIcon={<CheckCircleIcon />}
                      disabled={actionLoading === app.UserID} 
                      onClick={() => handleAction(app.UserID, true)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      {t('applications.accept')}
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      fullWidth
                      startIcon={<CancelIcon />}
                      disabled={actionLoading === app.UserID} 
                      onClick={() => handleAction(app.UserID, false)}
                      sx={{
                        py: 1.5,
                        fontWeight: 600,
                        borderRadius: 2
                      }}
                    >
                      {t('applications.deny')}
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
