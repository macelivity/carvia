import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { getPendingApplications, updateApplicationStatus } from '../api/api';
import {
  Box, Typography, Paper, Button, Grid, Chip, CircularProgress, Alert
} from '@mui/material';

export default function Accept() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
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
  }, [user, navigate]);

  const handleAction = async (user_id, accepted) => {
    setActionLoading(user_id);
    setError('');
    try {
      await updateApplicationStatus(user_id, accepted);
      setApplications(applications.filter(u => u.UserID !== user_id));
    } catch (error) {
      setError(t('applications.actionError'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>{t('applications.title')}</Typography>
      {applications.length === 0 ? (
        <Alert severity="info">{t('applications.noApplications')}</Alert>
      ) : (
        <Grid container spacing={3}>
          {applications.map(app => (
            <Grid item xs={12} md={6} key={app.UserID}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6">{app.Vorname} {app.Nachname} ({app.Username})</Typography>
                <Typography>{t('applications.email')}: {app.Email}</Typography>
                <Typography>{t('applications.birthdate')}: {app.Geburtsdatum}</Typography>
                <Typography>{t('applications.address')}: {app.Strasse} {app.HausNummer}, {app.PLZ} {app.Ort}</Typography>
                <Typography>{t('applications.bankInfo')}: {app.IBAN} | {app.BIC}</Typography>
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Chip 
                    label={app.identitycheck_valid ? t('applications.idCheckOk') : t('applications.idCheckPending')} 
                    color={app.identitycheck_valid ? 'success' : 'warning'} 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={app.licensecheck_valid ? t('applications.licenseCheckOk') : t('applications.licenseCheckPending')} 
                    color={app.licensecheck_valid ? 'success' : 'warning'} 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={app.credidworthycheck_valid ? t('applications.creditCheckOk') : t('applications.creditCheckPending')} 
                    color={app.credidworthycheck_valid ? 'success' : 'warning'} 
                  />
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Button 
                    variant="contained" 
                    color="success" 
                    sx={{ mr: 2 }} 
                    disabled={actionLoading === app.UserID} 
                    onClick={() => handleAction(app.UserID, true)}
                  >
                    {t('applications.accept')}
                  </Button>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    disabled={actionLoading === app.UserID} 
                    onClick={() => handleAction(app.UserID, false)}
                  >
                    {t('applications.deny')}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
