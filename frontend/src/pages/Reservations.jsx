import { useEffect, useState } from 'react';
import { getReservations } from '../api/api';

export default function Reservations() {
	const [reservations, setReservations] = useState([]);

	useEffect(() => {
		getReservations().then(res => setReservations(res.data));
	}, []);

	return (
		<div className="p-6">
			<h2 className="text-xl font-bold mb-4">Meine Reservierungen</h2>
			<ul className="space-y-3">
				{reservations.map(r => (
					<li key={r.id} className="border p-3 rounded shadow">
						Fahrzeug-ID: {r.carId} – Zeitraum: {r.startTime} bis {r.endTime}
					</li>
				))}
			</ul>
		</div>
	);
}