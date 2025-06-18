import axios from 'axios';

const API = axios.create({
	baseURL: '/api', // Proxy in vite.config.js leitet dies an http://localhost:5000 weiter
	withCredentials: true,
});

// Interceptor, um den Token zu jedem Request hinzuzufügen, falls vorhanden
API.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export const login = (data) => API.post('/auth/login', data); // Pfad an Backend angepasst
export const register = (data) => API.post('/auth/register', data); // Pfad an Backend angepasst
export const getProfile = () => API.get('/auth/profile'); // Neuer Endpunkt für Profilabruf

// Die Backend-Logout-Route existiert aktuell nicht in auth_routes.py.
// JWT-Logout ist primär clientseitig (Token entfernen).
// export const logout = () => API.post('/auth/logout'); 

export const getReservations = () => API.get('/reservations');
export const createReservation = (data) => API.post('/reservations', data);

export const getFilteredVehicles = (params) => API.get(`/fahrzeug/filter?${params.toString()}`);
export const getVehicleLocation = (vehicle_id, date) => API.get(`/fahrzeug/${vehicle_id}/location${date ? `?date=${date}` : ''}`);

export default API;


/**
 * Ruft geografische Koordinaten (Breitengrad, Längengrad) für eine Postleitzahl und einen Ort
 * über die OpenStreetMap Nominatim API ab.
 *
 * @param {string} postalCode Die Postleitzahl.
 * @param {string} city Der Name des Ortes.
 * @returns {Promise<{lat: number, lon: number} | null>} Ein Promise, das zu einem Objekt
 *          mit lat und lon auflöst, oder null, wenn keine Koordinaten gefunden werden konnten
 *          oder ein Fehler aufgetreten ist.
 */
export async function getCoordinatesFromPostalCodeAndCity(postalCode, city) {
	if (!postalCode || !city) {
		console.error("Postleitzahl und Ort müssen angegeben werden.");
		return null;
	}

	const nominatimUrl = `https://nominatim.openstreetmap.org/search`;

	// Gemäß der Nominatim-Nutzungsrichtlinie ist ein benutzerdefinierter User-Agent erforderlich.
	// Passen Sie diesen für Ihre Anwendung an.
	const userAgent = 'CarviaApp/1.0 (IhrKontakt@example.com)';

	try {
		const response = await axios.get(nominatimUrl, {
			params: {
				postalcode: postalCode,
				city: city,
				countrycodes: 'DE', // Optional: Auf Deutschland beschränken, falls relevant
				format: 'json',
				limit: 1, // Wir möchten das relevanteste Ergebnis
			},
			headers: {
				'User-Agent': userAgent
			}
		});

		if (response.data && response.data.length > 0) {
			const location = response.data[0];
			const lat = parseFloat(location.lat);
			const lon = parseFloat(location.lon);

			if (!isNaN(lat) && !isNaN(lon)) {
				return { lat, lon };
			} else {
				console.error("Ungültige Koordinaten von Nominatim erhalten:", location);
				return null;
			}
		} else {
			console.warn(`Keine Koordinaten für Postleitzahl ${postalCode}, Ort ${city} gefunden.`);
			return null;
		}
	} catch (error) {
		let errorMessage = error.message;
		if (error.response) {
			// Der Request wurde gemacht und der Server antwortete mit einem Statuscode
			// der außerhalb des Bereichs von 2xx liegt
			errorMessage = `Nominatim API Fehler: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
			if (error.response.status === 403) {
				errorMessage += " (Überprüfen Sie Ihren User-Agent und die Nutzungsrichtlinien von Nominatim)";
			}
		} else if (error.request) {
			// Der Request wurde gemacht, aber keine Antwort erhalten
			errorMessage = "Keine Antwort von Nominatim erhalten.";
		}
		console.error(`Fehler beim Abrufen der Koordinaten für ${postalCode}, ${city}: ${errorMessage}`);
		return null;
	}
}