import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Übersicht und Detailansicht in einer Datei, Routing über useParams
export default function Vehicles() {
  const { model_id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Übersicht
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState({});
  // Detailansicht
  const [vehicle, setVehicle] = useState(null);
  const [modell, setModell] = useState(null);
  const [reserveMsg, setReserveMsg] = useState('');

  useEffect(() => {
    if (!model_id) {
      // Übersicht laden
      axios.get('/api/fahrzeug')
        .then(res => setVehicles(res.data))
        .catch(() => setVehicles([]));
      axios.get('/api/modell')
        .then(res => {
          const modelMap = {};
          res.data.forEach(m => { modelMap[m.ModellID] = m; });
          setModels(modelMap);
        })
        .catch(() => setModels({}));
    } else {
      // Detailansicht laden
      axios.get(`/api/fahrzeug/${model_id}`)
        .then(res => {
          setVehicle(res.data);
          // Modell laden
          return axios.get(`/api/modell/${res.data.ModellID}`);
        })
        .then(res => setModell(res.data))
        .catch(() => {
          setVehicle(null);
          setModell(null);
        });
    }
  }, [model_id]);

  // Reservierung
  const handleReserve = async () => {
    setReserveMsg('');
    try {
      await axios.post(`/api/fahrzeug/${model_id}/reserve`);
      setReserveMsg('Reservierung erfolgreich!');
    } catch {
      setReserveMsg('Reservierung fehlgeschlagen.');
    }
  };

  // Übersicht
  if (!model_id) {
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
                  <Link to={`/vehicles/${car.FahrzeugID}`} className="text-blue-600 underline">Details & Reservieren</Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Detailansicht
  if (!vehicle) {
    return <div className="p-6">Fahrzeug nicht gefunden. <button className="text-blue-600 underline" onClick={() => navigate(-1)}>Zurück</button></div>;
  }
  return (
    <div className="p-6 max-w-xl mx-auto">
      <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>Zurück zur Übersicht</button>
      <h2 className="text-2xl font-bold mb-2">{modell?.ModellName || 'Unbekanntes Modell'}</h2>
      <p className="text-gray-600 mb-1">Hersteller: {modell?.Hersteller}</p>
      {/* Zusätzliche Modelldetails */}
      {modell?.Fahrzeugtyp && <p className="text-sm text-gray-500">Typ: {modell.Fahrzeugtyp}</p>}
      {modell?.Getriebeart && <p className="text-sm text-gray-500">Getriebe: {modell.Getriebeart}</p>}
      {modell?.Kraftstoffart && <p className="text-sm text-gray-500">Kraftstoff: {modell.Kraftstoffart}</p>}
      {modell?.Leistung && <p className="text-sm text-gray-500">Leistung: {modell.Leistung} PS</p>}
      {modell?.Türen && <p className="text-sm text-gray-500">Türen: {modell.Türen}</p>}
      {modell?.Sitze && <p className="text-sm text-gray-500">Sitze: {modell.Sitze}</p>}
      {modell?.Kofferraumvolumen && <p className="text-sm text-gray-500 mb-2">Kofferraum: {modell.Kofferraumvolumen} l</p>}
      
      <p className="mt-3 font-semibold">Fahrzeugdetails:</p>
      <p>Kennzeichen: {vehicle.Kennzeichen}</p>
      <p>Zustand: {vehicle.Reperaturzustand}</p>
      <p>Aktiv: {vehicle.Aktiv ? 'Ja' : 'Nein'}</p>
      <p>Reifen: {vehicle.Reifen}</p>
      <p>Kilometerstand: {vehicle.Kilometerstand} km</p>
      <p>Letzter Service: {vehicle.LetzterService}</p>
      <p>TÜV: {vehicle.TuevDatum}</p>
      <p>Erstzulassung: {vehicle.ErstzulassungsDatum}</p>
      {modell?.Stundenpreis && <p>Preis: {modell.Stundenpreis} €/Stunde</p>}
      {user.role === 'Mitglied' && (
        <div className="mt-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleReserve}>Reservieren</button>
          {reserveMsg && <p className="mt-2">{reserveMsg}</p>}
        </div>
      )}
    </div>
  );
}
