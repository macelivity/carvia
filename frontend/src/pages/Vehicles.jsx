import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Vehicles() {
	const [vehicles, setVehicles] = useState([]);
	const [models, setModels] = useState({});

	useEffect(() => {
		// Fahrzeuge laden
		axios.get('/api/fahrzeug')
			.then(res => setVehicles(res.data))
			.catch(() => setVehicles([]));
		// Modelle laden
		axios.get('/api/modell')
			.then(res => {
				const modelMap = {};
				res.data.forEach(m => { modelMap[m.ModellID] = m; });
				setModels(modelMap);
			})
			.catch(() => setModels({}));
	}, []);

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">Verfügbare Fahrzeuge</h2>
			{vehicles.length === 0 ? (
				<p>Keine Fahrzeuge verfügbar.</p>
			) : (
				<ul className="grid gap-4 md:grid-cols-2">
					{vehicles.map(car => {
						const modell = models[car.ModellID] || {};
						return (
							<li key={car.FahrzeugID} className="p-4 border rounded shadow bg-white">
								<h3 className="font-semibold mb-1">{modell.ModellName || 'Unbekanntes Modell'}</h3>
								<p className="text-sm text-gray-600 mb-1">Hersteller: {modell.Hersteller}</p>
								<p>Kennzeichen: {car.Kennzeichen}</p>
								<p>Zustand: {car.Reperaturzustand}</p>
								<p>Aktiv: {car.Aktiv ? 'Ja' : 'Nein'}</p>
								<p>Reifen: {car.Reifen}</p>
								<p>Kilometerstand: {car.Kilometerstand} km</p>
								<p>Letzter Service: {car.LetzterService}</p>
								<p>TÜV: {car.TuevDatum}</p>
								<p>Erstzulassung: {car.ErstzulassungsDatum}</p>
								{modell.Stundenpreis && <p>Preis: {modell.Stundenpreis} €/Stunde</p>}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}
