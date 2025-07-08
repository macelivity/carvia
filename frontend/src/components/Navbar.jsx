import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Avatar, Menu, MenuItem, Chip
} from '@mui/material';
import { useState } from 'react';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

export default function Navbar() {
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

	return (
		<AppBar 
			position="sticky" 
			elevation={6}
			sx={{ 
				background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
				backdropFilter: 'blur(20px)',
				borderBottom: '1px solid rgba(255,255,255,0.1)'
			}}
		>
			<Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
				{/* Brand Section */}
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<IconButton 
						component={Link}
						to="/"
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
						component={Link}
						to="/"
						sx={{ 
							fontWeight: 700,
							letterSpacing: 1.2,
							color: 'white',
							textDecoration: 'none',
							'&:hover': {
								color: 'rgba(255,255,255,0.9)'
							}
						}}
					>
						{t('navbar.carvia')}
					</Typography>
				</Box>

				{/* Navigation Links and User Menu */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					{/* Language Selector */}
					<LanguageSelector />

					{/* User Section */}
					{user.role !== "guest" ? (
						<>
							{/* User Avatar and Menu */}
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Chip 
									label={t(`roles.${user.role.toLowerCase()}`)} 
									size="small"
									sx={{
										background: 'rgba(255,255,255,0.2)',
										color: 'white',
										fontWeight: 600,
										fontSize: '0.75rem'
									}}
								/>
								<IconButton
									onClick={handleMenuOpen}
									sx={{ 
										color: 'white',
										'&:hover': {
											background: 'rgba(255,255,255,0.1)'
										}
									}}
								>
									<Avatar sx={{ 
										width: 36, 
										height: 36,
										background: 'rgba(255,255,255,0.2)',
										fontSize: 16,
										fontWeight: 700
									}}>
										{user.username?.[0]?.toUpperCase() || <PersonIcon />}
									</Avatar>
								</IconButton>
							</Box>

							{/* User Menu */}
							<Menu
								anchorEl={anchorEl}
								open={Boolean(anchorEl)}
								onClose={handleMenuClose}
								PaperProps={{
									sx: {
										mt: 1,
										borderRadius: 3,
										boxShadow: 6,
										minWidth: 200
									}
								}}
							>
								<MenuItem 
									component={Link} 
									to="/account" 
									onClick={handleMenuClose}
									sx={{ py: 1.5 }}
								>
									<AccountCircleIcon sx={{ mr: 2, color: 'primary.main' }} />
									{t('navbar.account')}
								</MenuItem>
								<MenuItem 
									component={Link} 
									to="/reservations" 
									onClick={handleMenuClose}
									sx={{ py: 1.5 }}
								>
									<CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
									{t('navbar.reservations')}
								</MenuItem>
								<MenuItem 
									onClick={handleLogout}
									sx={{ py: 1.5, color: 'error.main' }}
								>
									<LogoutIcon sx={{ mr: 2 }} />
									{t('navbar.logout')}
								</MenuItem>
							</Menu>
						</>
					) : (
						<>
							{/* Guest Buttons */}
							<Button
								component={Link}
								to="/login"
								startIcon={<LoginIcon />}
								variant="outlined"
								sx={{
									color: 'white',
									borderColor: 'rgba(255,255,255,0.3)',
									fontWeight: 600,
									'&:hover': {
										borderColor: 'white',
										background: 'rgba(255,255,255,0.1)'
									}
								}}
							>
								{t('navbar.login')}
							</Button>
							<Button
								component={Link}
								to="/register"
								startIcon={<PersonAddIcon />}
								variant="contained"
								sx={{
									background: 'rgba(255,255,255,0.2)',
									color: 'white',
									fontWeight: 600,
									'&:hover': {
										background: 'rgba(255,255,255,0.3)'
									}
								}}
							>
								{t('navbar.register')}
							</Button>
						</>
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
}
