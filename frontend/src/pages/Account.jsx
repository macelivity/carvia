import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  Container, Typography, Card, CardContent, Button, TextField, Box, Grid,
  Alert, Dialog, DialogTitle, DialogContent, DialogActions, Avatar, 
  Table, TableBody, TableCell, TableRow, CircularProgress, Paper
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import LockIcon from '@mui/icons-material/Lock';
import SaveIcon from '@mui/icons-material/Save';
import { getProfile } from "../api/api";

/**
 * Account Komponente - Benutzerprofil-Verwaltung
 * Ermöglicht Benutzern die Anzeige und Bearbeitung ihrer Profildaten sowie Passwort-Änderung
 */
export default function Account() {
  const { t } = useTranslation();
  
  // Profil-Status
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Bearbeitungs-Status für Adressdaten
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    Strasse: "",
    HausNummer: "",
    Ort: "",
    PLZ: ""
  });
  const [successMsg, setSuccessMsg] = useState("");

  // Passwort-Änderung
  const [showPwForm, setShowPwForm] = useState(false);
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    new_password_repeat: ""
  });
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  /**
   * Lädt das Benutzerprofil beim Komponenten-Mount
   */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    getProfile()
      .then(res => {
        setProfile(res.data.user);
        setForm({
          Strasse: res.data.user.Strasse || "",
          HausNummer: res.data.user.HausNummer || "",
          Ort: res.data.user.Ort || "",
          PLZ: res.data.user.PLZ || ""
        });
        setLoading(false);
      })
      .catch(() => {
        setError(t('account.errorLoadingProfile'));
        setLoading(false);
      });
  }, []);

  /**
   * Behandelt Änderungen in den Adress-Formularfeldern
   * @param {Object} e - Event-Objekt
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Speichert die geänderten Adressdaten
   * @param {Object} e - Event-Objekt
   */
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    const token = localStorage.getItem("accessToken");
    try {
      await putProfile(form)
      setProfile({ ...profile, ...form });
      setEdit(false);
      setSuccessMsg(t('account.profileUpdateSuccess'));
    } catch {
      setError(t('account.profileUpdateError'));
    }
  };

  // Passwort-Formular-Handler
  const handlePwChange = (e) => {
    setPwForm({ ...pwForm, [e.target.name]: e.target.value });
  };

  const handlePwSave = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");
    
    // Custom validation
    if (!pwForm.current_password) {
      setPwError(t('account.currentPasswordRequired'));
      return;
    }
    if (!pwForm.new_password) {
      setPwError(t('account.newPasswordRequired'));
      return;
    }
    if (!pwForm.new_password_repeat) {
      setPwError(t('account.confirmPasswordRequired'));
      return;
    }
    if (pwForm.new_password !== pwForm.new_password_repeat) {
      setPwError(t('account.passwordMismatch'));
      return;
    }
    if (pwForm.new_password.length < 6) {
      setPwError(t('account.passwordTooShort'));
      return;
    }
    
    const token = localStorage.getItem("accessToken");
    try {
      await changePassword({
        current_password: pwForm.current_password,
        new_password: pwForm.new_password
      });
      setPwMsg(t('account.passwordChangeSuccess'));
      setPwForm({
        current_password: "",
        new_password: "",
        new_password_repeat: ""
      });
      setShowPwForm(false);
    } catch (err) {
      // Provide specific error messages based on status code
      if (err?.response?.status === 400) {
        setPwError(t('account.passwordIncorrect'));
      } else if (err?.response?.status >= 500) {
        setPwError(t('account.passwordChangeServerError'));
      } else {
        setPwError(t('account.passwordChangeError'));
      }
    }
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{
          background: 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)',
          borderRadius: 4,
          boxShadow: 3,
          p: { xs: 2, sm: 4 },
          mb: 4,
          textAlign: 'center'
        }}>
          <Typography variant="h3" sx={{ 
            fontWeight: 800, 
            color: 'primary.main', 
            mb: 1, 
            letterSpacing: 1 
          }}>
            {t('account.title')}
          </Typography>
          <Typography variant="subtitle1" sx={{ 
            color: 'text.secondary', 
            maxWidth: 600, 
            mx: 'auto' 
          }}>
            {t('account.subtitle')}
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={60} />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
            {error}
          </Alert>
        )}

        {successMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            {successMsg}
          </Alert>
        )}

        {pwMsg && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 3 }}>
            {pwMsg}
          </Alert>
        )}

        {!loading && !error && profile && (
          <Grid container spacing={4}>
            {/* Profile Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 4, 
                boxShadow: 4,
                background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                height: 'fit-content',
                mt: 2 // Oberen Abstand für bessere Optik
              }}>
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Avatar sx={{ 
                    width: 100, 
                    height: 100, 
                    mx: 'auto', 
                    mb: 3,
                    background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
                    fontSize: 40,
                    fontWeight: 700
                  }}>
                    {profile.Vorname?.[0]}{profile.Nachname?.[0]}
                  </Avatar>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700, 
                    color: 'primary.main', 
                    mb: 1 
                  }}>
                    {profile.Vorname} {profile.Nachname}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: 'text.secondary', 
                    mb: 3 
                  }}>
                    @{profile.Username}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => setEdit(true)}
                      disabled={edit}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
                        boxShadow: 3
                      }}
                    >
                      {t('account.editProfile')}
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<LockIcon />}
                      onClick={() => setShowPwForm(true)}
                      sx={{
                        py: 1.5,
                        fontWeight: 700,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f57c00 0%, #ff9800 100%)',
                        boxShadow: 3
                      }}
                    >
                      {t('account.changePassword')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Profile Data */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ 
                borderRadius: 4, 
                boxShadow: 4,
                background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
                overflow: 'hidden',
                mt: 2 // Oberen Abstand für bessere Optik
              }}>
                <Box sx={{
                  background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                  color: 'white',
                  p: 3
                }}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {t('account.profileInformation')}
                  </Typography>
                </Box>
                
                <Box sx={{ p: 3 }}>
                  {!edit ? (
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('auth.username')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Username}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('auth.firstName')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Vorname}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('auth.lastName')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Nachname}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('auth.birthDate')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Geburtsdatum}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.joinDate')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.BeitrittsDatum}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.city')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Ort}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.postalCode')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.PLZ}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.street')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Strasse}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.houseNumber')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.HausNummer}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.driverLicense')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.Führerschein}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, borderBottom: '1px solid #e0e0e0' }}>
                            {t('account.iban')}:
                          </TableCell>
                          <TableCell sx={{ borderBottom: '1px solid #e0e0e0' }}>
                            {profile.IBAN}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {t('account.bic')}:
                          </TableCell>
                          <TableCell>
                            {profile.BIC}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  ) : (
                    <Box component="form" onSubmit={handleSave}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('account.city')}
                            name="Ort"
                            value={form.Ort}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('account.postalCode')}
                            name="PLZ"
                            value={form.PLZ}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('account.street')}
                            name="Strasse"
                            value={form.Strasse}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label={t('account.houseNumber')}
                            name="HausNummer"
                            value={form.HausNummer}
                            onChange={handleChange}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                          />
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={<SaveIcon />}
                          sx={{
                            py: 1.5,
                            px: 3,
                            fontWeight: 700,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                            boxShadow: 3
                          }}
                        >
                          {t('account.saveProfile')}
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setEdit(false);
                            setForm({
                              Strasse: profile.Strasse || "",
                              HausNummer: profile.HausNummer || "",
                              Ort: profile.Ort || "",
                              PLZ: profile.PLZ || ""
                            });
                          }}
                          sx={{
                            py: 1.5,
                            px: 3,
                            fontWeight: 700,
                            borderRadius: 3,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2
                            }
                          }}
                        >
                          {t('common.cancel')}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Password Change Dialog */}
        <Dialog 
          open={showPwForm} 
          onClose={() => setShowPwForm(false)}
          PaperProps={{ 
            sx: { 
              borderRadius: 3,
              minWidth: { xs: '90vw', sm: 400 }
            } 
          }}
        >
          <DialogTitle sx={{
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
            color: 'white',
            fontWeight: 600,
            fontSize: 20
          }}>
            {t('account.changePassword')}
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Box component="form" onSubmit={handlePwSave}>
              <TextField
                fullWidth
                margin="normal"
                label={t('account.currentPassword')}
                name="current_password"
                type="password"
                value={pwForm.current_password}
                onChange={handlePwChange}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                margin="normal"
                label={t('account.newPassword')}
                name="new_password"
                type="password"
                value={pwForm.new_password}
                onChange={handlePwChange}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                margin="normal"
                label={t('account.repeatNewPassword')}
                name="new_password_repeat"
                type="password"
                value={pwForm.new_password_repeat}
                onChange={handlePwChange}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              {pwError && (
                <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                  {pwError}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => {
                setShowPwForm(false);
                setPwForm({
                  current_password: "",
                  new_password: "",
                  new_password_repeat: ""
                });
                setPwError("");
                setPwMsg("");
              }}
              sx={{ borderRadius: 2 }}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              onClick={handlePwSave}
              variant="contained"
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)',
                fontWeight: 700
              }}
            >
              {t('account.savePassword')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}