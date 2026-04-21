export const stationsToGeoJSON = (stations: any[]) => ({
    type: 'FeatureCollection',
    features: stations.map((s) => ({
        type: 'Feature',
        properties: {
            name: s.name,
            id: s.id,
        },
        geometry: {
            type: 'Point',
            coordinates: [s.longitude, s.latitude],
        },
    })),
});