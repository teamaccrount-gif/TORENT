import React from 'react'
import Map from '../components/Map/Map'
import { useMapData } from '../hooks/UseMapData'

const MapPage: React.FC = () => {
  const mapState = useMapData();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900">Map View</h1>
          <p className="mt-2 text-sm text-gray-500">
            Explore station locations, boundaries, and city regions on the map.
          </p>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6">
        <div className="mt-6 border rounded-xl overflow-hidden shadow-inner">
          <Map 
            stations={mapState.stations}
            regions={mapState.regions}
            cities={mapState.cities}
            updateStation={mapState.updateStation}
            updateRegion={mapState.updateRegion}
            updateArea={mapState.updateArea}
          />
        </div>
      </div>
    </div>
  )
}

export default MapPage

