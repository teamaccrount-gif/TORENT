import React from 'react';

interface MapFiltersProps {
    regions: any[];
    cities: any[];
    stations: any[];
    selectedRegion: string;
    setSelectedRegion: (val: string) => void;
    selectedCity: string;
    setSelectedCity: (val: string) => void;
    selectedStation: string;
    setSelectedStation: (val: string) => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({
    regions,
    cities,
    stations,
    selectedRegion,
    setSelectedRegion,
    selectedCity,
    setSelectedCity,
    selectedStation,
    setSelectedStation,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Region Dropdown */}
            <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Region</label>
                <select
                    value={selectedRegion}
                    onChange={(e) => {
                        setSelectedRegion(e.target.value);
                        setSelectedCity('');
                        setSelectedStation('');
                    }}
                    className="block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                >
                    <option value="">All Regions</option>
                    {regions.map((r) => (
                        <option key={r.id || r.name} value={r.name}>
                            {r.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* City/Area Dropdown */}
            <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">City / Area</label>
                <select
                    value={selectedCity}
                    onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setSelectedStation('');
                    }}
                    className="block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                >
                    <option value="">All Cities</option>
                    {cities.map((c) => (
                        <option key={c.id || c.name} value={c.name}>
                            {c.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Station Dropdown */}
            <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-gray-700">Station</label>
                <select
                    value={selectedStation}
                    onChange={(e) => setSelectedStation(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                >
                    <option value="">All Stations</option>
                    {stations.map((s) => (
                        <option key={s.id || s.name} value={s.name}>
                            {s.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default MapFilters;
