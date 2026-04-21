import React, { useEffect, useRef } from 'react';
import './mapdata.js';
import './countrymap.js';

interface MapProps {
    stations: any[];
    regions: any[];
    cities: any[];
    updateStation?: (data: any) => void;
    updateRegion?: (data: any) => void;
    updateArea?: (data: any) => void;
}

const Map: React.FC<MapProps> = ({ stations, regions, cities }) => {
    const mapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mapData = (window as any).simplemaps_countrymap_mapdata;
        const mapObj = (window as any).simplemaps_countrymap;

        if (mapData && mapObj) {
            // Map stations to locations
            if (stations && stations.length > 0) {
                const locations: any = {};
                stations.forEach((station, index) => {
                    // Extract coordinates from GeoJSON format
                    const lng = station.geometry?.coordinates?.[0];
                    const lat = station.geometry?.coordinates?.[1];
                    const name = station.properties?.name || `Station ${index}`;
                    
                    if (lat !== undefined && lng !== undefined) {
                        locations[index] = {
                            name: name,
                            lat: lat,
                            lng: lng,
                            description: `Area: ${station.properties?.area || 'N/A'}<br/>Region: ${station.properties?.region || 'N/A'}`
                        };
                    }
                });
                mapData.locations = locations;
            }

            // Map regions to state_specific colors if needed
            // This depends on how the region names match the SimpleMaps codes (INAP, INAR, etc.)
            // For now, we keep the default state_specific from mapdata.js

            // Initialize or reload the map
            if (mapRef.current) {
                mapObj.load();
            }
        }
    }, [stations, regions, cities]);

    return (
        <div className="h-full w-full min-h-[600px] rounded-xl overflow-hidden bg-white border border-gray-200 p-4">
            <div id="map" ref={mapRef} className="h-full w-full"></div>
            <div className="mt-4 text-xs text-gray-400 text-center italic">
                Interactive Map of India - SimpleMaps API
            </div>
        </div>
    );
};

export default Map;
