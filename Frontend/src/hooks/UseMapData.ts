import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { getMap, updateStation, updateRegion, updateArea } from '../Redux/Slices/mapSlice';

export const useMapData = () => {
    const dispatch = useAppDispatch();

    const mapData = useAppSelector((state) => state.mapSlice.data.getMap);
    const loading = useAppSelector((state) => state.mapSlice.loading.getMap);
    const error = useAppSelector((state) => state.mapSlice.error.getMap);

    useEffect(() => {
        dispatch(getMap());
    }, [dispatch]);

    const regions = mapData?.data?.regions?.features || [];
    const cities = mapData?.data?.areas?.features || [];
    const stations = mapData?.data?.stations?.features || [];

    return {
        regions,
        cities,
        stations,
        loading,
        error,
        updateStation: (data: { name: string; latitude: number; longitude: number }) => 
            dispatch(updateStation({ method: 'PUT', payload: data })),
        updateRegion: (data: { name: string; latitude: number; longitude: number }) => 
            dispatch(updateRegion({ method: 'PUT', payload: data })),
        updateArea: (data: { name: string; latitude: number; longitude: number }) => 
            dispatch(updateArea({ method: 'PUT', payload: data }))
    };
};