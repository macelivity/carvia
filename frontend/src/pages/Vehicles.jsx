import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet'; // Import Circle
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css';
import 'leaflet-defaulticon-compatibility';
import { getCoordinatesFromPostalCodeAndCity, getFilteredVehicles, getVehicleLocation } from '../api/api';
import L, { Icon, latLng } from 'leaflet'; // Import latLng and L

// OptionalFilterModal außerhalb der Vehicles-Komponente definieren
const OptionalFilterModal = ({
	isOpen,
	currentFilters,
	onFilterChange,
	onReset,
	onCancel,
	onApply
}) => {
	if (!isOpen) {
		return null;
	}

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
            <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">Optionale Fahrzeugfilter</h3>
                    <form className="space-y-4 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="modal_hersteller" className="block text-sm font-medium text-gray-700">Hersteller</label>
                                <input type="text" name="hersteller" id="modal_hersteller" value={currentFilters.hersteller || ''} onChange={onFilterChange} placeholder="z.B. BMW" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="modal_fahrzeugtyp" className="block text-sm font-medium text-gray-700">Fahrzeugtyp</label>
                                <input type="text" name="fahrzeugtyp" id="modal_fahrzeugtyp" value={currentFilters.fahrzeugtyp || ''} onChange={onFilterChange} placeholder="z.B. SUV" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="modal_getriebeart" className="block text-sm font-medium text-gray-700">Getriebeart</label>
                                <input type="text" name="getriebeart" id="modal_getriebeart" value={currentFilters.getriebeart || ''} onChange={onFilterChange} placeholder="z.B. Automatik" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label htmlFor="modal_sitze" className="block text-sm font-medium text-gray-700">Sitze (mind.)</label>
                                <input type="number" name="sitze" id="modal_sitze" value={currentFilters.sitze || ''} onChange={onFilterChange} placeholder="z.B. 5" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="modal_stundenpreis" className="block text-sm font-medium text-gray-700">Max. Preis/Stunde (€)</label>
                                <input type="number" step="0.01" name="stundenpreis" id="modal_stundenpreis" value={currentFilters.stundenpreis || ''} onChange={onFilterChange} placeholder="z.B. 15.50" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
							<div className="md:col-span-2">
								<label htmlFor="modal_radius" className="block text-sm font-medium text-gray-700">Max. Umkreis vom Startort (km)</label>
								<input type="number" step="1" min={1} name="radius" id="modal_radius" value={currentFilters.radius || ''} onChange={onFilterChange} placeholder="z.B. 10" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
							</div>
                        </div>
                        <div className="items-center px-4 py-3 space-x-2 flex justify-end border-t mt-6">
                            <button type="button" onClick={onReset} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none">Zurücksetzen</button>
                            <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none">Abbrechen</button>
                            <button type="button" onClick={onApply} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">Anwenden</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
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

    const [vehicles, setVehicles] = useState([]);
	const [pickupLocationCoords, setPickupLocationCoords] = useState(null); // For "Jetzt" search
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
	const [hasSearched, setHasSearched] = useState(false);

    const [currentActiveFilters, setCurrentActiveFilters] = useState({});
    const [searchNowAvailable, setSearchNowAvailable] = useState(false);

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [modalInitialFilters, setModalInitialFilters] = useState({});

    const executeFetchVehicles = (filtersToUse, searchNowAvailable) => {
        setLoading(true);
        setError('');
        setVehicles([]);

        const params = new URLSearchParams();
        // Radius is a frontend filter, not sent to backend
        ['start_datum', 'end_datum', 'hersteller', 'fahrzeugtyp', 'getriebeart', 'sitze', 'stundenpreis'].forEach(key => {
            if (filtersToUse[key]) {
                params.append(key, filtersToUse[key]);
            }
        });


        getFilteredVehicles(params)
            .then(async res => {
				console.log(filtersToUse)
                let fetchedVehicles = res.data;

                var vehiclesToDisplay = []; // Initialize with an empty array

                if (searchNowAvailable && fetchedVehicles.length > 0 && user) {
                    try {
                        const locationPromises = fetchedVehicles.map(car =>
                            getVehicleLocation(car.FahrzeugID)
                                .then(locRes => ({ car: car, location: locRes.data }))
                                .catch(locErr => {
                                    console.warn(`Echtzeit-Position für Fahrzeug ${car.FahrzeugID} nicht abrufbar: ${locErr.response?.data?.error || locErr.message}.`);
                                    return { car: car, location: null };
                                })
                        );
                        const locationResults = await Promise.all(locationPromises);

                        vehiclesToDisplay = [];
						for (const vehicle of fetchedVehicles) {
                            const locationResult = locationResults.find(r => r.car.FahrzeugID === vehicle.FahrzeugID);
                            if (locationResult && locationResult.location) {
								const car = {
									...vehicle,
									latitude: locationResult.location.Latitude,
									longitude: locationResult.location.Longitude,
								}
								// Apply radius filter if searchNowAvailable, radius is set, and start coordinates are available
								if (filtersToUse.radius && pickupLocationCoords) {
									if (!isNaN(pickupLocationCoords.lat) && !isNaN(pickupLocationCoords.lon)) {
										const pickupLocation = latLng(pickupLocationCoords.lat, pickupLocationCoords.lon);
										const radiusInMeters = parseFloat(filtersToUse.radius) * 1000;

										const vehicleLocation = latLng(car.latitude, car.longitude);
										const distance = pickupLocation.distanceTo(vehicleLocation);
										if (distance <= radiusInMeters) {
											vehiclesToDisplay.push(car);
										}
									} else {
										console.warn("Ungültige Koordinaten für Radiusfilter:", filtersToUse.abholort_latitude, filtersToUse.abholort_longitude);
									}
								}
								else if(car.latitude && car.longitude) {
									vehiclesToDisplay.push(car);
								}
							}
						}
					} catch (e) {
                        console.error("Fehler beim Abrufen der Echtzeit-Fahrzeugpositionen:", e);
                    }
                }


                setVehicles(vehiclesToDisplay);
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

    // Effekt zum Laden der Fahrzeuge basierend auf dem State von der SearchPage
    useEffect(() => {
		const {
			searchFilter,
			searchNowAvailable
		} = location.state || {};

		if (searchFilter) {
			setSearchNowAvailable(searchNowAvailable);
			let initialFiltersForFetch = { ...searchFilter };

			setCurrentActiveFilters(initialFiltersForFetch);
			getCoordinatesFromPostalCodeAndCity(searchFilter.abholort_plz, searchFilter.abholort_stadt)
				.then(coords => {
					if (coords) {
						setPickupLocationCoords(coords);
					} else {
						console.warn("Keine Koordinaten für Abholort gefunden, Suche ohne Radiusfilter.");
						setPickupLocationCoords(null);
					}
					executeFetchVehicles(initialFiltersForFetch, searchNowAvailable);
				})
		} else {
			setVehicles([]);
			setHasSearched(false);
		}
    }, [location.state, user]);

    const handleOptionalFilterChange = (e) => {
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
            radius: currentActiveFilters.radius || undefined, // Add radius to modal initial state
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
        executeFetchVehicles(currentActiveFilters, searchNowAvailable);
    };

    const handleResetOptionalFiltersInModal = () => {
        const newFilters = { // Keep mandatory filters like dates and location details
            ...currentActiveFilters, // Start with all current filters
            hersteller: '',
            fahrzeugtyp: '',
            getriebeart: '',
            sitze: 0,
            stundenpreis: 0,
            radius: undefined, // Reset radius
        };
        // Only remove abholort_latitude and abholort_longitude if they are not part of the original search criteria for "Jetzt"
        // However, for simplicity in this modal, we only reset optional visual filters.
        // The core search (dates, initial location for "Jetzt") remains.
        setCurrentActiveFilters(newFilters);
    };

    const validMarkers = vehicles.filter(v => typeof v.latitude === 'number' && typeof v.longitude === 'number');

	return (
		<div className="flex flex-col md:flex-row h-screen overflow-hidden">
			{/* OptionalFilterModal als eigenständige Komponente aufrufen und Props übergeben */}
			<OptionalFilterModal
				isOpen={isFilterModalOpen}
				currentFilters={currentActiveFilters}
				onFilterChange={handleOptionalFilterChange}
				onReset={handleResetOptionalFiltersInModal}
				onCancel={handleCancelFilter}
				onApply={handleApplyFilter}
				searchNowAvailable={searchNowAvailable} // Pass state to modal
			/>

			<div className={`w-full ${user.role !== "guest" ? 'md:w-3/5 lg:w-2/3' : 'md:w-full'} p-6 overflow-y-auto`}>
				<div className="mb-6 p-4 border rounded-lg shadow bg-gray-50 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0 sm:space-x-3">
					<h2 className="text-xl font-semibold text-gray-700">Suchergebnisse</h2>
					<div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 w-full sm:w-auto">
						<button
							type="button"
							onClick={() => navigate('/search')}
							className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md shadow"
						>
							Neue Suche starten
						</button>
						<button
							type="button"
							onClick={handleOpenFilterModal}
							className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow"
						>
							Weitere Filter anpassen...
						</button>
					</div>
				</div>

				{!hasSearched && !loading && (
					<div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
						<p className="text-lg text-gray-600">
							Bitte starten Sie eine <Link to="/search" className="text-blue-600 hover:underline">neue Suche</Link>, um Fahrzeuge anzuzeigen.
						</p>
					</div>
				)}

				{loading && <div className="text-center py-10"><p className="text-lg text-blue-600">Lade Fahrzeuge...</p></div>}

				{hasSearched && !loading && error && (
					<div className="text-center py-10 bg-red-50 p-6 rounded-lg">
						<p className="text-red-600 text-lg font-semibold">{error}</p>
					</div>
				)}

				{hasSearched && !loading && !error && vehicles.length === 0 && (
					<div className="text-center py-10 bg-yellow-50 p-6 rounded-lg">
						<p className="text-lg text-gray-700 font-semibold">Keine Fahrzeuge für die aktuellen Kriterien gefunden.</p>
						<p className="text-gray-600 mt-2">Versuchen Sie, Ihre Suchkriterien anzupassen oder eine <Link to="/search" className="text-blue-600 hover:underline">neue Suche</Link> zu starten.</p>
					</div>
				)}

				{hasSearched && !loading && !error && vehicles.length > 0 && (
					<ul className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
						{vehicles.map(car => 
							<li key={car.FahrzeugID} className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between hover:shadow-xl transition-shadow">
								<div>
									<h3 className="font-semibold text-lg mb-1 text-blue-700">{car.ModellName || 'Unbekanntes selectedVehicleModell'}</h3>
									<p className="text-sm text-gray-600">Hersteller: {car.Hersteller}</p>
									<p className="text-sm text-gray-600">Typ: {car.Fahrzeugtyp}</p>
									<p className="text-sm text-gray-600">Standort: {car.latitude && car.longitude ? 'Echtzeit-Position' : 'Nicht verfügbar'}</p>
									{car.latitude && car.longitude && ( 
										<p className="text-xs text-gray-500">Geo: {car.latitude.toFixed(4)}, {car.longitude.toFixed(4)}</p>
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
									Details & Buchen
								</Link>
							</li>
						)}
					</ul>
				)}
			</div>

			{user.role !== "guest" && (
				<div className="w-full md:w-2/5 lg:w-1/3 h-64 md:h-full sticky top-0">
					<MapContainer center={(pickupLocationCoords && searchNowAvailable) ? [pickupLocationCoords.lat, pickupLocationCoords.lon] : [53.0793, 8.8017]} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
						<TileLayer
							attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
							url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						/>
						<ChangeView markers={validMarkers} zoomToWorld={searchNowAvailable && vehicles.length > 0 && (!currentActiveFilters.radius || parseFloat(currentActiveFilters.radius) <= 0) && !pickupLocationCoords} />
						
						{/* Marker for pickup location */}
						{searchNowAvailable && pickupLocationCoords && (
							<Marker 
								position={[pickupLocationCoords.lat, pickupLocationCoords.lon]}
								icon={L.icon({
									iconUrl: '/icons/pickup-marker.svg', // Ensure you have this icon
									iconSize: [64, 64],
									iconAnchor: [32, 48]
								})}
							>
								<Popup>Abholort: {currentActiveFilters.abholort_stadt}, {currentActiveFilters.abholort_plz}</Popup>
							</Marker>
						)}

						{/* Circle for radius */}
						{searchNowAvailable && pickupLocationCoords && currentActiveFilters.radius && parseFloat(currentActiveFilters.radius) > 0 && (
							<Circle
								center={[pickupLocationCoords.lat, pickupLocationCoords.lon]}
								radius={parseFloat(currentActiveFilters.radius) * 1000} // Radius in meters
								pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
							/>
						)}

                        {validMarkers.map(car => {
                            let popupLocationText = `${car.latitude.toFixed(4)} ${car.longitude.toFixed(4)}`;

							return (
								<Marker key={car.FahrzeugID} position={[car.latitude, car.longitude]} icon={L.icon({
									iconUrl: '/icons/car-marker.svg',
									iconSize: [48, 48],
									iconAnchor: [24, 48]
								})}>
									<Popup>
										<b>{car.Hersteller} {car.ModellName}</b> <br />
										({car.Kennzeichen}) <br />
										Standort: {popupLocationText} <br />
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
											Details & Buchen
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
