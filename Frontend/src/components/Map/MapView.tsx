import { MapContainer, TileLayer } from 'react-leaflet';
import MapLayers from './MapLayers';

interface MapViewProps {
    stations: any[];
    regions: any[];
    cities: any[];
    updateStation: (data: { name: string; latitude: number; longitude: number }) => void;
}

const MapView: React.FC<MapViewProps> = (props) => {
    // Approximate bounding box for India
    const indiaBounds: [[number, number], [number, number]] = [
        [6.4627, 68.1097], // Southwest coordinates
        [35.5133, 97.3953]  // Northeast coordinates
    ];

    return (
        <div className="h-full w-full rounded-xl overflow-hidden">
            <MapContainer
                center={[20.5937, 78.9629]} // Center of India
                zoom={5} // Zoom level to see the whole country
                minZoom={5} // Prevent zooming out too far
                maxBounds={indiaBounds} // Restrict panning to India
                maxBoundsViscosity={1.0} // Makes the bounds rigid
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; OpenStreetMap'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapLayers {...props} />
            </MapContainer>
        </div>
    );
};

export default MapView;