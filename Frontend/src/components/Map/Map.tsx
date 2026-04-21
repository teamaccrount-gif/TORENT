import React from 'react'
import MapView from './MapView'

interface MapProps {
    stations: any[];
    regions: any[];
    cities: any[];
    updateStation: (data: any) => void;
    updateRegion: (data: any) => void;
    updateArea: (data: any) => void;
}

const Map: React.FC<MapProps> = (props) => {
    return (
        <div className="h-[600px] w-full relative">
            <MapView {...props} />
        </div>
    )
}

export default Map