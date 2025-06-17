import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ModelCard from '../components/ModelCard';
import Skeleton from '@mui/material/Skeleton';

const MODELS_PER_PAGE = 12; // 4 rows × 3 cards = 12 models per page

export default function Vehicles() {
  const { fahrzeugId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for model list (overview)
  const [models, setModels] = useState([]);
  const [displayedModels, setDisplayedModels] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState('');

  // Filter state
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

  // State for vehicle detail view (when fahrzeugId is present)
  const [vehicle, setVehicle] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [reserveMsg, setReserveMsg] = useState('');

  // Intersection observer for infinite scroll
  const observer = useRef();
  const lastModelElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreModels();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);
  // Fetch models from backend with filters
  const fetchModels = async (currentFilters, page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      // PLACEHOLDER: Currently fetches all models regardless of filters
      // TODO: Replace with filtered endpoint once backend filtering is implemented
      const endpoint = '/api/modell';
      
      const response = await axios.get(endpoint);
      const allModels = response.data || []; // Get all models
      
      // Client-side pagination simulation for now
      const startIndex = (page - 1) * MODELS_PER_PAGE;
      const endIndex = startIndex + MODELS_PER_PAGE;
      const newModels = allModels.slice(startIndex, endIndex);      
      if (page === 1) {
        setModels(newModels);
        setDisplayedModels(newModels);
        setCurrentPage(1);
      } else {
        setModels(prev => [...prev, ...newModels]);
        setDisplayedModels(prev => [...prev, ...newModels]);
      }
      
      setHasMore(newModels.length === MODELS_PER_PAGE);
    } catch (err) {
      console.error("Error loading models:", err);
      setError('Could not load vehicle models.');
      if (page === 1) {
        setModels([]);
        setDisplayedModels([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load more models (for infinite scroll)
  const loadMoreModels = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchModels(filters, nextPage);
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  // Apply filters
  const handleApplyFilters = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    setHasMore(true);
    fetchModels(filters, 1);
  };

  // Reset filters
  const handleResetFilters = () => {
    const resetFilters = {
      start_datum: '', end_datum: '', hersteller: '', fahrzeugtyp: '',
      getriebeart: '', sitze: '', stundenpreis: '', abholort: '', rueckgabeort: ''
    };
    setFilters(resetFilters);
    setCurrentPage(1);
    setHasMore(true);
    fetchModels(resetFilters, 1);
  };

  // Handle model selection
  const handleSelectModel = (model) => {
    // For now, navigate to a vehicles list for this model
    // Later this can be expanded to show available vehicles for the selected model
    navigate(`/vehicles/model/${model.ModellID}`);
  };

  // Handle vehicle reservation (for detail view)
  const handleReserve = async () => {
    if (!user || !vehicle) {
      setReserveMsg('User not logged in or vehicle details missing.');
      return;
    }
    
    setReserveMsg('Processing reservation...');
    try {
      const reservationData = {
        UserID: user.UserID,
        FahrzeugID: vehicle.FahrzeugID,
        Reservierungsbeginn: new Date().toISOString(),
        Reservierungsende: new Date(new Date().getTime() + 2 * 60 * 60 * 1000).toISOString(),
        RechnungID: 1,
        TarifID: selectedModel?.TarifID || 1
      };
      
      await axios.post('/api/reservations/', reservationData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setReserveMsg('Reservation successful!');
    } catch (err) {
      console.error("Reservation error:", err.response?.data || err.message);
      setReserveMsg(`Reservation failed: ${err.response?.data?.msg || 'Server error'}`);
    }
  };

  // Load initial data or vehicle details
  useEffect(() => {
    if (!fahrzeugId) {
      // Load model overview
      fetchModels(filters, 1);
    } else {
      // Load specific vehicle details
      setLoading(true);
      setError('');
      
      axios.get(`/api/fahrzeug/${fahrzeugId}`)
        .then(res => {
          setVehicle(res.data);
          if (res.data && res.data.ModellID) {
            return axios.get(`/api/modell/${res.data.ModellID}`);
          }
          throw new Error("ModellID not found in vehicle object.");
        })
        .then(res => setSelectedModel(res.data))
        .catch(err => {
          console.error("Error loading vehicle details:", err);
          setError('Could not load vehicle details.');
          setVehicle(null);
          setSelectedModel(null);
        })
        .finally(() => setLoading(false));
    }
  }, [fahrzeugId]);

  // Model overview page
  if (!fahrzeugId) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Find Your Perfect Vehicle</h2>
        
        {/* Filter Form */}
        <form onSubmit={handleApplyFilters} className="mb-8 p-6 border rounded-lg shadow-sm bg-gray-50 space-y-6">
          {/* Date and Location Filters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Pickup and Return</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_datum" className="block text-sm font-medium text-gray-700 mb-1">
                  Available from (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  name="start_datum"
                  id="start_datum"
                  value={filters.start_datum}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="end_datum" className="block text-sm font-medium text-gray-700 mb-1">
                  Available until (Date & Time)
                </label>
                <input
                  type="datetime-local"
                  name="end_datum"
                  id="end_datum"
                  value={filters.end_datum}
                  onChange={handleFilterChange}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="abholort" className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Location
                </label>
                <input
                  type="text"
                  name="abholort"
                  id="abholort"
                  value={filters.abholort}
                  onChange={handleFilterChange}
                  placeholder="e.g. Bremen City Center"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="rueckgabeort" className="block text-sm font-medium text-gray-700 mb-1">
                  Return Location
                </label>
                <input
                  type="text"
                  name="rueckgabeort"
                  id="rueckgabeort"
                  value={filters.rueckgabeort}
                  onChange={handleFilterChange}
                  placeholder="e.g. Bremen City Center"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Specification Filters */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-700 border-b pb-2">Vehicle Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label htmlFor="hersteller" className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  name="hersteller"
                  id="hersteller"
                  value={filters.hersteller}
                  onChange={handleFilterChange}
                  placeholder="e.g. BMW"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="fahrzeugtyp" className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Type
                </label>
                <input
                  type="text"
                  name="fahrzeugtyp"
                  id="fahrzeugtyp"
                  value={filters.fahrzeugtyp}
                  onChange={handleFilterChange}
                  placeholder="e.g. SUV"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="getriebeart" className="block text-sm font-medium text-gray-700 mb-1">
                  Transmission
                </label>
                <input
                  type="text"
                  name="getriebeart"
                  id="getriebeart"
                  value={filters.getriebeart}
                  onChange={handleFilterChange}
                  placeholder="e.g. Automatic"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="sitze" className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Seats
                </label>
                <input
                  type="number"
                  name="sitze"
                  id="sitze"
                  value={filters.sitze}
                  onChange={handleFilterChange}
                  placeholder="e.g. 5"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="stundenpreis" className="block text-sm font-medium text-gray-700 mb-1">
                  Max. Price/Hour (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="stundenpreis"
                  id="stundenpreis"
                  value={filters.stundenpreis}
                  onChange={handleFilterChange}
                  placeholder="e.g. 15.50"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-6 rounded-md transition duration-200"
            >
              Reset Filters
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Results */}
        {displayedModels.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No vehicle models found for the current filter criteria.</p>
          </div>
        )}

        {displayedModels.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {displayedModels.map((model, index) => (
                <div
                  key={model.ModellID}
                  ref={index === displayedModels.length - 1 ? lastModelElementRef : null}
                >
                  <ModelCard
                    model={model}
                    onSelectModel={() => handleSelectModel(model)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {Array.from({ length: MODELS_PER_PAGE }).map((_, idx) => (
                <Skeleton key={idx} variant="rectangular" width={345} height={300} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Vehicle detail view
  if (loading && !vehicle) {
    return <div className="p-6 text-center">Loading vehicle details...</div>;
  }

  if (error && !vehicle) {
    return (
      <div className="p-6 text-center text-red-500">
        {error}
        <button className="text-blue-600 underline ml-2" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        Vehicle not found.
        <button className="text-blue-600 underline" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button className="mb-4 text-blue-600 underline" onClick={() => navigate(-1)}>
        ← Back to Overview
      </button>
      
      <h2 className="text-3xl font-bold mb-4">{selectedModel?.ModellName || 'Unknown Model'}</h2>
      
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Model Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-medium">Manufacturer:</span> {selectedModel?.Hersteller}</p>
          <p><span className="font-medium">Type:</span> {selectedModel?.Fahrzeugtyp}</p>
          <p><span className="font-medium">Transmission:</span> {selectedModel?.Getriebeart}</p>
          <p><span className="font-medium">Fuel:</span> {selectedModel?.Kraftstoffart}</p>
          <p><span className="font-medium">Power:</span> {selectedModel?.Leistung} PS</p>
          <p><span className="font-medium">Doors:</span> {selectedModel?.Türen}</p>
          <p><span className="font-medium">Seats:</span> {selectedModel?.Sitze}</p>
          <p><span className="font-medium">Trunk:</span> {selectedModel?.Kofferraumvolumen} l</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <p><span className="font-medium">License Plate:</span> {vehicle.Kennzeichen}</p>
          <p><span className="font-medium">Condition:</span> {vehicle.Reperaturzustand}</p>
          <p><span className="font-medium">Active:</span> {vehicle.Aktiv ? 'Yes' : 'No'}</p>
          <p><span className="font-medium">Tires:</span> {vehicle.Reifen}</p>
          <p><span className="font-medium">Mileage:</span> {vehicle.Kilometerstand} km</p>
          <p><span className="font-medium">Last Service:</span> {vehicle.LetzterService}</p>
          <p><span className="font-medium">TÜV:</span> {vehicle.TuevDatum}</p>
          <p><span className="font-medium">First Registration:</span> {vehicle.ErstzulassungsDatum}</p>
        </div>
      </div>

      {selectedModel?.Stundenpreis && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <p className="text-lg font-semibold">
            Price: €{selectedModel.Stundenpreis.toFixed(2)} / hour
          </p>
        </div>
      )}
      
      {user && user.RolleID === 1 && vehicle.Aktiv && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4">Reserve This Vehicle</h3>
          <button 
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-200" 
            onClick={handleReserve}
            disabled={!vehicle.Aktiv}
          >
            Reserve Now
          </button>
          {reserveMsg && (
            <p className={`mt-4 text-sm ${reserveMsg.startsWith('Reservation successful') ? 'text-green-600' : 'text-red-600'}`}>
              {reserveMsg}
            </p>
          )}
        </div>
      )}
      
      {!vehicle.Aktiv && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 font-semibold">
            This vehicle is currently not active and cannot be reserved.
          </p>
        </div>
      )}
    </div>
  );
}
