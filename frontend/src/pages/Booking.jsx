import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

import {
	Container, Typography, Button, Grid, Paper, TextField, Box,
	CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { de } from 'date-fns/locale';
import { createReservation, getModellById, getTarife, getVehicleById } from '../api/api';

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

	const [loadingVehicle, setLoadingVehicle] = useState(true);
	const [loadingTarife, setLoadingTarife] = useState(true);
	const [error, setError] = useState('');
	const [bookingMessage, setBookingMessage] = useState('');
	const [bookingError, setBookingError] = useState('');

	// Fetch vehicle and model details
	useEffect(() => {
		if (vehicle_id) {
			setLoadingVehicle(true);
			setError('');
			getVehicleById(vehicle_id)
				.then(res => {
					setVehicle(res.data);
					if (res.data && res.data.ModellID) {
						return getModellById(res.data.ModellID);
					}
					throw new Error(t('booking.modelIdNotFound'));
				})
				.then(res => {
					setModel(res.data);
				})
				.catch(err => {
					console.error("Fehler beim Laden der Fahrzeugdetails:", err);
					setError(t('booking.errorLoadingVehicle'));
				})
				.finally(() => {
					setLoadingVehicle(false);
				});
		}
	}, [vehicle_id]);

	// Fetch tarifs
	useEffect(() => {
		setLoadingTarife(true);
		getTarife()
			.then(res => {
				setTarife(res.data);
				if (res.data.length > 0) {
					setSelectedTarifId(res.data[0].TarifID); // Select first tarif by default
				}
			})
			.catch(err => {
				console.error("Fehler beim Laden der Tarife:", err);
				setError(prev => prev + (prev ? '; ' : '') + t('booking.errorLoadingTariffs'));
			})
			.finally(() => {
				setLoadingTarife(false);
			});
	}, []);

	// Calculate price
	const calculatePriceCallback = useCallback(() => {
		if (startDate && endDate && selectedTarifId && tarife.length > 0 && model) {
			const start = startDate; // Already a Date object
			const end = endDate;     // Already a Date object
			const tarif = tarife.find(t => t.TarifID === parseInt(selectedTarifId));

			if (start >= end) {
				setCalculatedPrice(0);
				return;
			}

			if (tarif && tarif.Multiplikator !== undefined && tarif.Multiplikator !== null && model.Stundenpreis !== undefined && model.Stundenpreis !== null) {
				const durationMs = end.getTime() - start.getTime();
				const durationHours = durationMs / (1000 * 60 * 60);
				const total = durationHours * model.Stundenpreis * tarif.Multiplikator;
				setCalculatedPrice(total);
			} else {
				setCalculatedPrice(0);
			}
		} else {
			setCalculatedPrice(0);
		}
	}, [startDate, endDate, selectedTarifId, tarife, model]);

	useEffect(() => {
		calculatePriceCallback();
	}, [calculatePriceCallback]);


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
			Rueckgabeort: rueckgabeort,
			Preis: calculatedPrice.toFixed(2)
		};

		try {
			const response = await createReservation(reservationData);
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
			</Container>
		);
	}

	if (!vehicle || !model) {
		return (
			<Container sx={{ textAlign: 'center', mt: 4 }}>
				<Alert severity="warning">{t('booking.vehicleNotFound')}</Alert>
			</Container>
		);
	}

	const selectedtarifDetails = tarife.find(t => t.TarifID === parseInt(selectedTarifId));

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
			<Container maxWidth="lg" sx={{ py: 4 }}> {/* Changed to lg for better spacing if needed */}
				<Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
					{t('booking.backToVehicles')}
				</Button>
				<Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
					{t('booking.title') + model.ModellName}
				</Typography>

				{error && !loadingVehicle && (
					<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				)}

				<Grid container spacing={3} sx={{ mb: 3 }}>
					{/* Fahrzeugspezifikationen und Tarifdetails nebeneinander */}
					<Grid item xs={12} md={6} size={8}>
						<Paper elevation={3} sx={{ p: 2, height: '100%' }}> {/* Added height 100% for consistent card height */}
							<Typography variant="h6" gutterBottom>{t('booking.vehicleSpecs')}</Typography>
							<Typography><strong>{t('booking.manufacturer')}:</strong> {model.Hersteller}</Typography>
							<Typography><strong>{t('booking.model')}:</strong> {model.ModellName}</Typography>
							<Typography><strong>{t('booking.vehicleType')}:</strong> {model.Fahrzeugtyp}</Typography>
							<Typography><strong>{t('booking.licensePlate')}:</strong> {vehicle.Kennzeichen}</Typography>
							<Typography><strong>{t('booking.transmission')}:</strong> {model.Getriebeart}</Typography>
							<Typography><strong>{t('booking.seats')}:</strong> {model.Sitze}</Typography>
							<Typography><strong>{t('booking.doors')}:</strong> {model.Tueren}</Typography>
							<Typography><strong>{t('booking.fuel')}:</strong> {model.Kraftstoffart}</Typography>
							<Typography><strong>{t('booking.power')}:</strong> {model.Leistung} PS</Typography>
						</Paper>
					</Grid>

					<Grid item xs={12} md={6} size={4}>
						<Paper elevation={3} sx={{ p: 2, height: '100%' }}> {/* Added height 100% */}
							<Typography variant="h6" gutterBottom>{t('booking.tariffDetails')}</Typography>
							{loadingTarife && <CircularProgress size={20} />}
							{!loadingTarife && tarife.length === 0 && <Typography>{t('booking.noTariffsAvailable')}</Typography>}
							{selectedtarifDetails ? (
								<>
									<Typography><strong>{t('booking.tariffName')}:</strong> {selectedtarifDetails.Name}</Typography>
									<Typography><strong>{t('booking.freeKm')}:</strong> {selectedtarifDetails.Freikilometer !== null ? `${selectedtarifDetails.Freikilometer} km` : t('booking.unlimited')}</Typography>
									<Typography><strong>{t('booking.insurance')}:</strong> {selectedtarifDetails.Versicherungsschutz}</Typography>
								</>
							) : (
								!loadingTarife && <Typography>{t('booking.selectTariff')}</Typography>
							)}
						</Paper>
					</Grid>
				</Grid>

				<Paper elevation={3} sx={{ p: 3 }}>
					<Box component="form" onSubmit={handleBookingSubmit} noValidate>
						<Grid container spacing={2}>
							<Grid item size={12}>
								<DateTimePicker
									label={t('booking.startDateTime')}
									value={startDate}
									onChange={(newValue) => setStartDate(newValue)}
									ampm={false} // Use 24-hour format
									slotProps={{
										actionBar: { actions: ["cancel", "today", "accept"] },
										textField: { fullWidth: true }
									}}
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label={t('booking.pickupPostalCode')}
									id="abholPlz"
									name="abholPlz"
									value={abholPlz}
									onChange={e => setAbholPlz(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder={t('booking.pickupPostalCodePlaceholder')}
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label={t('booking.pickupCity')}
									id="abholort"
									name="abholort"
									value={abholort}
									onChange={e => setAbholort(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder={t('booking.pickupCityPlaceholder')}
								/>
							</Grid>
							<Grid item size={12}>
								<DateTimePicker
									label={t('booking.endDateTime')}
									value={endDate}
									onChange={(newValue) => setEndDate(newValue)}
									ampm={false} // Use 24-hour format
									slotProps={{
										actionBar: { actions: ["cancel", "today", "accept"] },
										textField: { fullWidth: true }
									}}
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label={t('booking.returnPostalCode')}
									id="rueckgabePlz"
									name="rueckgabePlz"
									value={rueckgabePlz}
									onChange={e => setRueckgabePlz(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder={t('booking.returnPostalCodePlaceholder')}
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label={t('booking.returnCity')}
									id="rueckgabeort"
									name="rueckgabeort"
									value={rueckgabeort}
									onChange={e => setRueckgabeort(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder={t('booking.returnCityPlaceholder')}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControl fullWidth required margin="normal">
									<InputLabel id="tarif-select-label">{t('booking.selectTariffLabel')}</InputLabel>
									<Select
										labelId="tarif-select-label"
										id="tarif"
										value={selectedTarifId}
										label={t('booking.selectTariffLabel')}
										onChange={e => setSelectedTarifId(e.target.value)}
										disabled={loadingTarife || tarife.length === 0}
									>
										{loadingTarife && <MenuItem value=""><em>{t('booking.loadingTariffs')}</em></MenuItem>}
										{!loadingTarife && tarife.length === 0 && <MenuItem value=""><em>{t('booking.noTariffsAvailable')}</em></MenuItem>}
										{tarife.map(tarif => (
											<MenuItem key={tarif.TarifID} value={tarif.TarifID}>
												{tarif.Name}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						</Grid>

						<Box sx={{ mt: 3, p: 2, borderTop: 1, borderColor: 'divider' }}>
							<Typography variant="h6">{t('booking.estimatedTotalPrice')}</Typography>
							<Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
								{calculatedPrice.toFixed(2)} €
							</Typography>
							<Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
								{t('booking.priceBasedOn')}
							</Typography>
						</Box>

						{bookingMessage && <Alert severity="success" sx={{ mt: 2 }}>{bookingMessage}</Alert>}
						{bookingError && <Alert severity="error" sx={{ mt: 2 }}>{bookingError}</Alert>}

						<Button
							type="submit"
							variant="contained"
							color="primary"
							fullWidth
							size="large"
							sx={{ mt: 3, py: 1.5 }}
							disabled={loadingVehicle || loadingTarife || !vehicle || !model || tarife.length === 0 || !startDate || !endDate || !abholPlz || !abholort || !rueckgabePlz || !rueckgabeort}
						>
							{t('booking.reserveNow')}
						</Button>
					</Box>
				</Paper>
			</Container>
		</LocalizationProvider>
	);
}