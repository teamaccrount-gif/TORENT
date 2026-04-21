import { Marker, Popup, GeoJSON } from 'react-leaflet';

interface MapLayersProps {
    stations: any[];
    regions: any[];
    cities: any[];
    updateStation: (data: { name: string; latitude: number; longitude: number }) => void;
}

const MapLayers: React.FC<MapLayersProps> = ({ stations, regions, cities, updateStation }) => {
    return (
        <>
            {/* Regions */}
            {regions && regions.map((f: any, idx: number) => (
                <GeoJSON
                    key={`region-${f.properties.name}-${idx}`}
                    data={f}
                    style={{ color: 'blue', weight: 2, fillOpacity: 0.1 }}
                />
            ))}

            {/* Cities / Areas */}
            {cities && cities.map((f: any, idx: number) => (
                <GeoJSON
                    key={`city-${f.properties.name}-${idx}`}
                    data={f}
                    style={{ color: 'green', weight: 1, fillOpacity: 0.05 }}
                />
            ))}

            {/* Stations */}
            {stations && stations.map((f: any, idx: number) => (
                <Marker
                    key={`station-${f.properties.name}-${idx}`}
                    position={[f.geometry.coordinates[1], f.geometry.coordinates[0]]}
                    draggable={true}
                    eventHandlers={{
                        dragend: (e) => {
                            const marker = e.target;
                            const position = marker.getLatLng();
                            updateStation({
                                name: f.properties.name,
                                latitude: position.lat,
                                longitude: position.lng,
                            });
                        },
                    }}
                >
                    <Popup>
                        <div className="font-medium">{f.properties.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                            Area: {f.properties.area}<br/>
                            Region: {f.properties.region}
                        </div>
                        <div className="text-xs text-indigo-600 mt-2 font-medium italic">Drag to update location</div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

export default MapLayers;