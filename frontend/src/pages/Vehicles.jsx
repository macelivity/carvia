import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation, Trans } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'; // Import Circle
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { getCoordinatesFromPostalCodeAndCity, getFilteredVehicles, getVehicleLocation } from '../api/api';
import L, { Icon, latLng } from 'leaflet'; // Import latLng and L
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Grid from '@mui/material/Grid';
import InputAdornment from '@mui/material/InputAdornment';

// OptionalFilterModal außerhalb der Vehicles-Komponente definieren
const OptionalFilterModal = ({
	isOpen,
	currentFilters,
	onFilterChange,
	onReset,
	onCancel,
	onApply
}) => {
	const { t } = useTranslation();
	
	if (!isOpen) {
		return null;
	}

    return (
        <Dialog open={isOpen} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', borderBottom: 1, borderColor: 'divider', pb: 2 }}>
                {t('vehicles.filter')}
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}> {/* Add padding top to content */}
                <Grid container spacing={2}>
                    <Grid item size={4}>
                        <TextField
                            label={t('vehicles.manufacturer')}
                            name="hersteller"
                            value={currentFilters.hersteller || ''}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.manufacturerPlaceholder')}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item size={8}>
                        <TextField
                            label={t('vehicles.model')}
                            name="modell"
                            value={currentFilters.modell || ''}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.modelPlaceholder')}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item size={12}>
                        <TextField
                            label={t('vehicles.vehicleType')}
                            name="fahrzeugtyp"
                            value={currentFilters.fahrzeugtyp || ''}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.vehicleTypePlaceholder')}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item size={12}>
                        <TextField
                            label={t('vehicles.transmission')}
                            name="getriebeart"
                            value={currentFilters.getriebeart || ''}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.transmissionPlaceholder')}
                            fullWidth
                            variant="outlined"
                        />
                    </Grid>
                    <Grid item size={12}>
                        <TextField
                            label={t('vehicles.seats')}
                            type="number"
                            name="sitze"
                            value={currentFilters.sitze || 0}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.seatsPlaceholder')}
                            fullWidth
                            variant="outlined"
                            InputProps={{ inputProps: { min: 0 } }}
                        />
                    </Grid>
                    <Grid item size={12}>
                        <TextField
                            label={t('vehicles.maxPricePerHour')}
                            type="number"
                            name="stundenpreis"
                            value={currentFilters.stundenpreis || 0}
                            onChange={onFilterChange}
                            placeholder={t('vehicles.maxPricePerHourPlaceholder')}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                                startAdornment: <InputAdornment position="start">€</InputAdornment>,
                                inputProps: { step: "0.01", min: 0 }
                            }}
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: '16px 24px', borderTop: 1, borderColor: 'divider' }}>
                <Button onClick={onReset} color="inherit">{t('vehicles.resetFilters')}</Button>
                <Button onClick={onCancel} color="secondary">{t('vehicles.cancelFilters')}</Button>
                <Button onClick={onApply} variant="contained" color="primary">{t('vehicles.applyFilters')}</Button>
            </DialogActions>
        </Dialog>
    );
};

const ChangeView = ({ markers, zoomToWorld }) => {
	const map = useMap();
	useEffect(() => {
		if (zoomToWorld) {
			map.setView([53.0793, 8.8017], 5);
		} else if (markers && markers.length > 0) {
			const validBounds = markers.filter(m => m.latitude && m.longitude)
				.map(marker => [marker.latitude, marker.longitude]);
			if (validBounds.length > 0) {
				map.fitBounds(validBounds, { padding: [50, 50], maxZoom: 14 });
			} else {
				map.setView([53.0793, 8.8017], 11);
			}
		} else {
			map.setView([53.0793, 8.8017], 11);
		}
	}, [markers, map, zoomToWorld]);
	return null;
};

