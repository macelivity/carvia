import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Link importieren
import { getRechnungByReservierungsId, getReservations } from '../api/api';

// Hilfsfunktion zum Formatieren des Datums
const formatDate = (dateString) => {
	if (!dateString) return 'N/A';
	const date = new Date(dateString);
	return `${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
};

export default function Reservations() {
	const [futureReservations, setFutureReservations] = useState([]);
	const [pastReservations, setPastReservations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		setLoading(true);
		setError(null);
		getReservations()
			.then(res => {
				const allReservations = res.data;
				const now = new Date();

				const future = [];
				const past = [];

				allReservations.forEach(async r => {
					const endDate = new Date(r.EndDatum);
					if (endDate > now) {
						future.push({ ...r, rechnung: null });
					} else {
						past.push({ ...r, rechnung: null });
					}
				});

				// Zukünftige Reservierungen: früheste zuerst (nach StartDatum)
				future.sort((a, b) => new Date(a.StartDatum) - new Date(b.StartDatum));

				// Vergangene Reservierungen: späteste zuerst (nach StartDatum)
				past.sort((a, b) => new Date(b.StartDatum) - new Date(a.StartDatum));

				setFutureReservations(future);
				setPastReservations(past);
			})
			.catch(err => {
				console.error("Fehler beim Laden der Reservierungen:", err);
				setError("Reservierungen konnten nicht geladen werden.");
				setFutureReservations([]);
				setPastReservations([]);
			})
			.finally(() => {
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <div className="p-6 text-center">Lade Reservierungen...</div>;
	}

	if (error) {
		return <div className="p-6 text-center text-red-500">{error}</div>;
	}

	return (
		<div className="p-6 space-y-8">
			<div>
				<h2 className="text-2xl font-bold mb-4 text-blue-700">Zukünftige Reservierungen</h2>
				{futureReservations.length > 0 ? (
					<ul className="space-y-4">
						{futureReservations.map(r => (
							<li key={r.ReservierungID} className="border p-4 rounded-lg shadow bg-white flex justify-between items-center">
								<div>
									<p className="font-semibold">Reservierungs-ID: {r.ReservierungID}</p>
									<p>Fahrzeug-ID: {r.FahrzeugID} (Tarif-ID: {r.TarifID})</p>
									<p>Zeitraum: {formatDate(r.StartDatum)} – {formatDate(r.EndDatum)}</p>
								</div>
								<Link
									to={`/rechnung?reservation=${r.ReservierungID}`}
									className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
								>
									Rechnung einsehen
								</Link>
							</li>
						))}
					</ul>
				) : (
					<div>
						<p className="text-gray-600 mb-2">Keine zukünftigen Reservierungen vorhanden.</p>
						<p className="text-gray-600">
							Möchten Sie verfügbare Fahrzeuge ansehen?
							<Link to="/search" className="text-blue-600 hover:text-blue-800 underline ml-1">
								Zur Fahrzeugübersicht
							</Link>
						</p>
					</div>
				)}
			</div>

			<div>
				<h2 className="text-2xl font-bold mb-4 text-blue-700">Vergangene Reservierungen</h2>
				{pastReservations.length > 0 ? (
					<ul className="space-y-4">
						{pastReservations.map(r => {
							console.log(r)
							return (
								<li key={r.ReservierungID} className="border p-4 rounded-lg shadow bg-gray-50 flex justify-between items-center">
									<div>
										<p className="font-semibold">Reservierungs-ID: {r.ReservierungID}</p>
										<p>Fahrzeug-ID: {r.FahrzeugID} (Tarif-ID: {r.TarifID})</p>
										<p>Zeitraum: {formatDate(r.StartDatum)} – {formatDate(r.EndDatum)}</p>
									</div>
									<Link
										to={`/rechnung?reservation=${r.ReservierungID}`}
										className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
									>
										Rechnung einsehen
									</Link>
								</li>
							)
						})}
					</ul>
				) : (
					<p className="text-gray-600">Keine vergangenen Reservierungen vorhanden.</p>
				)}
			</div>
		</div>
	);
}