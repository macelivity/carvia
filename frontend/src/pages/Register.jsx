/**
 * Registrierungsseite - Mehrstufiger Registrierungsprozess für neue Benutzer
 * Sammelt Benutzerdaten, Adresse, Bankdaten und führt Dokumentenverifikation durch
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Container, Paper, Typography, Button, TextField, Stepper, Step, StepLabel, Box, LinearProgress, Alert, Fade, Collapse
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { checkCreditworthiness, register } from '../api/api';

// Registrierungsschritte definieren
const steps = [
  'register.steps.account',
  'register.steps.personal',
  'register.steps.address',
  'register.steps.billing',
  'register.steps.verification'
];

// Upload-Felder für Dokumentenverifikation
const uploadFields = [
  { name: 'idFront', labelKey: 'register.uploads.idFront', endpoint: '/api/accounts/identitycheck' },
  { name: 'idBack', labelKey: 'register.uploads.idBack', endpoint: '/api/accounts/identitycheck' },
  { name: 'licenseFront', labelKey: 'register.uploads.licenseFront', endpoint: '/api/accounts/licencecheck' },
  { name: 'licenseBack', labelKey: 'register.uploads.licenseBack', endpoint: '/api/accounts/licencecheck' }
];

/**
 * Hauptkomponente: Registrierungsformular
 * Verwaltet den mehrstufigen Registrierungsprozess mit Validierung und Dokumentenupload
 */
