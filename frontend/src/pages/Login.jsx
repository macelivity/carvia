import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginAPI } from '../api/api';
import { useTranslation } from 'react-i18next';
import {
    Container, Typography, TextField, Button, Box, Paper, 
    Alert, Avatar, InputAdornment, IconButton
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

/**
 * Login Komponente - Benutzeranmeldung
 * Ermöglicht es Benutzern, sich in das System einzuloggen
 */
export default function Login() {
    const { t } = useTranslation();
    const { user, login: contextLogin } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    /**
     * Behandelt Änderungen in Formularfeldern
     * @param {Object} e - Event-Objekt
     */
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    /**
     * Behandelt das Absenden des Login-Formulars
     * @param {Object} e - Event-Objekt
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        // Validierung: Überprüfe ob alle Felder ausgefüllt sind
        if (!form.username || !form.password) {
            setError(t('login.usernameRequired'));
            return;
        }
        
        try {
            const response = await loginAPI(form);
            
            // Überprüfe ob Benutzer noch nicht akzeptiert wurde
            if (response.data && response.data.Angenommen === 0) {
                setError(t('login.registrationPending'));
                return;
            }
            
            contextLogin(response.data);
        } catch (err) {
            // Behandle Login-Fehler
            if (err.response && err.response.data && err.response.data.msg) {
                setError(err.response.data.msg);
            } else {
                setError(t('login.loginFailed'));
            }
        }
    };

    /**
     * Behandelt das Umschalten der Passwort-Sichtbarkeit
     */
    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Umleitung falls Benutzer bereits eingeloggt ist
    useEffect(() => {
        if (user && user.role !== 'guest') {
            navigate('/'); 
        }
    }, [user, navigate]);

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
                    {/* Header-Bereich */}
                    <Box sx={{
                        background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 100%)',
                        color: 'white',
                        p: 4,
                        textAlign: 'center'
                    }}>
                        <Avatar sx={{
                            width: 80,
                            height: 80,
                            mx: 'auto',
                            mb: 2,
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <LoginIcon sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                            {t('login.title')}
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {t('login.subtitle')}
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box sx={{ p: 4 }}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label={t('login.username')}
                                name="username"
                                value={form.username}
                                onChange={handleChange}
                                variant="outlined"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ 
                                    mb: 2,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />
                            
                            <TextField
                                fullWidth
                                margin="normal"
                                label={t('login.password')}
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={form.password}
                                onChange={handleChange}
                                variant="outlined"
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ 
                                    mb: 3,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            {error && (
                                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                sx={{
                                    py: 1.5,
                                    mb: 3,
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
                                {t('login.loginButton')}
                            </Button>

                            {/* Register Link */}
                            <Box sx={{ 
                                textAlign: 'center',
                                p: 3,
                                background: 'linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%)',
                                borderRadius: 3,
                                border: '1px solid rgba(156, 39, 176, 0.2)'
                            }}>
                                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                                    {t('login.noAccount')}
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/register"
                                    variant="contained"
                                    startIcon={<PersonAddIcon />}
                                    sx={{
                                        py: 1.5,
                                        px: 3,
                                        fontWeight: 700,
                                        borderRadius: 3,
                                        background: 'linear-gradient(135deg, #7b1fa2 0%, #9c27b0 100%)',
                                        boxShadow: 3,
                                        '&:hover': {
                                            boxShadow: 6,
                                            transform: 'translateY(-2px)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {t('login.registerNow')}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}