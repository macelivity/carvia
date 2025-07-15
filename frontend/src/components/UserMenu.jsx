import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
    IconButton, Avatar, Menu, MenuItem, Chip, Typography
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

/**
 * Benutzermenü-Komponente für die Navigationsleiste
 * Zeigt rollenspezifische Menüoptionen basierend auf der Benutzerrolle
 */
export default function UserMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
        handleMenuClose();
    };

    /**
     * Bestimmt die Farbe des Rollen-Chips basierend auf der Benutzerrolle
     */
    const getRoleChipColor = () => {
        switch (user.role) {
            case 'Admin':
                return 'error';
            case 'Mitarbeiter':
                return 'warning';
            case 'Mitglied':
                return 'success';
            default:
                return 'default';
        }
    };

    /**
     * Bestimmt das Icon für die Benutzerrolle
     */
    const getRoleIcon = () => {
        switch (user.role) {
            case 'Admin':
                return <AdminPanelSettingsIcon />;
            case 'Mitarbeiter':
                return <SupervisorAccountIcon />;
            default:
                return <PersonIcon />;
        }
    };

    return (
        <>
            <IconButton
                onClick={handleMenuOpen}
                size="large"
                edge="end"
                color="inherit"
                sx={{
                    background: 'rgba(255,255,255,0.1)',
                    '&:hover': {
                        background: 'rgba(255,255,255,0.2)'
                    }
                }}
            >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                    {user.username?.[0]?.toUpperCase() || 'G'}
                </Avatar>
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        minWidth: 220,
                        mt: 1.5,
                        borderRadius: 2,
                        '& .MuiMenuItem-root': {
                            borderRadius: 1,
                            mx: 1,
                            my: 0.5,
                        }
                    }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {/* Benutzerinformationen */}
                <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start', py: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {user.username}
                    </Typography>
                    <Chip
                        icon={getRoleIcon()}
                        label={user.role}
                        color={getRoleChipColor()}
                        size="small"
                        sx={{ mt: 1 }}
                    />
                </MenuItem>

                {/* Rollenspezifische Menüoptionen */}
                {/* Admin hat keine direkten Menüoptionen mehr - Verwaltung erfolgt über Homepage */}

                {user.role === 'Mitarbeiter' && (
                    <>
                        <MenuItem 
                            component={Link} 
                            to="/vehicle-management" 
                            onClick={handleMenuClose}
                            sx={{ py: 1.5 }}
                        >
                            <SupervisorAccountIcon sx={{ mr: 2, color: 'warning.main' }} />
                            {t('navbar.vehicleManagement')}
                        </MenuItem>
                        <MenuItem 
                            component={Link} 
                            to="/user-reservations" 
                            onClick={handleMenuClose}
                            sx={{ py: 1.5 }}
                        >
                            <CalendarTodayIcon sx={{ mr: 2, color: 'info.main' }} />
                            {t('navbar.userReservations')}
                        </MenuItem>
                    </>
                )}

                {/* Allgemeine Menüoptionen */}
                <MenuItem 
                    component={Link} 
                    to="/account" 
                    onClick={handleMenuClose}
                    sx={{ py: 1.5 }}
                >
                    <AccountCircleIcon sx={{ mr: 2, color: 'primary.main' }} />
                    {t('navbar.account')}
                </MenuItem>

                {user.role === 'Mitglied' && (
                    <MenuItem 
                        component={Link} 
                        to="/reservations" 
                        onClick={handleMenuClose}
                        sx={{ py: 1.5 }}
                    >
                        <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                        {t('navbar.reservations')}
                    </MenuItem>
                )}

                <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5, color: 'error.main' }}
                >
                    <LogoutIcon sx={{ mr: 2 }} />
                    {t('navbar.logout')}
                </MenuItem>
            </Menu>
        </>
    );
}
