import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import { fetchCities } from '../../Redux/Slices/registrationSlice';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';
import { FormField } from '../ui/FormField';
import type { City, ApiResponse } from '../../types';

interface CitySelectorProps {
  value: string[];
  onChange: (val: string[]) => void;
  errorMsg?: string;
}

export const CitySelector: React.FC<CitySelectorProps> = ({ value, onChange, errorMsg }) => {
  const dispatch = useAppDispatch();
  const citiesResponse = useAppSelector((state) => state.registrationSlice.data.fetchCities) as ApiResponse<City[]> | null;
  const loadingState = useAppSelector((state) => state.registrationSlice.loading.fetchCities);
  
  useEffect(() => {
    if (!citiesResponse && loadingState !== 'pending') {
      dispatch(fetchCities({ method: 'GET' }));
    }
  }, [dispatch, citiesResponse, loadingState]);

  const isLoading = loadingState === 'pending';
  const cities: City[] = citiesResponse?.data || [];
  
  const options = cities.map((c) => ({
    value: c.city_id,
    label: c.city_name,
  }));

  return (
    <FormField label="Assign Cities" error={errorMsg}>
      <MultiSelectDropdown
        options={options}
        value={value}
        onChange={onChange}
        isLoading={isLoading}
        placeholder="Select assigned cities"
        error={!!errorMsg}
      />
    </FormField>
  );
};
