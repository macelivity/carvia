import axios from 'axios';

const API = axios.create({
	baseURL: '/api',
	withCredentials: true
});

// Interceptor, um den Token zu jedem Request hinzuzufügen, falls vorhanden
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
	if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
	}
    return config;
});

export const login = (data) => API.post('/login', data);
export const logout = () => delete API.defaults.headers.common['Authorization'];
export const register = (data) => API.post('/account-applications', data);
export const getProfile = () => API.get('/auth/profile');
export const putProfile = (data) => API.put("/auth/profile", data);
export const changePassword = (data) => API.put('/auth/change-password', data);

// Die Backend-Logout-Route existiert aktuell nicht in auth_routes.py.
// JWT-Logout ist primär clientseitig (Token entfernen).
// export const logout = () => API.post('/auth/logout'); 

export const getReservations = () => API.get('/reservations/');
export const getUserReservations = (userId) => API.get(`/reservations/user/${userId}`);
export const createReservation = (data) => API.post('/reservations/', data);
export const getRechnung = (rechnungId) => API.get(`/invoices/${rechnungId}`);
export const getRechnungByReservierungsId = (reservierungsId) => API.get(`/reservations/${reservierungsId}/invoices`);

// Price calculation endpoints
export const calculateReservationPrice = (data) => API.post('/reservations/calculate-price', data);
export const getReservationData = (fahrzeugId) => API.post('/reservations/reservation-data', { FahrzeugID: fahrzeugId });

// Rechnung management endpoints  
export const createRechnungFromReservation = (data) => API.post('/invoices/from-reservation', data);

export const getAllVehicles = () => API.get('/cars?detailed=true');
export const getFilteredVehicles = (params) => API.get(`/cars/filter?${params.toString()}`);
export const getVehicleLocation = (vehicle_id, date) => API.get(`/cars/${vehicle_id}/location${date ? `?date=${date}` : ''}`);
export const getVehicleById = (fahrzeugId) => API.get(`/cars/${fahrzeugId}`);
export const createVehicle = (data) => API.post('/cars/', data);
export const updateVehicle = (fahrzeugId, data) => API.put(`/cars/${fahrzeugId}`, data);
export const deleteVehicle = (fahrzeugId) => API.delete(`/cars/${fahrzeugId}`);

export const getModellById = (modellId) => API.get(`/models/${modellId}`);
export const createModell = (data) => API.post('/models/', data);

export const getTarife = () => API.get('/tariffs/');

export const reservieren = (data) => API.post('/reservations/', data);

// Damage management endpoints
export const getAllDamages = () => API.get('/damages/');
export const getDamageById = (schadenId) => API.get(`/damages/${schadenId}`);
export const createDamage = (data) => API.post('/damages/', data);
export const updateDamage = (schadenId, data) => API.put(`/damages/${schadenId}`, data);
export const deleteDamage = (schadenId) => API.delete(`/damages/${schadenId}`);

// User application management endpoints
export const getPendingApplications = () => API.get('/account-applications');
export const updateApplicationStatus = (user_id, accepted) => API.put(`/account-applications/${user_id}`, { accepted });
export const checkCreditworthiness = (data) => API.post('/accounts/creditworthycheck', data);

// User search and management endpoints
export const searchUsers = (vorname, nachname) => API.get(`/accounts/search?vorname=${vorname}&nachname=${nachname}`);
export const getUserReservationsByUserId = (userId) => API.get(`/accounts/${userId}/reservations`);
export const updateReservation = (reservationId, data) => API.put(`/reservations/${reservationId}`, data);
export const deleteReservation = (reservationId) => API.delete(`/reservations/${reservationId}`);
export const getFilteredVehiclesForReservation = (params) => API.get(`/cars/filter?${params.toString()}`);


/**
 * Ruft geografische Koordinaten nur für eine Stadt über die OpenStreetMap Nominatim API ab.
 *
 * @param {string} city Der Name der Stadt.
 * @returns {Promise<{lat: number, lon: number} | null>} Ein Promise, das zu einem Objekt
 *          mit lat und lon auflöst, oder null, wenn keine Koordinaten gefunden werden konnten
 *          oder ein Fehler aufgetreten ist.
 */
export async function getCoordinatesFromCity(city) {
	if (!city || !city.trim()) {
		console.error("Stadt muss angegeben werden.");
		return null;
	}

	const nominatimUrl = `https://nominatim.openstreetmap.org/search`;
	const userAgent = 'CarviaApp/1.0 (lauris.schleussner@gmail.com)';

	try {
		const response = await axios.get(nominatimUrl, {
			params: {
				q: city.trim(),
				countrycodes: 'DE',
				format: 'json',
				limit: 1,
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
				return { lat, lon, display_name: location.display_name };
			} else {
				console.error("Ungültige Koordinaten von Nominatim erhalten:", location);
				return null;
			}
		} else {
			console.warn(`Keine Koordinaten für Stadt ${city} gefunden.`);
			return null;
		}
	} catch (error) {
		let errorMessage = error.message;
		if (error.response) {
			errorMessage = `Nominatim API Fehler: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
			if (error.response.status === 403) {
				errorMessage += " (Überprüfen Sie Ihren User-Agent und die Nutzungsrichtlinien von Nominatim)";
			}
		} else if (error.request) {
			errorMessage = "Keine Antwort von Nominatim erhalten.";
		}
		console.error(`Fehler beim Abrufen der Koordinaten für ${city}: ${errorMessage}`);
		return null;
	}
}

/**
 * Ruft geografische Koordinaten für eine Kombination aus Postleitzahl und Stadt über die OpenStreetMap Nominatim API ab.
 *
 * @param {string} plz Die Postleitzahl.
 * @param {string} city Der Name der Stadt.
 * @returns {Promise<{lat: number, lon: number} | null>} Ein Promise, das zu einem Objekt
 *          mit lat und lon auflöst, oder null, wenn keine Koordinaten gefunden werden konnten
 *          oder ein Fehler aufgetreten ist.
 */
export async function getCoordinatesFromPostalCodeAndCity(plz, city) {
    if (!plz || !city || !plz.trim() || !city.trim()) {
        console.error("PLZ und Stadt müssen angegeben werden.");
        return null;
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search`;
    const userAgent = 'CarviaApp/1.0 (lauris.schleussner@gmail.com)';

    try {
        const response = await axios.get(nominatimUrl, {
            params: {
                postalcode: plz.trim(),
                city: city.trim(),
                countrycodes: 'DE',
                format: 'json',
                limit: 1,
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
                return { lat, lon, display_name: location.display_name };
            } else {
                console.error("Ungültige Koordinaten von Nominatim erhalten:", location);
                return null;
            }
        } else {
            console.warn(`Keine Koordinaten für PLZ ${plz} und Stadt ${city} gefunden.`);
            return null;
        }
    } catch (error) {
        let errorMessage = error.message;
        if (error.response) {
            errorMessage = `Nominatim API Fehler: ${error.response.status} - ${JSON.stringify(error.response.data)}`;
            if (error.response.status === 403) {
                errorMessage += " (Überprüfen Sie Ihren User-Agent und die Nutzungsrichtlinien von Nominatim)";
            }
        } else if (error.request) {
            errorMessage = "Keine Antwort von Nominatim erhalten.";
        }
        console.error(`Fehler beim Abrufen der Koordinaten für ${plz} ${city}: ${errorMessage}`);
        return null;
    }
}