import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Übersicht und Detailansicht in einer Datei, Routing über useParams
export default function Vehicles() {
  const { model_id } = useParams(); // Bezieht sich auf FahrzeugID in diesem Kontext
  const navigate = useNavigate();
  const { user } = useAuth();

  // Übersicht
  const [vehicles, setVehicles] = useState([]);
  const [models, setModels] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter-States
  const [filters, setFilters] = useState({
    start_datum: '',
    end_datum: '',
    hersteller: '',
    fahrzeugtyp: '',
    getriebeart: '',
    sitze: '',
    stundenpreis: '',
    abholort: '',
    rueckgabeort: ''
  });

  // Detailansicht
  const [vehicle, setVehicle] = useState(null);
  const [modell, setModell] = useState(null);
  const [reserveMsg, setReserveMsg] = useState('');

  const fetchVehicles = (currentFilters) => {
    setLoading(true);
    setError('');
    
    const params = new URLSearchParams();
    for (const key in currentFilters) {
      if (currentFilters[key]) { // Nur Filter mit Werten hinzufügen
        params.append(key, currentFilters[key]);
      }
    }
    const endpoint = params.toString() ? `/api/fahrzeug/filter?${params.toString()}` : '/api/fahrzeug';

    axios.get(endpoint)
      .then(res => setVehicles(res.data))
      .catch(err => {
        console.error("Fehler beim Laden der Fahrzeuge:", err);
        setError('Fahrzeuge konnten nicht geladen werden.');
        setVehicles([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!model_id) {
      // Übersicht laden (initial ohne Filter, oder mit aktuellen Filtern, falls schon gesetzt)
      fetchVehicles(filters);

      // Modelle immer laden für die Anzeige
      axios.get('/api/modell')
        .then(res => {
          const modelMap = {};
          res.data.forEach(m => { modelMap[m.ModellID] = m; });
          setModels(modelMap);
        })
        .catch(() => setModels({}));
    } else {
      // Detailansicht laden
      setLoading(true);
      setError('');
      axios.get(`/api/fahrzeug/${model_id}`)
        .then(res => {
          setVehicle(res.data);
          if (res.data && res.data.ModellID) {
            return axios.get(`/api/modell/${res.data.ModellID}`);
          }
          throw new Error("ModellID nicht im Fahrzeugobjekt gefunden.");
        })
        .then(res => setModell(res.data))
        .catch(err => {
          console.error("Fehler beim Laden der Fahrzeugdetails:", err);
          setError('Fahrzeugdetails konnten nicht geladen werden.');
          setVehicle(null);
          setModell(null);
        })
        .finally(() => setLoading(false));
    }
  }, [model_id]); // Abhängigkeit von model_id, nicht von filters hier, um Re-Fetchen bei Filteränderung zu steuern

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchVehicles(filters);
  };

  const handleResetFilters = () => {
    const resetFiltersState = {
        start_datum: '', end_datum: '', hersteller: '', fahrzeugtyp: '',
        getriebeart: '', sitze: '', stundenpreis: '', abholort: '', rueckgabeort: ''
    };
    setFilters(resetFiltersState);
    fetchVehicles(resetFiltersState); // Fahrzeuge mit zurückgesetzten Filtern neu laden
  };


  // Reservierung
  const handleReserve = async () => {
    if (!user || !vehicle) {
        setReserveMsg('Benutzer nicht angemeldet oder Fahrzeugdetails fehlen.');
        return;
    }
    setReserveMsg('Reservierung wird verarbeitet...');
    try {
      // Annahme: Die Reservierungs-API benötigt UserID, FahrzeugID, Start- und Enddatum
      // Diese Daten müssen hier noch erfasst oder aus einem Kontext geholt werden.
      // Für dieses Beispiel wird ein Platzhalter verwendet.
      // TODO: Echte Reservierungsdaten erfassen (z.B. über ein Modal oder separate Felder)
      const reservationData = {
        UserID: user.UserID, // Annahme: UserID ist im user-Objekt verfügbar
        FahrzeugID: vehicle.FahrzeugID,
        Reservierungsbeginn: new Date().toISOString(), // Platzhalter
        Reservierungsende: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(), // Platzhalter: 2 Stunden später
        // RechnungID und TarifID müssen ggf. auch übergeben werden, je nach API-Definition
        RechnungID: 1, // Platzhalter
        TarifID: modell?.TarifID || 1 // Platzhalter, ggf. TarifID vom Modell nehmen
      };
      
      await axios.post(`/api/reservations/`, reservationData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Falls JWT benötigt wird
        }
      });
      setReserveMsg('Reservierung erfolgreich!');
      // Optional: Weiterleitung oder Aktualisierung der Ansicht
    } catch(err) {
        console.error("Reservierungsfehler:", err.response?.data || err.message);
        setReserveMsg(`Reservierung fehlgeschlagen: ${err.response?.data?.msg || 'Serverfehler'}`);
    }
  };

  // Übersicht
  if (!model_id) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Fahrzeuge finden</h2>
        
        <form onSubmit={handleApplyFilters} className="mb-6 p-4 border rounded shadow bg-gray-50 space-y-6">
          {/* Kategorie: Zeitraum und Ort */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">Abholung und Rückgabe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_datum" className="block text-sm font-medium text-gray-700">Verfügbar ab (Datum & Zeit)</label>
                <input type="datetime-local" name="start_datum" id="start_datum" value={filters.start_datum} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="abholort" className="block text-sm font-medium text-gray-700">Abholort</label>
                <input type="text" name="abholort" id="abholort" value={filters.abholort} onChange={handleFilterChange} placeholder="z.B. Bremen Zentrum" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="end_datum" className="block text-sm font-medium text-gray-700">Verfügbar bis (Datum & Zeit)</label>
                <input type="datetime-local" name="end_datum" id="end_datum" value={filters.end_datum} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="rueckgabeort" className="block text-sm font-medium text-gray-700">Rückgabeort</label>
                <input type="text" name="rueckgabeort" id="rueckgabeort" value={filters.rueckgabeort} onChange={handleFilterChange} placeholder="z.B. Bremen Zentrum" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              {/* Optional: Rueckgabeort, falls benötigt
              <div>
                <label htmlFor="rueckgabeort" className="block text-sm font-medium text-gray-700">Rückgabeort</label>
                <input type="text" name="rueckgabeort" id="rueckgabeort" value={filters.rueckgabeort} onChange={handleFilterChange} placeholder="z.B. Bremen Flughafen" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              */}
            </div>
          </div>

          {/* Kategorie: Fahrzeugspezifikationen */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-700 border-b pb-1">Fahrzeug</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="hersteller" className="block text-sm font-medium text-gray-700">Hersteller</label>
                <input type="text" name="hersteller" id="hersteller" value={filters.hersteller} onChange={handleFilterChange} placeholder="z.B. BMW" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="fahrzeugtyp" className="block text-sm font-medium text-gray-700">Fahrzeugtyp</label>
                <input type="text" name="fahrzeugtyp" id="fahrzeugtyp" value={filters.fahrzeugtyp} onChange={handleFilterChange} placeholder="z.B. SUV" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="getriebeart" className="block text-sm font-medium text-gray-700">Getriebeart</label>
                <input type="text" name="getriebeart" id="getriebeart" value={filters.getriebeart} onChange={handleFilterChange} placeholder="z.B. Automatik" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="sitze" className="block text-sm font-medium text-gray-700">Sitze (mind.)</label>
                <input type="number" name="sitze" id="sitze" value={filters.sitze} onChange={handleFilterChange} placeholder="z.B. 5" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
              <div>
                <label htmlFor="stundenpreis" className="block text-sm font-medium text-gray-700">Max. Preis/Stunde (€)</label>
                <input type="number" step="0.01" name="stundenpreis" id="stundenpreis" value={filters.stundenpreis} onChange={handleFilterChange} placeholder="z.B. 15.50" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
              Filter anwenden
            </button>
            <button type="button" onClick={handleResetFilters} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded">
              Filter zurücksetzen
            </button>
          </div>
        </form>

        {loading && <p>Lade Fahrzeuge...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && vehicles.length === 0 && (
          <p>Keine Fahrzeuge für die aktuellen Filterkriterien gefunden.</p>
        )}
        {!loading && !error && vehicles.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map(car => {
              const currentModell = models[car.ModellID] || {};
              return (
                <li key={car.FahrzeugID} className="p-4 border rounded shadow bg-white flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{currentModell.ModellName || 'Unbekanntes Modell'}</h3>
                    <p className="text-sm text-gray-600 mb-1">Hersteller: {currentModell.Hersteller}</p>
                    <p className="text-sm text-gray-600">Typ: {currentModell.Fahrzeugtyp}</p>
                    <p className="text-sm text-gray-600">Sitze: {currentModell.Sitze}</p>
                    <p className="text-sm text-gray-600">Getriebe: {currentModell.Getriebeart}</p>
                    {currentModell.Stundenpreis && <p className="text-sm text-gray-600 font-medium mt-1">Preis: {currentModell.Stundenpreis} €/Stunde</p>}
                    <p className="text-sm text-gray-600">Kennzeichen: {car.Kennzeichen}</p>
                    {/* Abholort des Fahrzeugs anzeigen, falls in Fahrzeugdaten vorhanden */}
                    {/* <p className="text-sm text-gray-600">Standort: {car.Abholort || 'N/A'}</p> */}
                  </div>
                  <Link to={`/vehicles/${car.FahrzeugID}`} className="mt-3 inline-block bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-2 px-3 rounded text-sm">
                    Details & Reservieren
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Detailansicht
  if (loading && !vehicle) { // Ladeanzeige für Detailansicht
    return <div className="p-6 text-center">Lade Fahrzeugdetails...</div>;
  }
  if (error && !vehicle) { // Fehleranzeige, falls Fahrzeug nicht geladen werden konnte
    return <div className="p-6 text-center text-red-500">{error} <button className="text-blue-600 underline ml-2" onClick={() => navigate(-1)}>Zurück</button></div>;
  }
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
      {/* Abholort des Fahrzeugs anzeigen, falls in Fahrzeugdaten vorhanden */}
      {/* <p>Standort: {vehicle.Abholort || 'N/A'}</p> */}
      {modell?.Stundenpreis && <p className="font-semibold mt-2">Preis: {modell.Stundenpreis.toFixed(2)} €/Stunde</p>}
      
      {user && user.RolleID === 1 && vehicle.Aktiv && ( // Annahme: RolleID 1 ist 'Mitglied'
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Dieses Fahrzeug reservieren</h3>
          {/* Hier könnten Eingabefelder für Start- und Enddatum der Reservierung hinzukommen */}
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" 
            onClick={handleReserve}
            disabled={!vehicle.Aktiv} // Deaktiviere Button, wenn Fahrzeug nicht aktiv
          >
            Jetzt Reservieren
          </button>
          {reserveMsg && <p className={`mt-2 text-sm ${reserveMsg.startsWith('Reservierung erfolgreich') ? 'text-green-600' : 'text-red-600'}`}>{reserveMsg}</p>}
        </div>
      )}
      {!vehicle.Aktiv && <p className="mt-4 text-red-600 font-semibold">Dieses Fahrzeug ist derzeit nicht aktiv und kann nicht reserviert werden.</p>}
    </div>
  );
}