export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Aktueller Schritt im Registrierungsprozess
  const [activeStep, setActiveStep] = useState(0);

  // Formulardaten für alle Schritte
  const [form, setForm] = useState({
    email: '', username: '', password: '', passwordConfirm: '',
    vorname: '', nachname: '', geburtsdatum: '',
    plz: '', ort: '', strasse: '', hausnummer: '',
    iban: '', bic: '',
    idFront: null, idBack: null, licenseFront: null, licenseBack: null
  });

  // Zustandsvariablen für UI-Feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    idFront: 0, idBack: 0, licenseFront: 0, licenseBack: 0
  });
  const [uploadSuccess, setUploadSuccess] = useState({
    idFront: false, idBack: false, licenseFront: false, licenseBack: false
  });

  /**
   * Handler für Formularfeld-Änderungen
   * Behandelt sowohl Textfelder als auch Datei-Uploads
   */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      handleFileUpload(name, files[0]);
    } else {
      setForm(f => ({ ...f, [name]: value }));
      setError('');
    }
  };

  /**
   * Handler für Datei-Uploads
   * Speichert Datei temporär und markiert Upload als bereit
   */
  const handleFileUpload = (field, file) => {
    setForm(f => ({ ...f, [field]: file }));
    setUploadProgress(p => ({ ...p, [field]: 0 }));
    setUploadSuccess(s => ({ ...s, [field]: true }));
  };

  /**
   * Handler für die Navigation zum nächsten Schritt
   * Validiert die aktuellen Eingaben bevor der nächste Schritt erreicht wird
   */
  const handleNext = async () => {
    setError('');

    // Validierung für jeden Schritt durchführen
    if (activeStep === 0) {
      if (!form.email || !form.username || !form.password || !form.passwordConfirm) {
        setError(t('register.validation.fillAllFields')); return;
      }
      if (form.password.length < 6) {
        setError(t('register.validation.passwordLength')); return;
      }
      if (form.password !== form.passwordConfirm) {
        setError(t('register.validation.passwordMismatch')); return;
      }
    }
    if (activeStep === 1) {
      if (!form.vorname || !form.nachname || !form.geburtsdatum) {
        setError(t('register.validation.fillPersonalInfo')); return;
      }
    }
    if (activeStep === 2) {
      if (!form.plz || !form.ort || !form.strasse || !form.hausnummer) {
        setError(t('register.validation.fillAddressInfo')); return;
      }
    }
    if (activeStep === 3) {
      if (!form.iban || !form.bic) {
        setError(t('register.validation.fillBankingInfo')); return;
      }
    }
    if (activeStep === 4) {
      for (const field of uploadFields) {
        if (!uploadSuccess[field.name]) {
          setError(t('register.validation.uploadAllDocuments')); return;
        }
      }
    }

    // Weiter zum nächsten Schritt oder Registrierung abschließen
    if (activeStep < 4) {
      setActiveStep(s => s + 1);
    } else {
      await handleRegister();
    }
  };

  /**
   * Navigation zurück zum vorherigen Schritt
   */
  const handleBack = () => setActiveStep(s => Math.max(0, s - 1));

  /**
   * Registrierung abbrechen und zur Startseite navigieren
   */
  const handleCancel = () => navigate('/');

  /**
   * Handler für den finalen Registrierungsprozess
   * Führt Benutzerregistrierung, Dokumentenupload und Bonitätsprüfung durch
   */
  const handleRegister = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Benutzer registrieren
      const res = await register({
        email: form.email,
        username: form.username,
        password: form.password,
        vorname: form.vorname,
        nachname: form.nachname,
        geburtsdatum: form.geburtsdatum,
        iban: form.iban,
        bic: form.bic,
        plz: form.plz,
        ort: form.ort,
        strasse: form.strasse,
        hausnummer: form.hausnummer,
        fuehrerschein: ''
      });

      if (!res || !res.data || (res.status !== 200 && res.status !== 201)) {
        // Spezifische Fehlermeldungen vom Backend behandeln
        if (res && res.data && res.data.msg) {
          if (res.data.msg.includes('Username already exists')) {
            throw new Error('Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.');
          } else if (res.data.msg.includes('Password must be at least 6 characters long')) {
            throw new Error('Das Passwort muss mindestens 6 Zeichen lang sein.');
          } else if (res.data.msg.includes('Missing required field')) {
            throw new Error('Bitte füllen Sie alle Pflichtfelder aus.');
          } else {
            throw new Error(res.data.msg);
          }
        } else {
          throw new Error('Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.');
        }
      }

      // 2. Benutzer-ID aus der Antwort extrahieren
      const user_id = res.data.user_id || res.data.id || res.data.UserID;
      if (!user_id) throw new Error('Benutzer-ID fehlt nach der Registrierung');

      // 3. Dokumente mit Benutzer-ID hochladen
      for (const field of uploadFields) {
        if (form[field.name]) {
          await new Promise((resolve, reject) => {
            const endpoint = field.endpoint;
            const formData = new FormData();
            formData.append('file', form[field.name]);
            formData.append('user_id', user_id);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', endpoint, true);

            xhr.upload.onprogress = (event) => {
              if (event.lengthComputable) {
                setUploadProgress(p => ({ ...p, [field.name]: Math.round((event.loaded / event.total) * 100) }));
              }
            };

            xhr.onload = () => {
              if (xhr.status === 200) {
                setUploadSuccess(s => ({ ...s, [field.name]: true }));
                setUploadProgress(p => ({ ...p, [field.name]: 100 }));
                resolve();
              } else {
                setError('Upload fehlgeschlagen. Bitte versuchen Sie es erneut.');
                setUploadProgress(p => ({ ...p, [field.name]: 0 }));
                reject();
              }
            };

            xhr.onerror = () => {
              setError('Upload fehlgeschlagen. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.');
              setUploadProgress(p => ({ ...p, [field.name]: 0 }));
              reject();
            };

            xhr.send(formData);
          });
        } else {
          setError('Bitte laden Sie alle erforderlichen Dokumente hoch.');
          return;
        }
      }

      // 4. Bonitätsprüfung durchführen
      const creditCheckResponse = await checkCreditworthiness({
        user_id,
        name: form.vorname + ' ' + form.nachname,
        bic: form.bic,
        iban: form.iban
      });

      if (!creditCheckResponse.ok) {
        throw new Error('Bonitätsprüfung fehlgeschlagen. Bitte überprüfen Sie Ihre Bankdaten.');
      }

      setSuccess(true);
    } catch (e) {
      // Verschiedene Fehlertypen behandeln und entsprechende Schritte anzeigen
      if (e.message.includes('Benutzername') || e.message.includes('username')) {
        setError('Dieser Benutzername ist bereits vergeben. Bitte wählen Sie einen anderen.');
        setActiveStep(0);
      } else if (e.message.includes('Passwort') || e.message.includes('Password')) {
        setError('Das Passwort muss mindestens 6 Zeichen lang sein.');
        setActiveStep(0);
      } else if (e.message.includes('Upload')) {
        setError(e.message);
        setActiveStep(4);
      } else if (e.message.includes('Bonitätsprüfung') || e.message.includes('Credit')) {
        setError(e.message);
        setActiveStep(3);
      } else {
        setError(e.message || 'Registrierung fehlgeschlagen. Bitte überprüfen Sie Ihre Angaben und versuchen Sie es erneut.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Fade in>
            <Box>
              <TextField
                label={t('register.fields.email')}
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.username')}
                name="username"
                value={form.username}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.password')}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.confirmPassword')}
                name="passwordConfirm"
                type="password"
                value={form.passwordConfirm}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in>
            <Box>
              <TextField
                label={t('register.fields.firstName')}
                name="vorname"
                value={form.vorname}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.lastName')}
                name="nachname"
                value={form.nachname}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.birthdate')}
                name="geburtsdatum"
                type="date"
                value={form.geburtsdatum}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in>
            <Box>
              <TextField
                label={t('register.fields.zipCode')}
                name="plz"
                value={form.plz}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.city')}
                name="ort"
                value={form.ort}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.street')}
                name="strasse"
                value={form.strasse}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.houseNumber')}
                name="hausnummer"
                value={form.hausnummer}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
            </Box>
          </Fade>
        );
      case 3:
        return (
          <Fade in>
            <Box>
              <TextField
                label={t('register.fields.iban')}
                name="iban"
                value={form.iban}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
              <TextField
                label={t('register.fields.bic')}
                name="bic"
                value={form.bic}
                onChange={handleChange}
                fullWidth
                margin="normal"
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: 'white'
                  }
                }}
              />
            </Box>
          </Fade>
        );
      case 4:
        return (
          <Fade in>
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
                {t('register.uploads.title')}
              </Typography>
              {uploadFields.map((field, index) => (
                <Box key={field.name}>
                  <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', p: 2, borderRadius: 2, background: 'rgba(0,0,0,0.02)' }}>
                    <Button
                      variant={uploadSuccess[field.name] ? 'contained' : 'outlined'}
                      color={uploadSuccess[field.name] ? 'success' : 'primary'}
                      component="label"
                      fullWidth
                      sx={{
                        mr: 2,
                        transition: 'all 0.3s',
                        borderRadius: 2,
                        py: 1.5,
                        fontWeight: 600,
                        ...(uploadSuccess[field.name] && {
                          background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                        })
                      }}
                    >
                      {t(field.labelKey)}
                      <input type="file" name={field.name} accept="image/*" hidden onChange={handleChange} />
                    </Button>
                    <Box sx={{ width: 60, ml: 1 }}>
                      <Collapse in={uploadProgress[field.name] > 0 && !uploadSuccess[field.name]}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress[field.name]}
                          sx={{
                            borderRadius: 2,
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                            }
                          }}
                        />
                      </Collapse>
                      <Fade in={uploadSuccess[field.name]}>
                        <CheckCircleIcon color="success" />
                      </Fade>
                    </Box>
                  </Box>
                  {/* Spacer zwischen Upload-Feldern */}
                  {index < uploadFields.length - 1 && <Box sx={{ height: '8px' }} />}
                </Box>
              ))}
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  if (success) {
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
            background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
          }}>
            {/* Success Header */}
            <Box sx={{
              background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
              color: 'white',
              p: 4,
              textAlign: 'center'
            }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                {t('register.complete') || 'Registration Complete'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {t('register.reviewMessage') || 'Your application is being reviewed'}
              </Typography>
            </Box>

            <Box sx={{ p: 4 }}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 3, color: 'text.primary' }}>
                  {t('register.success.title')}
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
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
                  {t('register.buttons.goToLogin')}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

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
          background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)'
        }}>
          {/* Header */}
          <Box sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            p: 4,
            textAlign: 'center'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
              {t('register.title') || 'Register'}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              {t('register.subtitle') || 'Create your account to get started'}
            </Typography>
          </Box>

          <Box sx={{ p: 4 }}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {steps.map(labelKey => <Step key={labelKey}><StepLabel>{t(labelKey)}</StepLabel></Step>)}
            </Stepper>
            <LinearProgress
              variant="determinate"
              value={((activeStep + 1) / steps.length) * 100}
              sx={{
                mb: 3,
                borderRadius: 2,
                height: 8,
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                  borderRadius: 2
                }
              }}
            />
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}
            {renderStep()}
          </Box>

          <Box sx={{ p: 3, pt: 0, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              onClick={handleCancel}
              color="error"
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              {t('register.buttons.cancel')}
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {activeStep > 0 && (
                <Button
                  onClick={handleBack}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {t('register.buttons.back')}
                </Button>
              )}
              <Button
                onClick={handleNext}
                variant="contained"
                disabled={loading}
                sx={{
                  py: 1.5,
                  px: 3,
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
                {activeStep === steps.length - 1 ? t('register.buttons.register') : t('register.buttons.next')}
              </Button>
            </Box>
          </Box>

          {loading && (
            <LinearProgress
              sx={{
                width: '100%',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
                }
              }}
            />
          )}
        </Paper>
      </Container>
    </Box>
  );
}