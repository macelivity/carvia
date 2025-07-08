import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

import {
	Container, Typography, Button, Grid, Paper, TextField, Box,
	CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { de } from 'date-fns/locale';
import { getReservationData, calculateReservationPrice, reservieren } from '../api/api';

// Helper function to format Date object to 'YYYY-MM-DDTHH:mm' string for API
function formatToISOStringForAPI(date) {
	if (!date || !(date instanceof Date) || isNaN(date.getTime())) return null;
	return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
}


export default function Booking() {
	const { vehicle_id } = useParams(); // This is FahrzeugID
	const navigate = useNavigate();
	const location = useLocation();
	const { user } = useAuth();
	const { t } = useTranslation();

	const passedState = location.state; // Directly use location.state

	const [vehicle, setVehicle] = useState(null);
	const [model, setModel] = useState(null);
	const [tarife, setTarife] = useState([]);
	const [selectedTarifId, setSelectedTarifId] = useState('');

	const [startDate, setStartDate] = useState(
		passedState?.start_datum && passedState.start_datum !== 'Jetzt'
			? new Date(passedState.start_datum)
			: (passedState?.start_datum === 'Jetzt' ? new Date() : null)
	);
	const [endDate, setEndDate] = useState(
		passedState?.end_datum ? new Date(passedState.end_datum) : null
	);

	const [abholPlz, setAbholPlz] = useState(passedState?.abholort_plz || '');
	const [abholort, setAbholort] = useState(passedState?.abholort_stadt || '');
	const [rueckgabePlz, setRueckgabePlz] = useState(passedState?.rueckgabeort_plz || '');
	const [rueckgabeort, setRueckgabeort] = useState(passedState?.rueckgabeort_stadt || '');


	const [calculatedPrice, setCalculatedPrice] = useState(0);
	const [priceCalculationData, setPriceCalculationData] = useState(null);

	const [loadingVehicle, setLoadingVehicle] = useState(true);
	const [loadingPrice, setLoadingPrice] = useState(false);
	const [error, setError] = useState('');
	const [bookingMessage, setBookingMessage] = useState('');
	const [bookingError, setBookingError] = useState('');

	// Check if user is authenticated
	useEffect(() => {
		if (!user) {
			setError(t('booking.loginRequired'));
			return;
		}
	}, [user, t]);

	// Fetch vehicle, model, and tariff data
	useEffect(() => {
		const fetchReservationData = async () => {
			if (!vehicle_id) return;
			
			setLoadingVehicle(true);
			setError('');
			try {
				const response = await getReservationData(vehicle_id);
				
				if (!response.data) {
					throw new Error(t('booking.vehicleNotFound'));
				}
				
				setVehicle(response.data.vehicle);
				setModel(response.data.model);
				setTarife(response.data.tariffs);
				
				// Set default tariff if available
				if (response.data.tariffs.length > 0 && !selectedTarifId) {
					setSelectedTarifId(response.data.tariffs[0].TarifID.toString());
				}
			} catch (err) {
				console.error('Error fetching reservation data:', err);
				console.error('Error response:', err.response?.data);
				setError(err.response?.data?.error || err.message || t('booking.dataLoadError'));
			} finally {
				setLoadingVehicle(false);
			}
		};

		fetchReservationData();
	}, [vehicle_id, t]); // Removed selectedTarifId from dependency array to prevent loops

	// Calculate price when relevant data changes
	const calculatePrice = useCallback(async () => {
		if (!startDate || !endDate || !selectedTarifId || !vehicle_id) {
			setCalculatedPrice(0);
			setPriceCalculationData(null);
			return;
		}

		setLoadingPrice(true);
		try {
			const response = await calculateReservationPrice({
				FahrzeugID: parseInt(vehicle_id),
				TarifID: parseInt(selectedTarifId),
				StartDatum: startDate.toISOString(),
				EndDatum: endDate.toISOString()
			});
			
			if (response.data) {
				setCalculatedPrice(response.data.price);
				setPriceCalculationData(response.data);
			}
		} catch (err) {
			setCalculatedPrice(0);
			setPriceCalculationData(null);
			// Don't show error for price calculation failures, just reset to 0
		} finally {
			setLoadingPrice(false);
		}
	}, [startDate, endDate, selectedTarifId, vehicle_id]);

	useEffect(() => {
		calculatePrice();
	}, [calculatePrice]);


	const handleBookingSubmit = async (e) => {
		e.preventDefault();
		setBookingMessage('');
		setBookingError('');

		if (!user) {
			setBookingError(t('booking.loginRequired'));
			return;
		}
		if (!startDate || !endDate || !selectedTarifId ||
			!abholPlz || !abholort || !rueckgabePlz || !rueckgabeort) {
			setBookingError(t('booking.fillAllFields'));
			return;
		}
		if (startDate >= endDate) {
			setBookingError(t('booking.invalidDateRange'));
			return;
		}

		const reservationData = {
			UserID: user.userID,
			FahrzeugID: parseInt(vehicle_id),
			StartDatum: formatToISOStringForAPI(startDate),
			EndDatum: formatToISOStringForAPI(endDate),
			TarifID: parseInt(selectedTarifId),
			RechnungID: null,
			AbholPlz: abholPlz,
			Abholort: abholort,
			RueckgabePlz: rueckgabePlz,
			Rueckgabeort: rueckgabeort
			// Price will be calculated on the backend
		};

		try {
			const response = await reservieren(reservationData);
			if (response.status !== 201) {
				setBookingError(t('booking.bookingError'));
				throw new Error('Reservierung fehlgeschlagen: ' + response.statusText);
			}
			setBookingMessage(t('booking.bookingSuccess', { id: response.data.id }));
			setTimeout(() => {
				navigate('/reservations');
			}, 3000);
		} catch (err) {
			console.error('Fehler bei der Reservierung:', err.response?.data || err);
			setBookingError(err.response?.data?.msg || err.response?.data?.error || t('booking.checkAvailability'));
		}
	};

	if (loadingVehicle) {
		return (
			<Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>{t('booking.loadingVehicle')}</Typography>
			</Container>
		);
	}

	if (error && !vehicle) {
		return (
			<Container sx={{ textAlign: 'center', mt: 4 }}>
				<Alert severity="error">{error}</Alert>
				<Button 
					onClick={() => window.location.reload()} 
					variant="contained" 
					sx={{ mt: 2 }}
				>
					Reload Page
				</Button>
			</Container>
		);
	}

	if (!loadingVehicle && (!vehicle || !model)) {
		return (
			<Container sx={{ textAlign: 'center', mt: 4 }}>
				<Alert severity="warning">{t('booking.vehicleNotFound')}</Alert>
				<Button 
					onClick={() => navigate(-1)} 
					variant="contained" 
					sx={{ mt: 2 }}
				>
					{t('booking.backToVehicles')}
				</Button>
			</Container>
		);
	}

	const selectedtarifDetails = tarife.find(t => t.TarifID === parseInt(selectedTarifId));

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
			<Container maxWidth="md" sx={{ mt: { xs: 2, sm: 6 }, mb: 6 }}>
				{/* Hero Section */}
				<Box
					sx={{
						background: 'linear-gradient(120deg, #e3f2fd 0%, #f5faff 100%)',
						borderRadius: 4,
						boxShadow: 3,
						p: { xs: 2, sm: 4 },
						mb: 5,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
					}}
				>
					<Box sx={{
						width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
						display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 40, fontWeight: 700, mb: 3
					}}>
						<DirectionsCarIcon sx={{ fontSize: 40 }} />
					</Box>
					<Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main', mb: 1, letterSpacing: 1, textAlign: 'center' }}>
						{t('booking.title', { model: model?.Name || model?.ModellName || 'Vehicle' })}
					</Typography>
					<Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 600 }}>
						{t('booking.subtitle')}
					</Typography>
					<Button 
						onClick={() => navigate(-1)} 
						variant="outlined"
						sx={{ 
							fontWeight: 700, 
							borderRadius: 2, 
							borderWidth: 2,
							'&:hover': { borderWidth: 2 }
						}}
					>
						{t('booking.backToVehicles')}
					</Button>
				</Box>

				{error && !loadingVehicle && (
					<Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>{error}</Alert>
				)}

				<Grid container spacing={4} sx={{ mb: 4 }}>
					{/* Vehicle Specifications Card */}
					<Grid item xs={12}>
						<Box
							sx={{
								background: 'linear-gradient(120deg, #f5faff 0%, #e3f2fd 100%)',
								borderRadius: 4,
								boxShadow: 3,
								p: 4
							}}
						>
							<Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 3, display: 'flex', alignItems: 'center' }}>
								{t('booking.vehicleSpecs')}
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.manufacturer')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Hersteller || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.model')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Name || model?.ModellName || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.vehicleType')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Fahrzeugtyp || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.licensePlate')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{vehicle?.Kennzeichen || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.transmission')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Getriebeart || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.seats')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Sitze || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.doors')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Tueren || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.fuel')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Kraftstoffart || '-'}
										</Typography>
									</Box>
								</Grid>
								<Grid item xs={12} sm={6} md={3}>
									<Box sx={{ p: 2, background: 'rgba(255,255,255,0.6)', borderRadius: 2 }}>
										<Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
											{t('booking.power')}
										</Typography>
										<Typography variant="body1" sx={{ fontWeight: 600 }}>
											{model?.Leistung ? `${model.Leistung} PS` : '-'}
										</Typography>
									</Box>
								</Grid>
							</Grid>
						</Box>
					</Grid>
				</Grid>

				{/* Booking Form */}
				<Box
					sx={{
						background: 'linear-gradient(120deg, #ffffff 0%, #f8f9ff 100%)',
						borderRadius: 4,
						boxShadow: 4,
						p: { xs: 2, sm: 4 },
					}}
				>
					<Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
						<Box sx={{
							width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #1976d2 60%, #42a5f5 100%)',
							display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 24, fontWeight: 700, mr: 3
						}}>
							<EventIcon sx={{ fontSize: 30 }} />
						</Box>
						<Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
							{t('booking.bookingForm')}
						</Typography>
					</Box>

					<Box component="form" onSubmit={handleBookingSubmit} noValidate>
						{/* Date & Time Section */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" sx={{ 
								fontWeight: 700, 
								color: 'primary.main', 
								mb: 3,
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}>
								{t('vehicleSearch.dateAndTime')}
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									<DateTimePicker
										label={t('booking.startDateTime')}
										value={startDate}
										onChange={(newValue) => setStartDate(newValue)}
										ampm={false}
										slotProps={{
											actionBar: { actions: ["cancel", "today", "accept"] },
											textField: { 
												fullWidth: true,
												sx: { 
													'& .MuiOutlinedInput-root': { 
														borderRadius: 2,
														background: 'white'
													}
												}
											}
										}}
									/>
								</Grid>
								<Grid item xs={12} md={6}>
									<DateTimePicker
										label={t('booking.endDateTime')}
										value={endDate}
										onChange={(newValue) => setEndDate(newValue)}
										ampm={false}
										slotProps={{
											actionBar: { actions: ["cancel", "today", "accept"] },
											textField: { 
												fullWidth: true,
												sx: { 
													'& .MuiOutlinedInput-root': { 
														borderRadius: 2,
														background: 'white'
													}
												}
											}
										}}
									/>
								</Grid>
							</Grid>
						</Box>

						{/* Location Section */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" sx={{ 
								fontWeight: 700, 
								color: 'primary.main', 
								mb: 3,
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}>
								{t('vehicleSearch.pickupLocation')}
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} sm={4}>
									<TextField
										label={t('booking.pickupPostalCode')}
										id="abholPlz"
										name="abholPlz"
										value={abholPlz}
										onChange={e => setAbholPlz(e.target.value)}
										required
										fullWidth
										placeholder={t('booking.pickupPostalCodePlaceholder')}
										sx={{ 
											'& .MuiOutlinedInput-root': { 
												borderRadius: 2,
												background: 'white'
											}
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={8}>
									<TextField
										label={t('booking.pickupCity')}
										id="abholort"
										name="abholort"
										value={abholort}
										onChange={e => setAbholort(e.target.value)}
										required
										fullWidth
										placeholder={t('booking.pickupCityPlaceholder')}
										sx={{ 
											'& .MuiOutlinedInput-root': { 
												borderRadius: 2,
												background: 'white'
											}
										}}
									/>
								</Grid>
							</Grid>
							
							<Typography variant="h6" sx={{ 
								fontWeight: 700, 
								color: 'primary.main', 
								mt: 4,
								mb: 3,
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}>
								{t('vehicleSearch.returnLocation')}
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} sm={4}>
									<TextField
										label={t('booking.returnPostalCode')}
										id="rueckgabePlz"
										name="rueckgabePlz"
										value={rueckgabePlz}
										onChange={e => setRueckgabePlz(e.target.value)}
										required
										fullWidth
										placeholder={t('booking.returnPostalCodePlaceholder')}
										sx={{ 
											'& .MuiOutlinedInput-root': { 
												borderRadius: 2,
												background: 'white'
											}
										}}
									/>
								</Grid>
								<Grid item xs={12} sm={8}>
									<TextField
										label={t('booking.returnCity')}
										id="rueckgabeort"
										name="rueckgabeort"
										value={rueckgabeort}
										onChange={e => setRueckgabeort(e.target.value)}
										required
										fullWidth
										placeholder={t('booking.returnCityPlaceholder')}
										sx={{ 
											'& .MuiOutlinedInput-root': { 
												borderRadius: 2,
												background: 'white'
											}
										}}
									/>
								</Grid>
							</Grid>
						</Box>

						{/* Tariff Selection Section */}
						<Box sx={{ mb: 4 }}>
							<Typography variant="h6" sx={{ 
								fontWeight: 700, 
								color: 'primary.main', 
								mb: 3,
								display: 'flex',
								alignItems: 'center',
								gap: 1
							}}>
								{t('booking.selectTariffLabel')}
							</Typography>
							<Grid container spacing={3}>
								<Grid item xs={12} md={6}>
									<FormControl fullWidth required>
										<InputLabel id="tarif-select-label">{t('booking.selectTariffLabel')}</InputLabel>
										<Select
											labelId="tarif-select-label"
											id="tarif"
											value={selectedTarifId}
											label={t('booking.selectTariffLabel')}
											onChange={e => setSelectedTarifId(e.target.value)}
											disabled={loadingVehicle || tarife.length === 0}
											sx={{ 
												borderRadius: 2,
												background: 'white'
											}}
										>
											{loadingVehicle && <MenuItem value=""><em>{t('booking.loadingTariffs')}</em></MenuItem>}
											{!loadingVehicle && tarife.length === 0 && <MenuItem value=""><em>{t('booking.noTariffsAvailable')}</em></MenuItem>}
											{tarife.map(tarif => (
												<MenuItem key={tarif.TarifID} value={tarif.TarifID}>
													{tarif.Name}
												</MenuItem>
											))}
										</Select>
									</FormControl>
								</Grid>
								<Grid item xs={12} md={6}>
									{/* Tariff Details */}
									<Box sx={{
										background: 'linear-gradient(120deg, #f3e5f5 0%, #e1bee7 100%)',
										borderRadius: 2,
										p: 3,
										height: '100%',
										minHeight: 140
									}}>
										<Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#7b1fa2', mb: 2 }}>
											{t('booking.tariffDetails')}
										</Typography>
										{loadingVehicle && <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={16} /><Typography variant="body2">Loading...</Typography></Box>}
										{!loadingVehicle && tarife.length === 0 && <Typography variant="body2">{t('booking.noTariffsAvailable')}</Typography>}
										{selectedtarifDetails ? (
											<>
												<Typography variant="body2" sx={{ mb: 1 }}>
													<strong>{t('booking.tariffName')}:</strong> {selectedtarifDetails?.Name || '-'}
												</Typography>
												<Typography variant="body2" sx={{ mb: 1 }}>
													<strong>{t('booking.freeKm')}:</strong> {selectedtarifDetails?.Freikilometer !== null && selectedtarifDetails?.Freikilometer !== undefined ? `${selectedtarifDetails.Freikilometer} km` : t('booking.unlimited')}
												</Typography>
												<Typography variant="body2">
													<strong>{t('booking.insurance')}:</strong> {selectedtarifDetails?.Versicherungsschutz || '-'}
												</Typography>
											</>
										) : (
											!loadingVehicle && <Typography variant="body2">{t('booking.selectTariff')}</Typography>
										)}
									</Box>
								</Grid>
							</Grid>
						</Box>

						{/* Price Display */}
						<Box sx={{ 
							mt: 4, 
							p: 3, 
							background: 'linear-gradient(120deg, #e8f5e8 0%, #c8e6c9 100%)',
							borderRadius: 3,
							textAlign: 'center'
						}}>
							<Typography variant="h5" sx={{ fontWeight: 700, color: '#2e7d32', mb: 1 }}>
								{t('booking.estimatedTotalPrice')}
							</Typography>
							{loadingPrice ? (
								<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, my: 2 }}>
									<CircularProgress size={24} sx={{ color: '#2e7d32' }} />
									<Typography variant="h5" sx={{ fontWeight: 600, color: '#2e7d32' }}>
										{t('booking.calculatingPrice')}
									</Typography>
								</Box>
							) : (
								<Typography variant="h3" sx={{ fontWeight: 800, color: '#1b5e20', mb: 1 }}>
									{calculatedPrice.toFixed(2)} €
								</Typography>
							)}
							{priceCalculationData && (
								<Typography variant="body2" sx={{ color: '#388e3c', mt: 1 }}>
									{t('booking.priceDetails', {
										hours: priceCalculationData.duration_hours?.toFixed(1) || '0',
										rate: priceCalculationData.hourly_rate || '0',
										multiplier: priceCalculationData.tariff_multiplier || '1'
									})}
								</Typography>
							)}
							<Typography variant="body2" sx={{ color: '#388e3c' }}>
								{t('booking.priceBasedOn')}
							</Typography>
						</Box>

						{bookingMessage && <Alert severity="success" sx={{ mt: 3, borderRadius: 3 }}>{bookingMessage}</Alert>}
						{bookingError && <Alert severity="error" sx={{ mt: 3, borderRadius: 3 }}>{bookingError}</Alert>}

						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							size="large"
							sx={{ 
								mt: 4, 
								py: 2,
								fontWeight: 700,
								borderRadius: 3,
								background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
								boxShadow: 4,
								'&:hover': {
									boxShadow: 6,
									transform: 'translateY(-2px)'
								},
								transition: 'all 0.3s ease'
							}}
							disabled={loadingVehicle || !vehicle || !model || tarife.length === 0 || !startDate || !endDate || !abholPlz || !abholort || !rueckgabePlz || !rueckgabeort}
						>
							{t('booking.reserveNow')}
						</Button>
					</Box>
				</Box>
			</Container>
		</LocalizationProvider>
	);
}