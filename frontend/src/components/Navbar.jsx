import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import UserMenu from './UserMenu';
import GuestButtons from './GuestButtons';
import {
    AppBar, Toolbar, Typography, Box, IconButton
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

/**
 * Navbar Komponente - Hauptnavigation der Anwendung
 * Zeigt das Carvia-Logo, Sprachauswahl und benutzerabhängige Menüs an
 */
export default function Navbar() {
	const { user } = useAuth();
	const { t } = useTranslation();

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
				{/* Logo und Marken-Bereich */}
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

				{/* Navigation und Benutzer-Bereich */}
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
					{/* Sprachauswahl */}
					<LanguageSelector />

					{/* Benutzer-spezifische Navigation */}
					{user.role !== "guest" ? (
						<UserMenu user={user} />
					) : (
						<GuestButtons />
					)}
				</Box>
			</Toolbar>
		</AppBar>
	);
}
