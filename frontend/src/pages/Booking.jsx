import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Booking() {
  const { vehicle_id } = useParams(); // This is FahrzeugID
  const navigate = useNavigate();
  const { user } = useAuth();

  const [vehicle, setVehicle] = useState(null);
  const [model, setModel] = useState(null);
  const [tariffs, setTariffs] = useState([]);
  const [selectedTariffId, setSelectedTariffId] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [abholort, setAbholort] = useState('');
  const [rueckgabeort, setRueckgabeort] = useState('');

  const [calculatedPrice, setCalculatedPrice] = useState(0);
  
  const [loadingVehicle, setLoadingVehicle] = useState(true);
  const [loadingTariffs, setLoadingTariffs] = useState(true);
  const [error, setError] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Fetch vehicle and model details
  useEffect(() => {
    if (vehicle_id) {
      setLoadingVehicle(true);
      setError('');
      axios.get(`/api/fahrzeug/${vehicle_id}`)
        .then(res => {
          setVehicle(res.data);
          if (res.data && res.data.ModellID) {
            return axios.get(`/api/modell/${res.data.ModellID}`);
          }
          throw new Error('ModellID nicht im Fahrzeugobjekt gefunden.');
        })
        .then(res => {
          setModel(res.data);
        })
        .catch(err => {
          console.error("Fehler beim Laden der Fahrzeugdetails:", err);
          setError('Fahrzeugdetails konnten nicht geladen werden. Bitte versuchen Sie es später erneut.');
        })
        .finally(() => {
          setLoadingVehicle(false);
        });
    }
  }, [vehicle_id]);

  // Fetch tariffs
  useEffect(() => {
    setLoadingTariffs(true);
    axios.get('/api/tarif/')
      .then(res => {
        setTariffs(res.data);
        if (res.data.length > 0) {
          setSelectedTariffId(res.data[0].TarifID); // Select first tariff by default
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden der Tarife:", err);
        setError(prev => prev + (prev ? '; ' : '') + 'Tarife konnten nicht geladen werden.');
      })
      .finally(() => {
        setLoadingTariffs(false);
      });
  }, []);

  // Calculate price
  const calculatePriceCallback = useCallback(() => {
    if (startDate && endDate && selectedTariffId && tariffs.length > 0 && model) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const tariff = tariffs.find(t => t.TarifID === parseInt(selectedTariffId));

      if (start >= end) {
        setCalculatedPrice(0);
        return;
      }

      if (tariff && tariff.PreisProTag !== undefined) { // Assuming PreisProTag is available
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        
        const pricePerHour = tariff.PreisProTag / 24;
        const total = durationHours * pricePerHour;
        setCalculatedPrice(total);
      } else if (model.Stundenpreis !== undefined) { // Fallback to model's hourly price if tariff price not suitable
        const durationMs = end.getTime() - start.getTime();
        const durationHours = durationMs / (1000 * 60 * 60);
        const total = durationHours * model.Stundenpreis;
        setCalculatedPrice(total);
      } else {
        setCalculatedPrice(0);
      }
    } else {
      setCalculatedPrice(0);
    }
  }, [startDate, endDate, selectedTariffId, tariffs, model]);

  useEffect(() => {
    calculatePriceCallback();
  }, [calculatePriceCallback]);


  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingMessage('');
    setBookingError('');

    if (!user) {
      setBookingError('Sie müssen angemeldet sein, um zu buchen.');
      return;
    }
    if (!startDate || !endDate || !selectedTariffId || !abholort || !rueckgabeort) {
      setBookingError('Bitte füllen Sie alle erforderlichen Felder aus (Zeitraum, Tarif, Abhol- und Rückgabeort).');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
        setBookingError('Das Enddatum muss nach dem Startdatum liegen.');
        return;
    }

    const reservationData = {
      UserID: user.UserID,
      FahrzeugID: parseInt(vehicle_id),
      StartDatum: new Date(startDate).toISOString(),
      EndDatum: new Date(endDate).toISOString(),
      TarifID: parseInt(selectedTariffId),
      RechnungID: 1, // Placeholder - needs proper handling
      Abholort: abholort,
      Rueckgabeort: rueckgabeort,
    };

    try {
      const response = await axios.post('/api/reservations/', reservationData, {
         headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}` // If JWT is used
        }
      });
      setBookingMessage(`Reservierung erfolgreich! ID: ${response.data.id}. Sie werden weitergeleitet...`);
      setTimeout(() => {
        navigate('/reservations'); // Navigate to user's reservations page
      }, 3000);
    } catch (err) {
      console.error('Fehler bei der Reservierung:', err.response?.data || err);
      setBookingError(err.response?.data?.msg || 'Reservierung fehlgeschlagen. Überprüfen Sie die Fahrzeugverfügbarkeit und Ihre Eingaben.');
    }
  };
  
  if (loadingVehicle) {
    return <div className="p-6 text-center">Lade Fahrzeugdetails...</div>;
  }

  if (error && !vehicle) { // Show general error if vehicle couldn't be loaded
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }
  
  if (!vehicle || !model) {
    return <div className="p-6 text-center">Fahrzeug nicht gefunden oder Modelldetails fehlen.</div>;
  }

  const selectedTariffDetails = tariffs.find(t => t.TarifID === parseInt(selectedTariffId));

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline">
        &larr; Zurück zur Fahrzeugübersicht
      </button>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Fahrzeug buchen: {model.ModellName}</h1>

      {error && <p className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</p>}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Fahrzeugspezifikationen</h2>
          <p><strong>Modell:</strong> {model.ModellName}</p>
          <p><strong>Hersteller:</strong> {model.Hersteller}</p>
          <p><strong>Fahrzeugtyp:</strong> {model.Fahrzeugtyp}</p>
          <p><strong>Kennzeichen:</strong> {vehicle.Kennzeichen}</p>
          <p><strong>Getriebe:</strong> {model.Getriebeart}</p>
          <p><strong>Sitze:</strong> {model.Sitze}</p>
          <p><strong>Türen:</strong> {model.Tueren}</p>
          <p><strong>Kraftstoff:</strong> {model.Kraftstoffart}</p>
          <p><strong>Leistung:</strong> {model.Leistung} PS</p>
          {model.Stundenpreis && <p><strong>Basis-Stundenpreis (Modell):</strong> {model.Stundenpreis.toFixed(2)} €</p>}
          {/* Aktueller Abholort des Fahrzeugs ist hier nicht direkt verfügbar, müsste ggf. anders ermittelt werden */}
          <p className="mt-2 text-sm text-gray-500">Hinweis: Der angezeigte Modell-Stundenpreis dient als Referenz. Der Endpreis basiert auf dem gewählten Tarif.</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-3 text-gray-700">Tarifdetails (Ausgewählt)</h2>
          {loadingTariffs && <p>Lade Tarife...</p>}
          {!loadingTariffs && tariffs.length === 0 && <p>Keine Tarife verfügbar.</p>}
          {selectedTariffDetails ? (
            <>
              <p><strong>Tarifname:</strong> {selectedTariffDetails.Name}</p>
              <p><strong>Preis pro Tag:</strong> {selectedTariffDetails.PreisProTag ? `${selectedTariffDetails.PreisProTag.toFixed(2)} €` : 'N/A'}</p>
              <p><strong>Freikilometer:</strong> {selectedTariffDetails.Freikilometer !== null ? `${selectedTariffDetails.Freikilometer} km` : 'Unbegrenzt'}</p>
              <p><strong>Versicherung:</strong> {selectedTariffDetails.Versicherungsschutz}</p>
            </>
          ) : (
            <p>Bitte wählen Sie einen Tarif.</p>
          )}
        </div>
      </div>
      
      <form onSubmit={handleBookingSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Startdatum und -zeit</label>
          <input type="datetime-local" id="startDate" name="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">Enddatum und -zeit</label>
          <input type="datetime-local" id="endDate" name="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
         <div>
          <label htmlFor="abholort" className="block text-sm font-medium text-gray-700">Abholort (für Ihre Reservierung)</label>
          <input type="text" id="abholort" name="abholort" value={abholort} onChange={e => setAbholort(e.target.value)} required placeholder="z.B. Hauptbahnhof" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="rueckgabeort" className="block text-sm font-medium text-gray-700">Rückgabeort (für Ihre Reservierung)</label>
          <input type="text" id="rueckgabeort" name="rueckgabeort" value={rueckgabeort} onChange={e => setRueckgabeort(e.target.value)} required placeholder="z.B. Flughafen" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div>
          <label htmlFor="tariff" className="block text-sm font-medium text-gray-700">Tarif auswählen</label>
          {loadingTariffs ? <p>Lade Tarife...</p> : (
            tariffs.length > 0 ? (
              <select id="tariff" name="tariff" value={selectedTariffId} onChange={e => setSelectedTariffId(e.target.value)} required className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm">
                {tariffs.map(tariff => (
                  <option key={tariff.TarifID} value={tariff.TarifID}>
                    {tariff.Name} ({tariff.PreisProTag ? tariff.PreisProTag.toFixed(2) + '€/Tag' : 'Preis nicht spezifiziert'})
                  </option>
                ))}
              </select>
            ) : <p>Keine Tarife verfügbar.</p>
          )}
        </div>

        <div className="mt-4 p-4 border-t">
          <h3 className="text-lg font-semibold">Geschätzter Gesamtpreis:</h3>
          <p className="text-2xl font-bold text-blue-600">{calculatedPrice.toFixed(2)} €</p>
          <p className="text-xs text-gray-500">Basierend auf der Dauer und dem gewählten Tarif (Preis pro Tag / 24 für Stundenbasis).</p>
        </div>

        {bookingMessage && <p className="p-3 text-sm bg-green-100 text-green-700 rounded">{bookingMessage}</p>}
        {bookingError && <p className="p-3 text-sm bg-red-100 text-red-700 rounded">{bookingError}</p>}

        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
          disabled={loadingVehicle || loadingTariffs || !vehicle || !model || tariffs.length === 0}
        >
          Jetzt kostenpflichtig buchen
        </button>
      </form>
    </div>
  );
}