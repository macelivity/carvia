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
  const [loading, setLoading] = useState(false); // Initial nicht laden
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false); // Zustand, ob eine Suche durchgeführt wurde

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
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [pageError, setPageError] = useState(''); // Fehler für die Hauptseite (Pflichtfelder)


  // Detailansicht
  const [vehicle, setVehicle] = useState(null);
  const [modell, setModell] = useState(null);
  const [reserveMsg, setReserveMsg] = useState('');

  const fetchVehicles = (currentFilters) => {
    setLoading(true);
    setError(''); // API-Fehler zurücksetzen
    setPageError(''); // Seitenfehler zurücksetzen
    setVehicles([]); 
    
    const params = new URLSearchParams();
    for (const key in currentFilters) {
      if (currentFilters[key]) {
        params.append(key, currentFilters[key]);
      }
    }
    const endpoint = `/api/fahrzeug/filter?${params.toString()}`;

    axios.get(endpoint)
      .then(res => {
        setVehicles(res.data);
        setHasSearched(true);
      })
      .catch(err => {
        console.error("Fehler beim Laden der Fahrzeuge:", err);
        setError('Fahrzeuge konnten nicht geladen werden oder keine Fahrzeuge für die Kriterien gefunden.');
        setVehicles([]);
        setHasSearched(true); 
      })
      .finally(() => setLoading(false));
  };

  // Lade Modelle einmalig, wenn die Komponente für die Übersicht geladen wird
  useEffect(() => {
    if (!model_id) {
      axios.get('/api/modell')
        .then(res => {
          const modelMap = {};
          res.data.forEach(m => { modelMap[m.ModellID] = m; });
          setModels(modelMap);
        })
        .catch(() => setModels({}));
    }
  }, [model_id]);

  // Lade Fahrzeugdetails für die Detailansicht
   useEffect(() => {
    if (model_id) {
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
  }, [model_id]);


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
    setPageError(''); 
  };

  const handlePrimarySearch = (e) => {
    e.preventDefault();
    setPageError('');
    if (!filters.start_datum || !filters.end_datum || !filters.abholort || !filters.rueckgabeort) {
      setPageError('Bitte füllen Sie Abhol-/Rückgabezeit und -ort aus, um die Suche zu starten.');
      return;
    }
    if (new Date(filters.start_datum) >= new Date(filters.end_datum)) {
      setPageError('Das Rückgabedatum muss nach dem Abholdatum liegen.');
      return;
    }
    fetchVehicles(filters);
  };
  
  const handleApplyOptionalFilters = () => {
    // Diese Funktion wird vom Modal aufgerufen, nachdem optionale Filter geändert wurden.
    // Sie löst eine neue Suche aus, wenn bereits eine primäre Suche durchgeführt wurde.
    setIsFilterModalOpen(false);
    if (hasSearched && filters.start_datum && filters.end_datum && filters.abholort && filters.rueckgabeort) {
        fetchVehicles(filters); // Erneut suchen mit allen Filtern
    } else if (!filters.start_datum || !filters.end_datum || !filters.abholort || !filters.rueckgabeort) {
        setPageError('Bitte zuerst die Pflichtfelder (Zeit/Ort) ausfüllen und die Hauptsuche starten.');
    }
  };


  const handleResetAllFilters = () => {
    const resetFiltersState = {
        start_datum: '', end_datum: '', hersteller: '', fahrzeugtyp: '',
        getriebeart: '', sitze: '', stundenpreis: '', abholort: '', rueckgabeort: ''
    };
    setFilters(resetFiltersState);
    setPageError('');
    setError('');
    setVehicles([]); 
    setHasSearched(false);
    setIsFilterModalOpen(false);
  };
  
  const handleResetOptionalFiltersInModal = () => {
    setFilters(prevFilters => ({
        ...prevFilters,
        hersteller: '',
        fahrzeugtyp: '',
        getriebeart: '',
        sitze: '',
        stundenpreis: '',
    }));
  };


  const handleReserve = async () => {
    if (!user || !vehicle) {
        setReserveMsg('Benutzer nicht angemeldet oder Fahrzeugdetails fehlen.');
        return;
    }
    setReserveMsg('Reservierung wird verarbeitet...');
    try {
      // Die Daten für die Reservierung sollten von der Booking-Seite kommen oder hier explizit gesetzt werden.
      // Die Filter-Daten sind für die Suche, nicht direkt für die Reservierung eines spezifischen Fahrzeugs.
      const reservationData = {
        UserID: user.UserID, 
        FahrzeugID: vehicle.FahrzeugID,
        // StartDatum, EndDatum, Abholort, Rueckgabeort für die Reservierung müssen hier
        // entweder aus den Filtern übernommen werden (falls sie für DIESE Buchung gelten sollen)
        // oder idealerweise von einer dedizierten Buchungsseite kommen.
        // Hier als Beispiel Übernahme aus Filtern, wenn vorhanden:
        StartDatum: filters.start_datum ? new Date(filters.start_datum).toISOString() : new Date().toISOString(),
        EndDatum: filters.end_datum ? new Date(filters.end_datum).toISOString() : new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        Abholort: filters.abholort || "Nicht spezifiziert",
        Rueckgabeort: filters.rueckgabeort || "Nicht spezifiziert",
        RechnungID: 1, // Platzhalter
        TarifID: modell?.TarifID || 1, // Platzhalter
      };
      
      await axios.post(`/api/reservations/`, reservationData, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReserveMsg('Reservierung erfolgreich!');
    } catch(err) {
        console.error("Reservierungsfehler:", err.response?.data || err.message);
        setReserveMsg(`Reservierung fehlgeschlagen: ${err.response?.data?.msg || 'Serverfehler'}`);
    }
  };


  // Filter Modal JSX (nur noch optionale Filter)
  const OptionalFilterModal = () => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 text-center">Filter</h3>
          <form className="space-y-4 text-left">
            {/* Kategorie: Fahrzeugspezifikationen */}
            <div>
              {/* <h4 className="text-md font-semibold mb-2 text-gray-700 border-b pb-1">Fahrzeugdetails (Optional)</h4> */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal_hersteller" className="block text-sm font-medium text-gray-700">Hersteller</label>
                  <input type="text" name="hersteller" id="modal_hersteller" value={filters.hersteller} onChange={handleFilterChange} placeholder="z.B. BMW" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="modal_fahrzeugtyp" className="block text-sm font-medium text-gray-700">Fahrzeugtyp</label>
                  <input type="text" name="fahrzeugtyp" id="modal_fahrzeugtyp" value={filters.fahrzeugtyp} onChange={handleFilterChange} placeholder="z.B. SUV" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="modal_getriebeart" className="block text-sm font-medium text-gray-700">Getriebeart</label>
                  <input type="text" name="getriebeart" id="modal_getriebeart" value={filters.getriebeart} onChange={handleFilterChange} placeholder="z.B. Automatik" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div>
                  <label htmlFor="modal_sitze" className="block text-sm font-medium text-gray-700">Sitze (mind.)</label>
                  <input type="number" name="sitze" id="modal_sitze" value={filters.sitze} onChange={handleFilterChange} placeholder="z.B. 5" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="modal_stundenpreis" className="block text-sm font-medium text-gray-700">Max. Preis/Stunde (€)</label>
                  <input type="number" step="0.01" name="stundenpreis" id="modal_stundenpreis" value={filters.stundenpreis} onChange={handleFilterChange} placeholder="z.B. 15.50" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
                </div>
              </div>
            </div>
            
            <div className="items-center px-4 py-3 space-x-2 flex justify-end border-t mt-6">
              <button type="button" onClick={handleResetOptionalFiltersInModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none">
                Zurücksetzen
              </button>
              <button type="button" onClick={() => setIsFilterModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none">
                Abbrechen
              </button>
              <button type="button" onClick={handleApplyOptionalFilters} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none">
                Anwenden
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );


  // Übersicht
  if (!model_id) {
    return (
      <div className="p-6">
        {isFilterModalOpen && <OptionalFilterModal />}
        <div className="mb-8 p-6 border rounded-lg shadow-lg bg-white">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fahrzeugsuche</h2>
            <form onSubmit={handlePrimarySearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                        <label htmlFor="page_start_datum" className="block text-sm font-medium text-gray-700">Abholdatum und -zeit*</label>
                        <input type="datetime-local" name="start_datum" id="page_start_datum" value={filters.start_datum} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required/>
                    </div>
                    <div>
                        <label htmlFor="page_abholort" className="block text-sm font-medium text-gray-700">Abholort*</label>
                        <input type="text" name="abholort" id="page_abholort" value={filters.abholort} onChange={handleFilterChange} placeholder="z.B. Bremen Zentrum" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required/>
                    </div>
                    <div>
                        <label htmlFor="page_end_datum" className="block text-sm font-medium text-gray-700">Rückgabedatum und -zeit*</label>
                        <input type="datetime-local" name="end_datum" id="page_end_datum" value={filters.end_datum} onChange={handleFilterChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required/>
                    </div>
                    <div>
                        <label htmlFor="page_rueckgabeort" className="block text-sm font-medium text-gray-700">Rückgabeort*</label>
                        <input type="text" name="rueckgabeort" id="page_rueckgabeort" value={filters.rueckgabeort} onChange={handleFilterChange} placeholder="z.B. Bremen Zentrum" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" required/>
                    </div>
                </div>
                {pageError && <p className="text-red-500 text-sm mt-2">{pageError}</p>}
                <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-3">
                    <button 
                        type="submit"
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                    >
                        Fahrzeuge suchen
                    </button>
                    <button 
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)} 
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Weitere Filter...
                    </button>
                </div>
            </form>
        </div>

        {!hasSearched && (
            <div className="text-center p-10 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                <p className="text-lg text-gray-600">
                    Bitte geben Sie Abhol-/Rückgabezeit und -ort an und klicken Sie auf "Fahrzeuge suchen".
                </p>
            </div>
        )}
        
        {loading && <div className="text-center py-10"><p className="text-lg text-blue-600">Lade Fahrzeuge...</p></div>}
        
        {hasSearched && !loading && error && (
            <div className="text-center py-10 bg-red-50 p-6 rounded-lg">
                <p className="text-red-600 text-lg font-semibold">{error}</p>
                <p className="text-gray-600 mt-2">Versuchen Sie, Ihre Suchkriterien anzupassen oder überprüfen Sie die Serververbindung.</p>
            </div>
        )}

        {hasSearched && !loading && !error && vehicles.length === 0 && (
          <div className="text-center py-10 bg-yellow-50 p-6 rounded-lg">
            <p className="text-lg text-gray-700 font-semibold">Keine Fahrzeuge für die aktuellen Kriterien gefunden.</p>
            <p className="text-gray-600 mt-2">Versuchen Sie, Ihre Suchkriterien anzupassen.</p>
          </div>
        )}

        {hasSearched && !loading && !error && vehicles.length > 0 && (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {vehicles.map(car => {
              const currentModell = models[car.ModellID] || {};
              return (
                <li key={car.FahrzeugID} className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between hover:shadow-xl transition-shadow duration-300">
                  <div>
                    {currentModell.BildURL && (
                        <img src={currentModell.BildURL} alt={currentModell.ModellName || 'Fahrzeugbild'} className="w-full h-40 object-cover rounded-t-md mb-3" />
                    )}
                    <h3 className="font-semibold text-lg mb-1 text-blue-700">{currentModell.ModellName || 'Unbekanntes Modell'}</h3>
                    <p className="text-sm text-gray-600 mb-1">Hersteller: {currentModell.Hersteller}</p>
                    <p className="text-sm text-gray-600">Typ: {currentModell.Fahrzeugtyp}</p>
                    <p className="text-sm text-gray-600">Sitze: {currentModell.Sitze}</p>
                    <p className="text-sm text-gray-600">Getriebe: {currentModell.Getriebeart}</p>
                    {currentModell.Stundenpreis && <p className="text-sm text-gray-700 font-medium mt-1">Preis: {currentModell.Stundenpreis.toFixed(2)} €/Stunde</p>}
                    <p className="text-xs text-gray-500 mt-1">Kennzeichen: {car.Kennzeichen}</p>
                  </div>
                  <Link 
                    to={`/booking/${car.FahrzeugID}`} // Link zur Booking-Seite
                    state={{ // Übergabe der Suchfilter an die Booking-Seite
                        abholort: filters.abholort, 
                        rueckgabeort: filters.rueckgabeort, 
                        start_datum: filters.start_datum, 
                        end_datum: filters.end_datum,
                        fahrzeugId: car.FahrzeugID // FahrzeugID auch übergeben
                    }}
                    className="mt-4 block w-full bg-blue-500 hover:bg-blue-600 text-white text-center font-semibold py-2 px-3 rounded-md text-sm transition-colors duration-300"
                  >
                    Details & Buchen
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // Detailansicht (bleibt weitgehend gleich, aber der Button führt zur Booking-Seite)
  if (loading && !vehicle) { 
    return <div className="p-6 text-center">Lade Fahrzeugdetails...</div>;
  }
  if (error && !vehicle) { 
    return <div className="p-6 text-center text-red-500">{error} <button className="text-blue-600 underline ml-2" onClick={() => navigate(-1)}>Zurück</button></div>;
  }
  if (!vehicle) {
    return <div className="p-6">Fahrzeug nicht gefunden. <button className="text-blue-600 underline" onClick={() => navigate(-1)}>Zurück</button></div>;
  }
  // Die Detailansicht wird hier nicht mehr direkt zum Buchen verwendet, sondern leitet zur Booking-Seite weiter.
  // Daher wird die Reservierungslogik hier nicht mehr benötigt.
  return (
    <div className="p-6 max-w-xl mx-auto">
      <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>Zurück zur Übersicht</button>
      <h2 className="text-2xl font-bold mb-2">{modell?.ModellName || 'Unbekanntes Modell'}</h2>
      <p className="text-gray-600 mb-1">Hersteller: {modell?.Hersteller}</p>
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
      {modell?.Stundenpreis && <p className="font-semibold mt-2">Preis: {modell.Stundenpreis.toFixed(2)} €/Stunde</p>}
      
      {user && user.RolleID === 1 && vehicle.Aktiv && ( 
        <div className="mt-6">
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50" 
            onClick={() => navigate(`/booking/${vehicle.FahrzeugID}`, { 
                state: { // Übergabe der aktuellen Suchfilter an die Booking-Seite
                    abholort: filters.abholort, 
                    rueckgabeort: filters.rueckgabeort, 
                    start_datum: filters.start_datum, 
                    end_datum: filters.end_datum,
                    fahrzeugId: vehicle.FahrzeugID
                }
            })}
            disabled={!vehicle.Aktiv}
          >
            Zur Buchungsseite für dieses Fahrzeug
          </button>
        </div>
      )}
      {!vehicle.Aktiv && <p className="mt-4 text-red-600 font-semibold">Dieses Fahrzeug ist derzeit nicht aktiv und kann nicht gebucht werden.</p>}
    </div>
  );
}
