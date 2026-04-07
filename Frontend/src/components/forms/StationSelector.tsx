import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import { fetchStations } from '../../Redux/Slices/registrationSlice';
import { Dropdown } from '../ui/Dropdown';
import { FormField } from '../ui/FormField';
import type { Station, ApiResponse } from '../../types';

interface StationSelectorProps {
  value: string;
  onChange: (val: string) => void;
  errorMsg?: string;
}

export const StationSelector: React.FC<StationSelectorProps> = ({ value, onChange, errorMsg }) => {
  const dispatch = useAppDispatch();
  const stationsResponse = useAppSelector((state) => state.registrationSlice.data.fetchStations) as ApiResponse<Station[]> | null;
  const loadingState = useAppSelector((state) => state.registrationSlice.loading.fetchStations);
  
  useEffect(() => {
    if (!stationsResponse && loadingState !== 'pending') {
      dispatch(fetchStations({ method: 'GET' }));
    }
  }, [dispatch, stationsResponse, loadingState]);

  const isLoading = loadingState === 'pending';
  const stations: Station[] = stationsResponse?.data || [];
  
  const options = stations.map((s) => ({
    value: s.station_id,
    label: s.station_name,
  }));

  return (
    <FormField label="Assign Station" error={errorMsg}>
      <Dropdown
        value={value}
        onChange={(e) => onChange(e.target.value)}
        options={options}
        isLoading={isLoading}
        placeholder="Select a station"
        error={!!errorMsg}
      />
    </FormField>
  );
};
