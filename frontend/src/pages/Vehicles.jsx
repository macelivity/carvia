import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Vehicles() {
	const [vehicles, setVehicles] = useState([]);

	useEffect(() => {
		axios.get('/api/cars') // 🔄 Ersetze ggf. durch echten API-Endpunkt
			.then(res => setVehicles(res.data))
			.catch(() => setVehicles([]));
	}, []);

	console.log(vehicles);
	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">Verfügbare Fahrzeuge</h2>
			{vehicles.length === 0 ? (
				<p>Keine Fahrzeuge verfügbar.</p>
			) : (
				<ul className="grid gap-4 md:grid-cols-2">
					{vehicles.map(car => (
						<li key={car.id} className="p-4 border rounded shadow bg-white">
							<h3 className="font-semibold">{car.model}</h3>
							<p>Standort: {car.location}</p>
							<p>Preis: {car.price} €/Stunde</p>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
