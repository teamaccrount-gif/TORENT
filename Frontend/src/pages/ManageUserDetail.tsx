import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { fetchUserDetail, updateUser, toggleUserStatus } from '../Redux/Slices/manageSlice';
import { fetchRoles, fetchRegions, fetchAreas, fetchRegistrationStations } from '../Redux/Slices/registrationSlice';
import { normalizeRoles, normalizeRegions, normalizeAreas, normalizeStations } from '../utils/registrationHelpers';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { Button } from '../components/ui/Button';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import type { ManageableUser, ApiResponse } from '../types';

const ManageUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const response = useAppSelector((state) => state.manageSlice.data.fetchUserDetail) as ApiResponse<ManageableUser> | null;
  const loadingState = useAppSelector((state) => state.manageSlice.loading.fetchUserDetail);

  const [phone, setPhone] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingMsg, setSavingMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedStation, setSelectedStation] = useState('');

  const rolesResponse = useAppSelector(state => state.registrationSlice.data.fetchRoles);
  const regionsResponse = useAppSelector(state => state.registrationSlice.data.fetchRegions);
  const areasResponse = useAppSelector(state => state.registrationSlice.data.fetchAreas);
  const stationsResponse = useAppSelector(state => state.registrationSlice.data.fetchRegistrationStations);

  const roles = useMemo(() => normalizeRoles(rolesResponse), [rolesResponse]);
  const regions = useMemo(() => normalizeRegions(regionsResponse), [regionsResponse]);
  const areas = useMemo(() => normalizeAreas(areasResponse), [areasResponse]);
  const stations = useMemo(() => normalizeStations(stationsResponse), [stationsResponse]);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetail({ method: 'GET', params: { userId } }));
    }
  }, [dispatch, userId]);

  useEffect(() => {
    if (isEditing) {
       dispatch(fetchRoles());
       dispatch(fetchRegions());
       dispatch(fetchAreas());
       dispatch(fetchRegistrationStations());
    }
  }, [dispatch, isEditing]);

  useEffect(() => {
    if (response?.data && String(response.data.id) === userId) {
      const u = response.data;
      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      setIsActive(u.is_active ?? u.isActive ?? true);
      
      const roleName = typeof u.role === 'object' ? u.role.name : u.role;
      const roleObj = roles.find(r => r.role_name === roleName);
      setRole(roleObj?.role_id || '');
      
      if (u.access) {
         const regionObj = regions.find(r => r.region_name === u.access?.regions?.[0]);
         const areaObj = areas.find(a => a.area_name === u.access?.areas?.[0]);
         const stationObj = stations.find(s => s.station_name === u.access?.stations?.[0]);

         setSelectedRegion(regionObj?.region_id || '');
         setSelectedArea(areaObj?.area_id || '');
         setSelectedStation(stationObj?.station_id || '');
      }
    }
  }, [response, userId, roles, regions, areas, stations]);

  const isLoading = loadingState === 'pending';
  const user = response?.data;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavingMsg('');

    const selectedRegionName = regions.find(r => r.region_id === selectedRegion)?.region_name;
    const selectedAreaName = areas.find(a => a.area_id === selectedArea)?.area_name;
    const selectedStationName = stations.find(s => s.station_id === selectedStation)?.station_name;

    console.log(role)

    const resultAction = await dispatch(updateUser({
      method: 'PUT',
      payload: { 
        userId, 
        email,
        role_id: Number(role),
        first_name: firstName, 
        last_name: lastName, 
        phone,
        is_active: isActive,
        regions: selectedRegionName ? [selectedRegionName] : [],
        areas: selectedAreaName ? [selectedAreaName] : [],
        stations: selectedStationName ? [selectedStationName] : [],
        ...(password.trim() ? { password } : {})
      }
    }));

    console.log('result action', resultAction)

    if (updateUser.fulfilled.match(resultAction)) {
      setSavingMsg('Profile updated successfully.');
      setIsEditing(false);
      dispatch(fetchUserDetail({ method: 'GET', params: { userId } }));
    } else {
      setSavingMsg('Failed to update profile.');
    }
    setIsSaving(false);
  };

  const handleToggleStatus = async () => {
    if (!user) return;
    setIsSaving(true);
    setSavingMsg('');

    const resultAction = await dispatch(toggleUserStatus({
      method: 'PUT',
      payload: { userId, isActive: !user.isActive }
    }));

    if (toggleUserStatus.fulfilled.match(resultAction)) {
      setSavingMsg(`User ${user.isActive ? 'deactivated' : 'activated'} successfully.`);
      setIsModalOpen(false);
      dispatch(fetchUserDetail({ method: 'GET', params: { userId } }));
    } else {
      setSavingMsg('Failed to change status.');
      setIsModalOpen(false);
    }
    setIsSaving(false);
  };

  if (isLoading && !user) {
    return <div className="flex justify-center p-12"><Spinner className="w-8 h-8 text-blue-600" /></div>;
  }

  if (!user && !isLoading) {
    return <div className="text-red-600 p-6 bg-red-50 rounded-md">User not found or access denied.</div>;
  }

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Profile</h1>
          <p className="mt-1 text-sm text-gray-500">Manage specific details and access for {user.email}.</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/manage')}>Back to List</Button>
      </div>

      {savingMsg && (
        <div className={`p-4 rounded-md text-sm ${savingMsg.includes('success') ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-red-50 text-red-800 border border-red-100'}`}>
          {savingMsg}
        </div>
      )}

      <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg border border-gray-200">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b border-gray-200">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">Account Overview</h3>
          </div>
          <div className="flex items-center space-x-3">
            <RoleBadge role={user.role} />
            <StatusBadge isActive={!!user.is_active} />
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
            </div>
            {user.assignedCities && user.assignedCities.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Assigned Cities</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {user.assignedCities.map(c => c.city_name).join(', ')}
                </dd>
              </div>
            )}
            {user.assignedStation && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 bg-gray-50">
                <dt className="text-sm font-medium text-gray-500">Assigned Station</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.assignedStation.station_name}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Details</h3>
          {!isEditing && <Button variant="secondary" onClick={() => setIsEditing(true)}>Edit</Button>}
        </div>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField label='First Name'>
              <Input
                type="text"
                required
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isEditing || isSaving}
              />
            </FormField>
            <FormField label='Last Name'>
              <Input
                type="text"
                required
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isEditing || isSaving}
              />
            </FormField>
            <FormField label="Email Address">
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditing || isSaving}
                placeholder="email@example.com"
              />
            </FormField>
            <FormField label="Phone Number">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isEditing || isSaving}
                placeholder="+91..."
                type="tel"
              />
            </FormField>
            <FormField label="Role">
              <Dropdown
                options={roles.map((r) => ({ value: r.role_id, label: r.role_name }))}
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={!isEditing || isSaving}
                placeholder="Select Role"
              />
            </FormField>
            <FormField label="Region">
              <Dropdown
                options={regions.map((r) => ({ value: r.region_id, label: r.region_name }))}
                value={selectedRegion}
                onChange={(e) => {
                  setSelectedRegion(e.target.value);
                  setSelectedArea('');
                  setSelectedStation('');
                }}
                disabled={!isEditing || isSaving}
                placeholder="Select Region"
              />
            </FormField>
            <FormField label="Area/City">
              <Dropdown
                options={areas
                  .filter((a) => {
                    if (!selectedRegion) return false;
                    const region = regions.find(r => r.region_id === selectedRegion);
                    return region && a.region_name.toLowerCase() === region.region_name.toLowerCase();
                  })
                  .map((a) => ({ value: a.area_id, label: a.area_name }))}
                value={selectedArea}
                onChange={(e) => {
                  setSelectedArea(e.target.value);
                  setSelectedStation('');
                }}
                disabled={!isEditing || isSaving || !selectedRegion}
                placeholder="Select Area"
              />
            </FormField>
            <FormField label="Station">
              <Dropdown
                options={stations
                  .filter((s) => {
                    if (!selectedArea) return false;
                    const area = areas.find(a => a.area_id === selectedArea);
                    return area && s.area_name.toLowerCase() === area.area_name.toLowerCase();
                  })
                  .map((s) => ({ value: s.station_id, label: s.station_name }))}
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                disabled={!isEditing || isSaving || !selectedArea}
                placeholder="Select Station"
              />
            </FormField>
            <FormField label="New Password (Optional)">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={!isEditing || isSaving}
                placeholder="••••••••"
              />
            </FormField>
            <div className="flex items-center space-x-3 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={!isEditing || isSaving}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Account Active</label>
            </div>
          </div>
          {isEditing && (
            <div className="flex justify-end space-x-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => { 
                setIsEditing(false); 
                setFirstName(user.first_name || ''); 
                setLastName(user.last_name || ''); 
                setEmail(user.email || '');
                setPhone(user.phone || ''); 
                setIsActive(user.is_active ?? user.isActive ?? true);
                const roleName = typeof user.role === 'object' ? user.role.name : user.role;
                const roleObj = roles.find(r => r.role_name === roleName);
                setRole(roleObj?.role_id || '');
                if (user.access) {
                  const regionObj = regions.find(r => r.region_name === user.access?.regions?.[0]);
                  const areaObj = areas.find(a => a.area_name === user.access?.areas?.[0]);
                  const stationObj = stations.find(s => s.station_name === user.access?.stations?.[0]);
                  setSelectedRegion(regionObj?.region_id || '');
                  setSelectedArea(areaObj?.area_id || '');
                  setSelectedStation(stationObj?.station_id || '');
                }
              }} disabled={isSaving}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isSaving}>Save Changes</Button>
            </div>
          )}
        </form>
      </div>

      <div className="bg-red-50 sm:rounded-lg border border-red-100 p-6">
        <h3 className="text-lg leading-6 font-medium text-red-800 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-4">
          {user.isActive
            ? "Deactivating an account immediately blocks the user's access. It can be reversed later."
            : "Reactivating an account instantly restores the user's previously granted access."}
        </p>
        <Button variant={user.isActive ? 'danger' : 'primary'} onClick={() => setIsModalOpen(true)} disabled={isSaving}>
          {user.isActive ? 'Deactivate Account' : 'Reactivate Account'}
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => !isSaving && setIsModalOpen(false)} title="Confirm Status Change">
        <p className="mb-6 py-2">
          Are you sure you want to {user.isActive ? 'deactivate' : 'reactivate'} the account for <strong className="text-gray-900">{user.email}</strong>?
        </p>
        <div className="flex justify-end space-x-3 w-full">
          <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button variant={user.isActive ? 'danger' : 'primary'} onClick={handleToggleStatus} isLoading={isSaving}>
            Confirm {user.isActive ? 'Deactivation' : 'Reactivation'}
          </Button>
        </div>
      </Modal>

    </div>
  );
};

export default ManageUserDetail;
