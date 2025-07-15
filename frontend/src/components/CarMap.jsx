import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import ChangeView from './ChangeView';

/**
 * CarMap Komponente - Zeigt eine interaktive Karte mit verfügbaren Fahrzeugen
 * @param {Object} props - Komponenten-Properties
 * @param {Array} props.vehicles - Liste der anzuzeigenden Fahrzeuge
 * @param {Object} props.pickupLocation - Abholort-Koordinaten
 * @param {string} props.locationRadius - Radius für die Suche
 * @param {string} props.abholort_stadt - Stadt des Abholortes
 * @param {string} props.abholort_plz - PLZ des Abholortes
 * @param {boolean} props.realtime - Echtzeit-Modus aktiv
 * @param {string} props.start_datum - Startdatum der Buchung
 * @param {string} props.end_datum - Enddatum der Buchung
 * @param {string} props.rueckgabeort_plz - PLZ des Rückgabeortes
 * @param {string} props.rueckgabeort_stadt - Stadt des Rückgabeortes
 */
export default function CarMap(props) {
    const { t } = useTranslation();
    
    // Standard-Zentrum: Bremen Koordinaten
    const defaultCenter = [53.0793, 8.8017];
    const mapCenter = props.pickupLocation 
        ? [props.pickupLocation.lat, props.pickupLocation.lon] 
        : defaultCenter;

    // Bestimme ob auf Welt-Ansicht gezoomt werden soll
    const shouldZoomToWorld = props.vehicles.length > 0 && 
        (!props.locationRadius || parseFloat(props.locationRadius) <= 0) && 
        !props.pickupLocation;

    return (
        <MapContainer 
            center={mapCenter} 
            zoom={10} 
            scrollWheelZoom={true} 
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Komponente für Karten-Ansicht-Änderungen */}
            <ChangeView 
                markers={props.vehicles} 
                zoomToWorld={shouldZoomToWorld} 
            />

            {/* Abholort-Marker */}
            {props.pickupLocation && (
                <Marker	
                    position={[props.pickupLocation.lat, props.pickupLocation.lon]}
                    icon={L.icon({
                        iconUrl: '/icons/pickup-marker.svg',
                        iconSize: [64, 64],
                        iconAnchor: [32, 48]
                    })}
                >
                    <Popup>
                        {t('vehicles.pickupLocation')}: {props.abholort_stadt}, {props.abholort_plz}
                    </Popup>
                </Marker>
            )}

            {/* Radius-Kreis um Abholort */}
            {props.pickupLocation && props.locationRadius && parseFloat(props.locationRadius) > 0 && (
                <Circle
                    center={[props.pickupLocation.lat, props.pickupLocation.lon]}
                    radius={parseFloat(props.locationRadius) * 1000}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                />
            )}

            {/* Fahrzeug-Marker */}
            {props.vehicles.map(car => {
                const popupLocationText = `${car.latitude.toFixed(4)} ${car.longitude.toFixed(4)}`;

                return (
                    <Marker 
                        key={car.FahrzeugID} 
                        position={[car.latitude, car.longitude]} 
                        icon={L.icon({
                            iconUrl: '/icons/car-marker.svg',
                            iconSize: [48, 48],
                            iconAnchor: [24, 36]
                        })}
                    >
                        <Popup>
                            <b>{car.Hersteller} {car.ModellName}</b> <br />
                            ({car.Kennzeichen}) <br />
                            {t('vehicles.location')}: {popupLocationText} <br />
                            <Link
                                to={`/booking/${car.FahrzeugID}`}
                                state={{
                                    start_datum: props.realtime ? 'Jetzt' : props.start_datum,
                                    end_datum: props.end_datum,
                                    abholort_plz: props.realtime ? '' : props.abholort_plz,
                                    abholort_stadt: props.realtime ? '' : props.abholort_stadt,
                                    rueckgabeort_plz: props.rueckgabeort_plz,
                                    rueckgabeort_stadt: props.rueckgabeort_stadt,
                                    fahrzeugId: car.FahrzeugID
                                }}
                            >
                                {t('vehicles.detailsAndBook')}
                            </Link>
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
}