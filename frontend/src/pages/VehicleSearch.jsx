import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function VehicleSearch() {
    const navigate = useNavigate();
    const initialSearchFilters = {
        start_datum: '',
        end_datum: '',
        abholort_plz: '',
        abholort_stadt: '',
        rueckgabeort_plz: '',
        rueckgabeort_stadt: '',
    };
    const [searchFilters, setSearchFilters] = useState(initialSearchFilters);
    const [pageError, setPageError] = useState('');
    const [useCurrentTime, setUseCurrentTime] = useState(false);

    const handleInputChange = (e) => {
        setSearchFilters({
            ...searchFilters,
            [e.target.name]: e.target.value,
        });
        setPageError('');
    };

    const handleUseCurrentTimeChange = (e) => {
        setUseCurrentTime(e.target.checked);
        if (e.target.checked) {
            setSearchFilters(prev => ({ ...prev, start_datum: '' }));
        }
        setPageError('');
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPageError('');

        let finalSearchFilters = { ...searchFilters };
        if (useCurrentTime) {
            const now = new Date();
            now.setSeconds(0, 0); // Optional: Sekunden und Millisekunden entfernen für datetime-local
            finalSearchFilters.start_datum = now.toISOString().slice(0, 16);
        }

        if ((!useCurrentTime && !finalSearchFilters.start_datum) || !finalSearchFilters.end_datum ||
            !finalSearchFilters.abholort_plz || !finalSearchFilters.abholort_stadt ||
            !finalSearchFilters.rueckgabeort_plz || !finalSearchFilters.rueckgabeort_stadt) {
            setPageError('Bitte füllen Sie alle Felder für die zeit- und ortsgebundene Suche aus.');
            return;
        }
        if (new Date(finalSearchFilters.start_datum) >= new Date(finalSearchFilters.end_datum)) {
            setPageError('Das Rückgabedatum muss nach dem Abholdatum liegen.');
            return;
        }
        // Navigiere zur Vehicles-Seite und übergebe die Filter und den Suchtyp
        navigate('/vehicles', {
            state: {
                searchFilter: finalSearchFilters,
                searchNowAvailable: useCurrentTime
            }
        });
    };

    const handleResetSearchForm = () => {
        setSearchFilters(initialSearchFilters);
        setUseCurrentTime(false);
        setPageError('');
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-8 p-6 border rounded-lg shadow-lg bg-white">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Fahrzeug finden</h1>

                <form onSubmit={handleSearchSubmit} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700 mb-3 border-b pb-2">Suche nach Zeitraum und Ort</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="col-span-1 md:col-span-2"> {/* Checkbox unter den Datumsfeldern */}
                            <div className="flex items-center mt-2">
                                <input
                                    type="checkbox"
                                    id="useCurrentTime"
                                    name="useCurrentTime"
                                    checked={useCurrentTime}
                                    onChange={handleUseCurrentTimeChange}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label htmlFor="useCurrentTime" className="ml-2 block text-sm font-medium text-gray-700">
                                    Jetzt starten
                                </label>
                            </div>
                        </div>
                        {!useCurrentTime && (
                            <div>
                                <label htmlFor="start_datum" className="block text-sm font-medium text-gray-700">Abholdatum und -zeit*</label>
                                <input type="datetime-local" name="start_datum" id="start_datum" value={searchFilters.start_datum} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                            </div>
                        )}
                        <div className={useCurrentTime ? "md:col-span-2" : ""}> {/* Nimmt volle Breite ein, wenn Startdatum ausgeblendet ist */}
                            <label htmlFor="end_datum" className="block text-sm font-medium text-gray-700">Rückgabedatum und -zeit*</label>
                            <input type="datetime-local" name="end_datum" id="end_datum" value={searchFilters.end_datum} onChange={handleInputChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="abholort_plz" className="block text-sm font-medium text-gray-700">Abholort PLZ*</label>
                            <input type="text" name="abholort_plz" id="abholort_plz" value={searchFilters.abholort_plz} onChange={handleInputChange} placeholder="z.B. 28195" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="rueckgabeort_plz" className="block text-sm font-medium text-gray-700">Rückgabeort PLZ*</label>
                            <input type="text" name="rueckgabeort_plz" id="rueckgabeort_plz" value={searchFilters.rueckgabeort_plz} onChange={handleInputChange} placeholder="z.B. 28195" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="abholort_stadt" className="block text-sm font-medium text-gray-700">Abholort Stadt*</label>
                            <input type="text" name="abholort_stadt" id="abholort_stadt" value={searchFilters.abholort_stadt} onChange={handleInputChange} placeholder="z.B. Bremen" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                        <div>
                            <label htmlFor="rueckgabeort_stadt" className="block text-sm font-medium text-gray-700">Rückgabeort Stadt*</label>
                            <input type="text" name="rueckgabeort_stadt" id="rueckgabeort_stadt" value={searchFilters.rueckgabeort_stadt} onChange={handleInputChange} placeholder="z.B. Bremen" className="mt-1 w-full p-2 border border-gray-300 rounded-md shadow-sm" />
                        </div>
                    </div>
                    {pageError && <p className="text-red-500 text-sm mt-2">{pageError}</p>}
                    <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 pt-3">
                        <button
                            type="submit"
                            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md shadow"
                        >
                            Fahrzeuge suchen
                        </button>
                        <button
                            type="button"
                            onClick={handleResetSearchForm}
                            className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-md shadow"
                        >
                            Suche zurücksetzen
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}