export default function Vehicles() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Auth context for JWT
    const { t } = useTranslation();

    const [vehicles, setVehicles] = useState([]);
	const [vehiclesToDisplay, setVehiclesToDisplay] = useState([]); // For displaying vehicles after fetching
	const [pickupLocationCoords, setPickupLocationCoords] = useState(null); // For "Jetzt" search
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
	const [hasSearched, setHasSearched] = useState(false);

    const [currentActiveFilters, setCurrentActiveFilters] = useState({radius: 10});
    const [searchNowAvailable, setSearchNowAvailable] = useState(false);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [modalInitialFilters, setModalInitialFilters] = useState({});

    const executeFetchVehicles = (filtersToUse) => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams();
		params.append('start_datum', filtersToUse.start_datum);
		params.append('end_datum', filtersToUse.end_datum);

        getFilteredVehicles(params)
            .then(async res => {
                let fetchedVehicles = res.data;

                if (user.role !== 'guest') {
                    try {
                        const locationPromises = fetchedVehicles.map(async car => {
							return await getVehicleLocation(car.FahrzeugID, filtersToUse.start_datum)
                                .then(async locRes => {
									if (locRes.data.type === 'geolocation') {
                                    	return { car: car, longitude: locRes.data.longitude, latitude: locRes.data.latitude };
									}
									else {
										const geoCoordinates = await getCoordinatesFromPostalCodeAndCity(locRes.data.plz, locRes.data.ort)
										return { car: car, longitude: geoCoordinates.lon, latitude: geoCoordinates.lat };
									}
                                })
                                .catch(locErr => {
                                    console.warn(`Echtzeit-Position für Fahrzeug ${car.FahrzeugID} nicht abrufbar: ${locErr.response?.data?.error || locErr.message}.`);
                                    return { car: car, location: null };
                                })
							}
                        );
                        const locationResults = await Promise.all(locationPromises);

						const vehiclesWithLocation = [];
						for (const vehicle of fetchedVehicles) {
                            const vehicleLocation = locationResults.find(r => r.car.FahrzeugID === vehicle.FahrzeugID);
                            if (vehicleLocation) {
                                vehiclesWithLocation.push({ ...vehicle, longitude: vehicleLocation.longitude, latitude: vehicleLocation.latitude });
                            }
						}
						setVehicles(vehiclesWithLocation);
					} catch (e) {
                        console.error("Fehler beim Abrufen der Echtzeit-Fahrzeugpositionen:", e);
                    }
                }
				else {
					setVehicles(fetchedVehicles);
				}

                setHasSearched(true);
            })
            .catch(err => {
                console.error("Fehler beim Laden der Fahrzeuge:", err);
                setError(err.response?.data?.error || 'Fahrzeuge konnten nicht geladen werden oder keine Fahrzeuge für die Kriterien gefunden.');
                setVehicles([]);
                setHasSearched(true);
            })
            .finally(() => setLoading(false));
    };

	const executeUpdateVehicles = (filtersToUse) => {
		const vehiclesToDisplay = [];
		for (const vehicle of vehicles) {
			if (filtersToUse.hersteller && vehicle.Hersteller !== filtersToUse.hersteller) continue;
			if (filtersToUse.modell && vehicle.ModellName !== filtersToUse.modell) continue;
			if (filtersToUse.fahrzeugtyp && vehicle.Fahrzeugtyp !== filtersToUse.fahrzeugtyp) continue;
			if (filtersToUse.getriebeart && vehicle.Getriebeart !== filtersToUse.getriebeart) continue;
			if (filtersToUse.sitze && vehicle.Sitze < parseInt(filtersToUse.sitze)) continue;
			if (filtersToUse.stundenpreis && vehicle.Stundenpreis > parseFloat(filtersToUse.stundenpreis)) continue;


			if (vehicle.latitude && vehicle.longitude) {
				// Apply radius filter if searchNowAvailable, radius is set, and start coordinates are available
				if (filtersToUse.radius && pickupLocationCoords) {
					if (!isNaN(pickupLocationCoords.lat) && !isNaN(pickupLocationCoords.lon)) {
						const pickupLocation = latLng(pickupLocationCoords.lat, pickupLocationCoords.lon);
						const radiusInMeters = parseFloat(filtersToUse.radius) * 1000;

						const vehicleCoordinates = latLng(vehicle.latitude, vehicle.longitude);
						const distance = pickupLocation.distanceTo(vehicleCoordinates);
						if (distance <= radiusInMeters) {
							vehiclesToDisplay.push({ ...vehicle });
						}
					} else {
						console.warn("Ungültige Koordinaten für Radiusfilter:", filtersToUse.abholort_latitude, filtersToUse.abholort_longitude);
					}
				}
				else {
					vehiclesToDisplay.push({ ...vehicle });
				}
			}
		}
		setVehiclesToDisplay(vehiclesToDisplay);
	}

    // Effekt zum Laden der Fahrzeuge basierend auf dem State von der SearchPage
    useEffect(() => {
		const {
			searchFilter,
			searchNowAvailable
		} = location.state || {};

		if (searchFilter) {
			setSearchNowAvailable(searchNowAvailable);
			let initialFiltersForFetch = { ...searchFilter, radius: searchFilter.radius || 10 }; // Default radius if not set

			setCurrentActiveFilters(initialFiltersForFetch);
			getCoordinatesFromPostalCodeAndCity(searchFilter.abholort_plz, searchFilter.abholort_stadt)
				.then(async coords => {
					if (coords) {
						setPickupLocationCoords(coords);
					} else {
						console.warn("Keine Koordinaten für Abholort gefunden, Suche ohne Radiusfilter.");
						setPickupLocationCoords(undefined);
					}
					executeFetchVehicles(initialFiltersForFetch);
				})
		} else {
			setVehicles([]);
			setHasSearched(false);
		}
    }, [location.state, user]);

	useEffect(() => {
		if (vehicles.length > 0) {
			executeUpdateVehicles(currentActiveFilters);
		} else {
			setVehiclesToDisplay([]);
		}
	}, [vehicles]);

    const handleFilterChange = (e) => {
        setCurrentActiveFilters(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleOpenFilterModal = () => {
        setModalInitialFilters({
            hersteller: currentActiveFilters.hersteller || '',
            fahrzeugtyp: currentActiveFilters.fahrzeugtyp || '',
            getriebeart: currentActiveFilters.getriebeart || '',
            sitze: currentActiveFilters.sitze || 0,
            stundenpreis: currentActiveFilters.stundenpreis || 0,
            radius: currentActiveFilters.radius || 10, // Add radius to modal initial state
        });
        setIsFilterModalOpen(true);
    };

    const handleCancelFilter = () => {
        setCurrentActiveFilters(prev => ({
            ...prev,
            ...modalInitialFilters // Revert to filters state before opening modal
        }));
        setIsFilterModalOpen(false);
    };

    const handleApplyFilter = () => {
        setIsFilterModalOpen(false);
		executeUpdateVehicles(currentActiveFilters);
    };

	const handleRadiusChange = (e) => {
		let newFilter = { ...currentActiveFilters, radius: e.target.value };
        setCurrentActiveFilters(newFilter);
		executeUpdateVehicles(newFilter);
    };


    const handleResetFiltersInModal = () => {
        const newFilters = { // Keep mandatory filters like dates and location details
            ...currentActiveFilters, // Start with all current filters
            hersteller: '',
			modell: '',
            fahrzeugtyp: '',
            getriebeart: '',
            sitze: 0,
            stundenpreis: 0,
            radius: 10, // Reset radius
        };
        // Only remove abholort_latitude and abholort_longitude if they are not part of the original search criteria for "Jetzt"
        // However, for simplicity in this modal, we only reset optional visual filters.
        // The core search (dates, initial location for "Jetzt") remains.
        setCurrentActiveFilters(newFilters);
    };

    const validMarkers = vehiclesToDisplay.filter(v => typeof v.latitude === 'number' && typeof v.longitude === 'number');

	return (
		<div className="flex flex-col md:flex-row h-screen overflow-hidden">
			{/* OptionalFilterModal als eigenständige Komponente aufrufen und Props übergeben */}
			<OptionalFilterModal
				isOpen={isFilterModalOpen}
				currentFilters={currentActiveFilters}
				onFilterChange={handleFilterChange}
				onReset={handleResetFiltersInModal}
				onCancel={handleCancelFilter}
				onApply={handleApplyFilter}
				searchNowAvailable={searchNowAvailable} // Pass state to modal
			/>

			<div className={`w-full ${user.role !== "guest" ? 'md:w-3/5 lg:w-2/3' : 'md:w-full'} p-6 overflow-y-auto`}>
				<div className="mb-6 p-4 border rounded-lg shadow bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
					<div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 w-full sm:w-auto">
						<h2 className="text-xl font-semibold text-gray-700">{t('vehicles.searchResults')}</h2>
						{
							location.state &&
								<>
									<h2 className="text-xl font text-gray-700">{new Date(location.state.searchFilter.start_datum).toLocaleDateString('de-DE')}</h2>
									<h2 className="text-xl font text-gray-700">{location.state.searchFilter.abholort_stadt}</h2>
								</>
						}
					</div>
					<div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 w-full sm:w-auto">
						{
							user.role !== 'guest' && 
							<TextField
								label={t('vehicles.maxRadius')}
								type="number"
								name="radius"
								value={currentActiveFilters.radius}
								onChange={handleRadiusChange}
								placeholder={t('vehicles.maxRadiusPlaceholder')}
								variant="outlined"
								className="w-full sm:w-48"
								InputProps={{ inputProps: { step: 1, min: 1, max: 50 } }}
							/>
						}
						<button
							type="button"
							onClick={handleOpenFilterModal}
							className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow"
						>
							{t('vehicles.filter')}
						</button>
						<button
							type="button"
							onClick={() => navigate('/search')}
							className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow"
						>
							{t('vehicles.newSearch')}
						</button>
					</div>
				</div>

				{!hasSearched && !loading && (
					<div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
						<p className="text-lg text-gray-600">
							<Trans 
								i18nKey="vehicles.noSearchYet" 
								components={{ 
									newSearchLink: <Link to="/search" className="text-blue-600 hover:underline" />
								}} 
							/>
						</p>
					</div>
				)}

				{loading && <div className="text-center py-10"><p className="text-lg text-blue-600">{t('vehicles.loadingVehicles')}</p></div>}

				{hasSearched && !loading && error && (
					<div className="text-center py-10 bg-red-50 p-6 rounded-lg">
						<p className="text-red-600 text-lg font-semibold">{error}</p>
					</div>
				)}

				{hasSearched && !loading && !error && vehiclesToDisplay.length === 0 && (
					<div className="text-center py-10 bg-yellow-50 p-6 rounded-lg">
						<p className="text-lg text-gray-700 font-semibold">{t('vehicles.noVehiclesFound')}</p>
						<p className="text-gray-600 mt-2">
							<Trans 
								i18nKey="vehicles.adjustCriteria" 
								components={{ 
									newSearchLink: <Link to="/search" className="text-blue-600 hover:underline" />
								}} 
							/>
						</p>
					</div>
				)}

				{hasSearched && !loading && !error && vehiclesToDisplay.length > 0 && (
					<ul className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
						{vehiclesToDisplay.map(car => 
							<li key={car.FahrzeugID} className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between hover:shadow-xl transition-shadow">
								<div>
									<h3 className="font-semibold text-lg mb-1 text-blue-700">{car.ModellName || t('vehicles.unknownModel')}</h3>
									<p className="text-sm text-gray-600">{t('vehicles.manufacturer')}: {car.Hersteller}</p>
									<p className="text-sm text-gray-600">{t('vehicles.type')}: {car.Fahrzeugtyp}</p>
									<p className="text-sm text-gray-600">{t('vehicles.location')}: {car.latitude && car.longitude ? t('vehicles.realtimePosition') : t('vehicles.notAvailable')}</p>
									{car.latitude && car.longitude && ( 
										<p className="text-xs text-gray-500">{t('vehicles.geoCoords')}: {car.latitude.toFixed(4)}, {car.longitude.toFixed(4)}</p>
									)}
								</div>
								<Link
									to={`/booking/${car.FahrzeugID}`}
									state={{
										start_datum: searchNowAvailable ? 'Jetzt' : currentActiveFilters.start_datum,
										end_datum: currentActiveFilters.end_datum,
										abholort_plz: searchNowAvailable ? '' : currentActiveFilters.abholort_plz, // Added user check
										abholort_stadt: searchNowAvailable ? '' : currentActiveFilters.abholort_stadt, // Added user check
										rueckgabeort_plz: currentActiveFilters.rueckgabeort_plz, // Added user check
										rueckgabeort_stadt: currentActiveFilters.rueckgabeort_stadt, // Added user check
										fahrzeugId: car.FahrzeugID
									}}
									className="mt-4 block w-full bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-2 px-3 rounded-md text-sm"
								>
									{t('vehicles.detailsAndBook')}
								</Link>
							</li>
						)}
					</ul>
				)}
			</div>

			{user.role !== 'guest' && (
				<div className="w-full md:w-2/5 lg:w-1/3 h-64 md:h-full sticky top-0">
					<MapContainer center={pickupLocationCoords ? [pickupLocationCoords.lat, pickupLocationCoords.lon] : [53.0793, 8.8017]} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<ChangeView markers={validMarkers} zoomToWorld={searchNowAvailable && vehiclesToDisplay.length > 0 && (!currentActiveFilters.radius || parseFloat(currentActiveFilters.radius) <= 0) && !pickupLocationCoords} />
						
						{/* Marker for pickup location */}
						{
							pickupLocationCoords &&
							<Marker	
								position={[pickupLocationCoords.lat, pickupLocationCoords.lon]}
								icon={L.icon({
									iconUrl: '/icons/pickup-marker.svg', // Ensure you have this icon
									iconSize: [64, 64],
									iconAnchor: [32, 48]
								})}
							>
								<Popup>{t('vehicles.pickupLocation')}: {currentActiveFilters.abholort_stadt}, {currentActiveFilters.abholort_plz}</Popup>
							</Marker>
						}

						{/* Circle for radius */}
						{
							pickupLocationCoords && currentActiveFilters.radius && parseFloat(currentActiveFilters.radius) > 0 &&
							<Circle
								center={[pickupLocationCoords.lat, pickupLocationCoords.lon]}
								radius={parseFloat(currentActiveFilters.radius) * 1000} // Radius in meters
								pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
							/>
						}

                        {validMarkers.map(car => {
                            let popupLocationText = `${car.latitude.toFixed(4)} ${car.longitude.toFixed(4)}`;

							return (
								<Marker key={car.FahrzeugID} position={[car.latitude, car.longitude]} icon={L.icon({
									iconUrl: '/icons/car-marker.svg',
									iconSize: [48, 48],
									iconAnchor: [24, 36]
								})}>
									<Popup>
										<b>{car.Hersteller} {car.ModellName}</b> <br />
										({car.Kennzeichen}) <br />
										{t('vehicles.location')}: {popupLocationText} <br />
										<Link
											to={`/booking/${car.FahrzeugID}`}
											state={{
												start_datum: searchNowAvailable ? 'Jetzt' : currentActiveFilters.start_datum,
												end_datum: currentActiveFilters.end_datum,
												abholort_plz: searchNowAvailable ? '' : currentActiveFilters.abholort_plz, // Added user check
												abholort_stadt: searchNowAvailable ? '' : currentActiveFilters.abholort_stadt, // Added user check
												rueckgabeort_plz: currentActiveFilters.rueckgabeort_plz, // Added user check
												rueckgabeort_stadt: currentActiveFilters.rueckgabeort_stadt, // Added user check
												fahrzeugId: car.FahrzeugID
											}}
										>
											{t('vehicles.detailsAndBook')}
										</Link>
									</Popup>
								</Marker>
							);
						})}
					</MapContainer>
				</div>
			)}
		</div>
	);
}
