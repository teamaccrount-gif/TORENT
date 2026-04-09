import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import {
  fetchAreas,
  fetchRegions,
  fetchRegistrationStations,
  fetchRoles,
  addUser,
} from '../../Redux/Slices/registrationSlice';
import { EmailField } from './fields/EmailField';
import { PasswordField } from './fields/PasswordField';
import { PhoneField } from './fields/PhoneField';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import type {
  ApiResponse,
  AreaOption,
  RegionOption,
  RegistrationPayload,
  RegistrationStationOption,
  Role,
  RoleOption,
} from '../../types';
import {
  ROLE_LEVEL_MAP,
  getRoleOptionsForTarget,
  normalizeAreas,
  normalizeRegions,
  normalizeStations,
  normalizeRoles,
} from '../../utils/registrationHelpers';

interface RegistrationFormProps {
  targetRole: Exclude<Role, 'SUPER_ADMIN'>;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ targetRole }) => {
  const dispatch = useAppDispatch();

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [selectedAreaIds, setSelectedAreaIds] = useState<string[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const rolesResponse = useAppSelector((state) => state.registrationSlice.data.fetchRoles) as ApiResponse<RoleOption[]> | RoleOption[] | null;
  const regionsResponse = useAppSelector((state) => state.registrationSlice.data.fetchRegions) as ApiResponse<RegionOption[]> | RegionOption[] | null;
  const areasResponse = useAppSelector((state) => state.registrationSlice.data.fetchAreas) as ApiResponse<AreaOption[]> | AreaOption[] | null;
  const stationsResponse = useAppSelector((state) => state.registrationSlice.data.fetchRegistrationStations) as ApiResponse<RegistrationStationOption[]> | RegistrationStationOption[] | null;

  const rolesLoading = useAppSelector((state) => state.registrationSlice.loading.fetchRoles);
  const regionsLoading = useAppSelector((state) => state.registrationSlice.loading.fetchRegions);
  const areasLoading = useAppSelector((state) => state.registrationSlice.loading.fetchAreas);
  const stationsLoading = useAppSelector((state) => state.registrationSlice.loading.fetchRegistrationStations);

  const roles = useMemo(() => normalizeRoles(rolesResponse), [rolesResponse]);
  const regions = useMemo(() => normalizeRegions(regionsResponse), [regionsResponse]);
  const areas = useMemo(() => normalizeAreas(areasResponse), [areasResponse]);
  const stations = useMemo(() => normalizeStations(stationsResponse), [stationsResponse]);

  const allowedRoleOptions = useMemo(
    () => getRoleOptionsForTarget(roles, targetRole),
    [roles, targetRole]
  );

  const selectedRole = useMemo(
    () => allowedRoleOptions.find((role) => role.role_id === selectedRoleId) || allowedRoleOptions[0] || null,
    [allowedRoleOptions, selectedRoleId]
  );

  const selectedRegion = useMemo(
    () => regions.find((region) => region.region_id === selectedRegionId) || null,
    [regions, selectedRegionId]
  );

  const visibleAreas = useMemo(
    () => (selectedRegion ? areas.filter((area) => area.region_name.toLowerCase() === selectedRegion.region_name.toLowerCase()) : []),
    [areas, selectedRegion]
  );

  const selectedAreaRecords = useMemo(
    () => visibleAreas.filter((area) => selectedAreaIds.includes(area.area_id)),
    [selectedAreaIds, visibleAreas]
  );

  const selectedAreaNames = selectedAreaRecords.map((area) => area.area_name);
  const selectedStation = stations.find((station) => station.station_id === selectedStationId) || null;

  const visibleStations = useMemo(() => {
    if (targetRole !== 'STATION_MANAGER' || selectedAreaNames.length === 0) {
      return [];
    }

    const cityName = selectedAreaNames[0];
    return stations.filter((station) => station.area_name.toLowerCase() === cityName.toLowerCase());
  }, [stations, selectedAreaNames, targetRole]);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  };

  useEffect(() => {
    if (!rolesResponse && rolesLoading !== 'pending' && rolesLoading !== 'fulfilled') {
      const response = dispatch(fetchRoles({ method: 'GET', headers }));
      console.log("roles", response);
    }
    if (!regionsResponse && regionsLoading !== 'pending' && regionsLoading !== 'fulfilled') {
      dispatch(fetchRegions({ method: 'GET' }));
    }
    if (!areasResponse && areasLoading !== 'pending' && areasLoading !== 'fulfilled') {
      dispatch(fetchAreas({ method: 'GET' }));
    }
    if (!stationsResponse && stationsLoading !== 'pending' && stationsLoading !== 'fulfilled') {
      dispatch(fetchRegistrationStations({ method: 'GET' }));
    }
  }, [dispatch]);

  useEffect(() => {
    if (allowedRoleOptions.length === 0) {
      setSelectedRoleId('');
      return;
    }

    const roleExists = allowedRoleOptions.some((role) => role.role_id === selectedRoleId);
    if (!roleExists) {
      setSelectedRoleId(allowedRoleOptions[0].role_id);
    }
  }, [allowedRoleOptions, selectedRoleId]);

  useEffect(() => {
    setSelectedRegionId('');
    setSelectedAreaIds([]);
    setSelectedStationId('');
  }, [targetRole]);

  const handleRegionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionId(event.target.value);
    setSelectedAreaIds([]);
    setSelectedStationId('');
  };

  const handleAreaChange = (value: string[] | string) => {
    const nextValue = Array.isArray(value) ? value : [value];
    setSelectedAreaIds(nextValue);
    if (targetRole === 'STATION_MANAGER') {
      setSelectedStationId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!selectedRole) {
      setErrorMsg('Please wait for the role options to load.');
      return;
    }

    if (!selectedRegion) {
      setErrorMsg('Please select a region.');
      return;
    }

    if (selectedAreaIds.length === 0) {
      setErrorMsg(targetRole === 'REGION_MANAGER' ? 'Please select at least one city.' : 'Please select a city.');
      return;
    }

    if (targetRole === 'STATION_MANAGER' && !selectedStation) {
      setErrorMsg('Please select a station.');
      return;
    }

    const selectedAccessLevel = ROLE_LEVEL_MAP[targetRole];
    const selectedAreasForPayload = selectedAreaRecords.map((area) => area.area_name);
    const payload: RegistrationPayload = {
      first_name,
      last_name,
      email,
      password,
      phone,
      role_id: Number(selectedRole.role_id),
      level: selectedAccessLevel,
      regions: targetRole === 'REGION_MANAGER' ? [selectedRegion.region_name] : [],
      areas: targetRole === 'REGION_MANAGER' || targetRole === 'CITY_MANAGER' ? (targetRole === 'REGION_MANAGER' ? selectedAreasForPayload : [selectedAreasForPayload[0]].filter(Boolean)) : [],
      stations: targetRole === 'STATION_MANAGER' && selectedStation ? [selectedStation.station_name] : [],
    };

    console.log(localStorage.getItem('accessToken'));

    setIsSubmitting(true);

    try {
      console.log('[REGISTER] Payload:', payload);

      const resultAction = await dispatch(
        addUser({
          method: 'POST',
          payload: payload as unknown as Record<string, unknown>,
          headers
        })
      );

      if (addUser.fulfilled.match(resultAction)) {
        const responseData = resultAction.payload as { success?: boolean; message?: string };
        console.log('[REGISTER] Backend response:', responseData);

        if (responseData?.success !== false) {
          setSuccessMsg(`Successfully registered ${targetRole.replace('_', ' ')}.`);
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setPhone('');
          setSelectedRegionId('');
          setSelectedAreaIds([]);
          setSelectedStationId('');
          return;
        }

        setErrorMsg(responseData.message || 'Registration failed.');
        return;
      }

      setErrorMsg((resultAction.payload as string) || 'Server error occurred.');
    } catch (err) {
      console.error('[REGISTER] Submission error:', err);
      setErrorMsg('An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  const roleOptions = allowedRoleOptions.map((role) => ({
    value: role.role_id,
    label: role.role_name,
  }));

  const regionOptions = regions.map((region) => ({
    value: region.region_id,
    label: region.region_name,
  }));

  const areaOptions = visibleAreas.map((area) => ({
    value: area.area_id,
    label: area.area_name,
  }));

  const stationOptions = visibleStations.map((station) => ({
    value: station.station_id,
    label: station.station_name,
  }));

  const roleDropdownValue = selectedRole?.role_id || '';

  return (
    <form className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200" onSubmit={handleSubmit}>
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Register New {targetRole.replace('_', ' ')}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Enter the details to create a new access account.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <FormField label="First Name" htmlFor="first_name">
            <Input
              id="first_name"
              value={first_name}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="First name"
            />
          </FormField>
        </div>

        <div>
          <FormField label="Last Name" htmlFor="last_name">
            <Input
              id="last_name"
              value={last_name}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={isSubmitting}
              placeholder="Last name"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <EmailField
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="sm:col-span-2">
          <PasswordField
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="sm:col-span-2">
          <PhoneField
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isSubmitting}
            placeholder="+91..."
          />
        </div>

        <div className="sm:col-span-2">
          <FormField label="Role" htmlFor="role">
            <Dropdown
              id="role"
              value={roleDropdownValue}
              onChange={(e) => setSelectedRoleId(e.target.value)}
              options={roleOptions}
              isLoading={rolesLoading === 'pending'}
              disabled={isSubmitting || roleOptions.length === 0}
              placeholder="Select role"
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField label="Region" htmlFor="region">
            <Dropdown
              id="region"
              value={selectedRegionId}
              onChange={handleRegionChange}
              options={regionOptions}
              isLoading={regionsLoading === 'pending'}
              disabled={isSubmitting}
              placeholder="Select region"
            />
          </FormField>
        </div>

        {selectedRegion && targetRole !== 'REGION_MANAGER' && (
          <div className="sm:col-span-2">
            <FormField label="City" htmlFor="area">
              <Dropdown
                id="area"
                value={selectedAreaIds[0] || ''}
                onChange={(e) => handleAreaChange(e.target.value)}
                options={areaOptions}
                isLoading={areasLoading === 'pending'}
                disabled={isSubmitting || areaOptions.length === 0}
                placeholder={areasLoading === 'pending' ? 'Loading cities...' : 'Select city'}
              />
            </FormField>
          </div>
        )}

        {selectedRegion && targetRole === 'REGION_MANAGER' && (
          <div className="sm:col-span-2">
            <FormField label="Cities" htmlFor="areas">
              <MultiSelectDropdown
                options={areaOptions}
                value={selectedAreaIds}
                onChange={handleAreaChange}
                isLoading={areasLoading === 'pending'}
                disabled={isSubmitting || areaOptions.length === 0}
                placeholder={areasLoading === 'pending' ? 'Loading cities...' : 'Select cities'}
              />
            </FormField>
          </div>
        )}

        {selectedRegion && targetRole === 'STATION_MANAGER' && selectedAreaIds.length > 0 && (
          <div className="sm:col-span-2">
            <FormField label="Station" htmlFor="station">
              <Dropdown
                id="station"
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                options={stationOptions}
                isLoading={stationsLoading === 'pending'}
                disabled={isSubmitting || stationOptions.length === 0}
                placeholder={stationsLoading === 'pending' ? 'Loading stations...' : 'Select station'}
              />
            </FormField>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="text-sm text-green-700 bg-green-50 p-3 rounded-md border border-green-100">
          {successMsg}
        </div>
      )}

      <div className="pt-4 flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={isSubmitting}
          className="min-w-[150px]"
          disabled={isSubmitting}
        >
          Create User
        </Button>
      </div>
    </form>
  );
};
