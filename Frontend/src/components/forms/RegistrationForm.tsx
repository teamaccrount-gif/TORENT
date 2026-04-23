import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../Redux/Store';
import {
  fetchRegions,
  fetchRoles,
  fetchAreasByRegion,
  fetchStationsByArea,
  addUser,
} from '../../Redux/Slices/registrationSlice';
import { EmailField } from './fields/EmailField';
import { PasswordField } from './fields/PasswordField';
import { PhoneField } from './fields/PhoneField';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/Dropdown';
import { MultiSelectDropdown } from '../ui/MultiSelectDropdown';
import { FormField } from '../ui/formfield';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import type { RegistrationPayload, Role, RegistrationAccessLevel } from '../../types';
import {
  normalizeAreas,
  normalizeRegions,
  normalizeStations,
  normalizeRoles,
} from '../../utils/registrationHelpers';

const ROLE_LEVEL_MAP = {
  'engineer': 'station',
  'operator': 'station',
};

interface RegistrationFormProps {
  targetRole: Exclude<Role, 'super_admin'>;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ targetRole }) => {
  const dispatch = useAppDispatch();

  // Form fields
  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Dropdown selections — store NAMES
  const [selectedRegionName, setSelectedRegionName] = useState('');
  const [selectedAreaNames, setSelectedAreaNames] = useState<string[]>([]);
  const [selectedStationName, setSelectedStationName] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redux selectors
  const regionsResponse = useAppSelector((s) => s.registrationSlice.data.fetchRegions);
  const rolesResponse = useAppSelector((s) => s.registrationSlice.data.fetchRoles);
  const areasResponse = useAppSelector((s) => s.registrationSlice.data.fetchAreasByRegion);
  const stationsResponse = useAppSelector((s) => s.registrationSlice.data.fetchStationsByArea);

  const regionsLoading = useAppSelector((s) => s.registrationSlice.loading.fetchRegions);
  const rolesLoading = useAppSelector((s) => s.registrationSlice.loading.fetchRoles);
  const areasLoading = useAppSelector((s) => s.registrationSlice.loading.fetchAreasByRegion);
  const stationsLoading = useAppSelector((s) => s.registrationSlice.loading.fetchStationsByArea);

  const regions = useMemo(() => normalizeRegions(regionsResponse), [regionsResponse]);
  const roles = useMemo(() => normalizeRoles(rolesResponse), [rolesResponse]);
  const areas = useMemo(() => normalizeAreas(areasResponse), [areasResponse]);
  const stations = useMemo(() => normalizeStations(stationsResponse), [stationsResponse]);

  // Fetch roles and regions on mount
  useEffect(() => {
    dispatch(fetchRoles({ method: 'GET' }));
    dispatch(fetchRegions({ method: 'GET' }));
  }, [dispatch]);

  // Cascading fetch: areas whenever region name changes
  useEffect(() => {
    if (!selectedRegionName) return;
    dispatch(fetchAreasByRegion({ method: 'GET', urlParam: selectedRegionName }));
  }, [dispatch, selectedRegionName]);

  // Cascading fetch: stations whenever area name changes
  useEffect(() => {
    if (!['operator', 'engineer', 'manager'].includes(targetRole) || selectedAreaNames.length !== 1) return;
    dispatch(fetchStationsByArea({ method: 'GET', urlParam: selectedAreaNames[0] }));
  }, [dispatch, selectedAreaNames, targetRole]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegionName(e.target.value);
    setSelectedAreaNames([]);
    setSelectedStationName('');
  };

  const handleAreaChange = (value: string[] | string) => {
    const next = Array.isArray(value) ? value : [value];
    setSelectedAreaNames(next);
    setSelectedStationName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const matchedRole = roles.find((r) =>
      r.role_name.toLowerCase().includes(targetRole.replace('_', ' ').toLowerCase())
    );

    if (!matchedRole) {
      setErrorMsg(`Could not resolve role for "${targetRole}". Please wait for roles to load.`);
      return;
    }
    if (!selectedRegionName) {
      setErrorMsg('Please select a region.');
      return;
    }
    if (selectedAreaNames.length === 0) {
      setErrorMsg(['manager', 'admin'].includes(targetRole) ? 'Please select at least one city.' : 'Please select a city.');
      return;
    }
    if (['operator', 'engineer'].includes(targetRole) && !selectedStationName) {
      setErrorMsg('Please select a station.');
      return;
    }

    let calculatedLevel: RegistrationAccessLevel = ROLE_LEVEL_MAP[targetRole as keyof typeof ROLE_LEVEL_MAP] || 'station';
    
    if (targetRole === 'admin') {
      calculatedLevel = selectedAreaNames.length > 1 ? 'region' : 'city';
    } else if (targetRole === 'manager') {
      if (selectedStationName) {
        calculatedLevel = 'station';
      } else {
        calculatedLevel = selectedAreaNames.length > 1 ? 'region' : 'city';
      }
    }

    const payload: RegistrationPayload = {
      first_name,
      last_name,
      email,
      password,
      phone,
      role_id: Number(matchedRole.role_id),
      level: calculatedLevel,
      regions: ['manager', 'admin'].includes(targetRole) ? [selectedRegionName] : [],
      areas:
        ['manager', 'admin'].includes(targetRole)
          ? selectedAreaNames
          : ['engineer', 'operator'].includes(targetRole)
          ? [selectedAreaNames[0]].filter(Boolean)
          : [],
      stations: (['operator', 'engineer', 'manager'].includes(targetRole) && selectedStationName) ? [selectedStationName] : [],
    };

    setIsSubmitting(true);
    try {
      const resultAction = await dispatch(
        addUser({ method: 'POST', payload: payload as unknown as Record<string, unknown> })
      );

      if (addUser.fulfilled.match(resultAction)) {
        const res = resultAction.payload as { success?: boolean; message?: string };
        if (res?.success !== false) {
          setSuccessMsg(`Successfully registered ${targetRole.replace('_', ' ')}.`);
          setFirstName('');
          setLastName('');
          setEmail('');
          setPassword('');
          setPhone('');
          setSelectedRegionName('');
          setSelectedAreaNames([]);
          setSelectedStationName('');
          return;
        }
        setErrorMsg(res.message || 'Registration failed.');
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

  const regionOptions = regions.map((r) => ({ value: r.region_name, label: r.region_name }));
  const areaOptions = areas.map((a) => ({ value: a.area_name, label: a.area_name }));
  const stationOptions = stations.map((s) => ({ value: s.station_name, label: s.station_name }));

  return (
    <Card className="border-gray-200 shadow-md overflow-hidden animate-in zoom-in-95 duration-500">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 capitalize">
              Register New {targetRole.replace('_', ' ')}
            </CardTitle>
            <CardDescription className="text-sm text-gray-500">
              Provision administrative access and define operational boundaries.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-2">
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

            <div className="sm:col-span-2">
              <EmailField value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isSubmitting} />
            </div>

            <div className="sm:col-span-2">
              <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isSubmitting} />
            </div>

            <div className="sm:col-span-2">
              <PhoneField value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={isSubmitting} placeholder="+91..." />
            </div>

            {/* Region */}
            <div className="sm:col-span-2 space-y-4 border-t border-gray-100 pt-6 mt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Territory Access</h4>
              <FormField label="Region" htmlFor="region">
                <Dropdown
                  id="region"
                  value={selectedRegionName}
                  onChange={handleRegionChange}
                  options={regionOptions}
                  isLoading={regionsLoading === 'pending'}
                  disabled={isSubmitting}
                  placeholder="Select region"
                />
              </FormField>
            </div>

            {/* City — single select */}
            {selectedRegionName && !['manager', 'admin'].includes(targetRole) && (
              <div className="sm:col-span-2">
                <FormField label="City" htmlFor="area">
                  <Dropdown
                    id="area"
                    value={selectedAreaNames[0] || ''}
                    onChange={(e) => handleAreaChange(e.target.value)}
                    options={areaOptions}
                    isLoading={areasLoading === 'pending'}
                    disabled={isSubmitting || areaOptions.length === 0}
                    placeholder={areasLoading === 'pending' ? 'Loading cities...' : 'Select city'}
                  />
                </FormField>
              </div>
            )}

            {/* Cities — multi select */}
            {selectedRegionName && ['manager', 'admin'].includes(targetRole) && (
              <div className="sm:col-span-2">
                <FormField label="Cities" htmlFor="areas">
                  <MultiSelectDropdown
                    options={areaOptions}
                    value={selectedAreaNames}
                    onChange={handleAreaChange}
                    isLoading={areasLoading === 'pending'}
                    disabled={isSubmitting || areaOptions.length === 0}
                    placeholder={areasLoading === 'pending' ? 'Loading cities...' : 'Select cities'}
                  />
                </FormField>
              </div>
            )}

            {/* Station */}
            {selectedRegionName && (['operator', 'engineer'].includes(targetRole) || (targetRole === 'manager' && selectedAreaNames.length === 1)) && selectedAreaNames.length > 0 && (
              <div className="sm:col-span-2">
                <FormField label="Station" htmlFor="station">
                  <Dropdown
                    id="station"
                    value={selectedStationName}
                    onChange={(e) => setSelectedStationName(e.target.value)}
                    options={stationOptions}
                    isLoading={stationsLoading === 'pending'}
                    disabled={isSubmitting || stationOptions.length === 0}
                    placeholder={stationsLoading === 'pending' ? 'Loading stations...' : (targetRole === 'manager' ? 'Select station (optional)' : 'Select station')}
                  />
                </FormField>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-gray-100">
            {errorMsg && (
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 animate-in shake duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}
            {successMsg && (
              <Alert className="bg-green-50 border-green-200 text-green-800 animate-in zoom-in duration-300">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription>{successMsg}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-3">
               <Button
                type="submit"
                variant="default"
                disabled={isSubmitting || rolesLoading === 'pending'}
                className="min-w-[160px] h-11 font-bold shadow-lg transition-all active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Create User Account'
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
