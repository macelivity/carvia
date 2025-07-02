import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
	Container, Typography, Button, Grid, Paper, TextField, Box,
	CircularProgress, Alert, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { de } from 'date-fns/locale';
import { getModellById, getTarife, getVehicleById, reservieren } from '../api/api';

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
					throw new Error('ModellID nicht im Fahrzeugobjekt gefunden.');
				})
				.then(res => {
					setModel(res.data);
				})
				.catch(err => {
					console.error("Fehler beim Laden der Fahrzeugdetails:", err);
					setError('Fahrzeugdetails konnten nicht geladen werden.');
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
				setError(prev => prev + (prev ? '; ' : '') + 'Tarife konnten nicht geladen werden.');
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
			setBookingError('Sie müssen angemeldet sein, um zu buchen.');
			return;
		}
		if (!startDate || !endDate || !selectedTarifId ||
			!abholPlz || !abholort || !rueckgabePlz || !rueckgabeort) {
			setBookingError('Bitte füllen Sie alle erforderlichen Felder aus (Zeitraum, Orte, Tarif).');
			return;
		}
		if (startDate >= endDate) {
			setBookingError('Das Enddatum muss nach dem Startdatum liegen.');
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
			const response = await reservieren(reservationData);
			if (response.status !== 201) {
				setBookingError('Reservierung fehlgeschlagen. Bitte versuchen Sie es später erneut.');
				throw new Error('Reservierung fehlgeschlagen: ' + response.statusText);
			}
			setBookingMessage(`Reservierung erfolgreich! ID: ${response.data.id}. Sie werden in Kürze weitergeleitet...`);
			setTimeout(() => {
				navigate('/reservations');
			}, 3000);
		} catch (err) {
			console.error('Fehler bei der Reservierung:', err.response?.data || err);
			setBookingError(err.response?.data?.msg || err.response?.data?.error || 'Reservierung fehlgeschlagen. Überprüfen Sie die Fahrzeugverfügbarkeit und Ihre Eingaben.');
		}
	};

	if (loadingVehicle) {
		return (
			<Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
				<CircularProgress />
				<Typography sx={{ ml: 2 }}>Lade Fahrzeugdetails...</Typography>
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
				<Alert severity="warning">Fahrzeug nicht gefunden oder Modelldetails fehlen.</Alert>
			</Container>
		);
	}

	const selectedtarifDetails = tarife.find(t => t.TarifID === parseInt(selectedTarifId));

	return (
		<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={de}>
			<Container maxWidth="lg" sx={{ py: 4 }}> {/* Changed to lg for better spacing if needed */}
				<Button onClick={() => navigate(-1)} sx={{ mb: 2 }}>
					&larr; Zurück zur Fahrzeugübersicht
				</Button>
				<Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
					Fahrzeug buchen: {model.ModellName}
				</Typography>

				{error && !loadingVehicle && (
					<Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
				)}

				<Grid container spacing={3} sx={{ mb: 3 }}>
					{/* Fahrzeugspezifikationen und Tarifdetails nebeneinander */}
					<Grid item xs={12} md={6} size={8}>
						<Paper elevation={3} sx={{ p: 2, height: '100%' }}> {/* Added height 100% for consistent card height */}
							<Typography variant="h6" gutterBottom>Fahrzeugspezifikationen</Typography>
							<Typography><strong>Hersteller:</strong> {model.Hersteller}</Typography>
							<Typography><strong>Modell:</strong> {model.ModellName}</Typography>
							<Typography><strong>Fahrzeugtyp:</strong> {model.Fahrzeugtyp}</Typography>
							<Typography><strong>Kennzeichen:</strong> {vehicle.Kennzeichen}</Typography>
							<Typography><strong>Getriebe:</strong> {model.Getriebeart}</Typography>
							<Typography><strong>Sitze:</strong> {model.Sitze}</Typography>
							<Typography><strong>Türen:</strong> {model.Tueren}</Typography>
							<Typography><strong>Kraftstoff:</strong> {model.Kraftstoffart}</Typography>
							<Typography><strong>Leistung:</strong> {model.Leistung} PS</Typography>
						</Paper>
					</Grid>

					<Grid item xs={12} md={6} size={4}>
						<Paper elevation={3} sx={{ p: 2, height: '100%' }}> {/* Added height 100% */}
							<Typography variant="h6" gutterBottom>Tarifdetails (Ausgewählt)</Typography>
							{loadingTarife && <CircularProgress size={20} />}
							{!loadingTarife && tarife.length === 0 && <Typography>Keine Tarife verfügbar.</Typography>}
							{selectedtarifDetails ? (
								<>
									<Typography><strong>Tarifname:</strong> {selectedtarifDetails.Name}</Typography>
									<Typography><strong>Freikilometer:</strong> {selectedtarifDetails.Freikilometer !== null ? `${selectedtarifDetails.Freikilometer} km` : 'Unbegrenzt'}</Typography>
									<Typography><strong>Versicherung:</strong> {selectedtarifDetails.Versicherungsschutz}</Typography>
								</>
							) : (
								!loadingTarife && <Typography>Bitte wählen Sie einen Tarif.</Typography>
							)}
						</Paper>
					</Grid>
				</Grid>

				<Paper elevation={3} sx={{ p: 3 }}>
					<Box component="form" onSubmit={handleBookingSubmit} noValidate>
						<Grid container spacing={2}>
							<Grid item size={12}>
								<DateTimePicker
									label="Abholdatum und -zeit*"
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
									label="AbholPlz PLZ"
									id="abholPlz"
									name="abholPlz"
									value={abholPlz}
									onChange={e => setAbholPlz(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder="z.B. 28195"
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label="AbholPlz Stadt"
									id="abholort"
									name="abholort"
									value={abholort}
									onChange={e => setAbholort(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder="z.B. Bremen"
								/>
							</Grid>
							<Grid item size={12}>
								<DateTimePicker
									label="Rückgabedatum und -zeit*"
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
									label="Rückgabeort PLZ"
									id="rueckgabePlz"
									name="rueckgabePlz"
									value={rueckgabePlz}
									onChange={e => setRueckgabePlz(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder="z.B. 28215"
								/>
							</Grid>
							<Grid item size={6}>
								<TextField
									label="Rückgabeort Stadt"
									id="rueckgabeort"
									name="rueckgabeort"
									value={rueckgabeort}
									onChange={e => setRueckgabeort(e.target.value)}
									required
									fullWidth
									margin="normal"
									placeholder="z.B. Bremen"
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControl fullWidth required margin="normal">
									<InputLabel id="tarif-select-label">Tarif auswählen</InputLabel>
									<Select
										labelId="tarif-select-label"
										id="tarif"
										value={selectedTarifId}
										label="Tarif auswählen"
										onChange={e => setSelectedTarifId(e.target.value)}
										disabled={loadingTarife || tarife.length === 0}
									>
										{loadingTarife && <MenuItem value=""><em>Lade Tarife...</em></MenuItem>}
										{!loadingTarife && tarife.length === 0 && <MenuItem value=""><em>Keine Tarife verfügbar</em></MenuItem>}
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
							<Typography variant="h6">Geschätzter Gesamtpreis:</Typography>
							<Typography variant="h4" component="p" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
								{calculatedPrice.toFixed(2)} €
							</Typography>
							<Typography variant="caption" display="block" sx={{ color: 'text.secondary' }}>
								Basierend auf der Dauer und dem gewählten Tarif.
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
							Jetzt kostenpflichtig reservieren
						</Button>
					</Box>
				</Paper>
			</Container>
		</LocalizationProvider>
	);
}