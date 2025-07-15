import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * ChangeView Komponente - Steuert die Kartenansicht basierend auf Markern
 * @param {Object} props - Komponenten-Properties
 * @param {Array} props.markers - Liste der Marker auf der Karte
 * @param {boolean} props.zoomToWorld - Soll auf Welt-Ansicht gezoomt werden
 */
export default function ChangeView({ markers, zoomToWorld }) {
    const map = useMap();

    useEffect(() => {
        if (zoomToWorld && markers && markers.length > 0) {
            // Erstelle Grenzen basierend auf allen Markern
            const bounds = markers.map(marker => [marker.latitude, marker.longitude]);
            
            // Passe die Kartenansicht an alle Marker an
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [map, markers, zoomToWorld]);

    return null;
}
