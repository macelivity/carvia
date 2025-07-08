


export default function CarMap(props) {
    return (
        <MapContainer center={props.pickupLocation ? [props.pickupLocation.lat, props.pickupLocation.lon] : [53.0793, 8.8017]} zoom={10} scrollWheelZoom={true} style={{ height: "100%", width: "100%" }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView markers={props.vehicles} zoomToWorld={props.vehicles.length > 0 && (!props.locationRadius || parseFloat(props.locationRadius) <= 0) && !props.pickupLocation} />

            {
                props.pickupLocation &&
                <Marker	
                    position={[props.pickupLocation.lat, props.pickupLocation.lon]}
                    icon={L.icon({
                        iconUrl: '/icons/pickup-marker.svg',
                        iconSize: [64, 64],
                        iconAnchor: [32, 48]
                    })}
                >
                    <Popup>{t('vehicles.pickupLocation')}: {props.abholort_stadt}, {props.abholort_plz}</Popup>
                </Marker>
            }

            {
                props.pickupLocation && props.locationRadius && parseFloat(props.locationRadius) > 0 &&
                <Circle
                    center={[props.pickupLocation.lat, props.pickupLocation.lon]}
                    radius={parseFloat(props.locationRadius) * 1000}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                />
            }

            {props.vehicles.map(car => {
                let popupLocationText = `${car.latitude.toFixed(4)} ${car.longitude.toFixed(4)}`;

                return (
                    <Marker key={car.FahrzeugID} position={[car.latitude, car.longitude]} icon={L.icon({
                        iconUrl: '/icons/car-marker.svg',
                        iconSize: [48, 48],
                        iconAnchor: [24, 36]
                    })}>
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