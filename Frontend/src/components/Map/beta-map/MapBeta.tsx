import React, { useEffect, useRef } from 'react';
import './mapdata.js';
import './countrymap.js';

interface MapBetaProps {
    stations?: any[];
    regions?: any[];
    cities?: any[];
    updateStation?: (data: any) => void;
    updateRegion?: (data: any) => void;
    updateArea?: (data: any) => void;
}

const MapBeta: React.FC<MapBetaProps> = (props) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Access the global simplemaps object created by the scripts
        const mapObj = (window as any).simplemaps_countrymap;
        
        // Once the component is mounted, load the map manually into the #map div
        if (mapObj && mapRef.current) {
            mapObj.load();
        }
    }, []);

    return (
        <div className="h-full w-full rounded-xl overflow-hidden bg-[#f8fafc] border border-gray-200">
            {/* The ID 'map' is required by simplemaps mapdata.js default settings */}
            <div id="map" ref={mapRef} className="h-full w-full"></div>
        </div>
    );
};

export default MapBeta;
