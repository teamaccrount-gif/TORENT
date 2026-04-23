import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { fetchUserDetail, updateUser, toggleUserStatus } from '../Redux/Slices/manageSlice';
import {
  fetchRegions,
  fetchRoles,
  fetchAreasByRegion,
  fetchStationsByArea,
} from '../Redux/Slices/registrationSlice';
import { normalizeRoles, normalizeRegions, normalizeAreas, normalizeStations } from '../utils/registrationHelpers';
import { FormField } from '../components/ui/formfield';
import { Input } from '../components/ui/input';
import { Dropdown } from '../components/ui/dropdown';
import { Button } from '../components/ui/button';
import { Badge, RoleBadge, StatusBadge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import type { ManageableUser, ApiResponse } from '../types';

const ManageUserDetail: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const response = useAppSelector((state) => state.manageSlice.data.fetchUserDetail) as ApiResponse<ManageableUser> | null;
  const loadingState = useAppSelector((state) => state.manageSlice.loading.fetchUserDetail);

  // Edit form state
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingMsg, setSavingMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Dropdown selections — store NAMES
  const [selectedRoleName, setSelectedRoleName] = useState('');
  const [selectedRegionName, setSelectedRegionName] = useState('');
  const [selectedAreaName, setSelectedAreaName] = useState('');
  const [selectedStationName, setSelectedStationName] = useState('');

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

  // Fetch user detail on mount
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserDetail({ method: 'GET', params: { userId } }));
    }
  }, [dispatch, userId]);

  // Fetch dropdown data when editing starts
  useEffect(() => {
    if (!isEditing) return;
    dispatch(fetchRoles({ method: 'GET' }));
    dispatch(fetchRegions({ method: 'GET' }));
  }, [dispatch, isEditing]);

  // Cascading fetch: areas when region changes
  useEffect(() => {
    if (!isEditing || !selectedRegionName) return;
    dispatch(fetchAreasByRegion({ method: 'GET', urlParam: selectedRegionName }));
  }, [dispatch, selectedRegionName, isEditing]);

  // Cascading fetch: stations when area changes
  useEffect(() => {
    if (!isEditing || !selectedAreaName) return;
    dispatch(fetchStationsByArea({ method: 'GET', urlParam: selectedAreaName }));
  }, [dispatch, selectedAreaName, isEditing]);

  // Sync form fields from loaded user data
  useEffect(() => {
    if (response?.data && String(response.data.id) === userId) {
      const u = response.data;
      setFirstName(u.first_name || '');
      setLastName(u.last_name || '');
      setEmail(u.email || '');
      setPhone(u.phone || '');
      setIsActive(u.is_active ?? u.isActive ?? true);
      const roleName = typeof u.role === 'object' ? (u.role as any).name : u.role;
      setSelectedRoleName(String(roleName || ''));
      setSelectedRegionName(u.access?.regions?.[0] || '');
      setSelectedAreaName(u.access?.areas?.[0] || '');
      setSelectedStationName(u.access?.stations?.[0] || '');
    }
  }, [response, userId]);

  const isLoading = loadingState === 'pending';
  const user = response?.data;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavingMsg('');

    const roleObj = roles.find((r) =>
      r.role_name.toLowerCase() === selectedRoleName.toLowerCase()
    );

    const resultAction = await dispatch(updateUser({
      method: 'PUT',
      payload: {
        userId,
        email,
        role_id: roleObj ? Number(roleObj.role_id) : undefined,
        first_name: firstName,
        last_name: lastName,
        phone,
        is_active: isActive,
        regions: selectedRegionName ? [selectedRegionName] : [],
        areas: selectedAreaName ? [selectedAreaName] : [],
        stations: selectedStationName ? [selectedStationName] : [],
        ...(password.trim() ? { password } : {}),
      }
    }));

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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSavingMsg('');
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setIsActive(user.is_active ?? user.isActive ?? true);
      const roleName = typeof user.role === 'object' ? (user.role as any).name : user.role;
      setSelectedRoleName(String(roleName || ''));
      setSelectedRegionName(user.access?.regions?.[0] || '');
      setSelectedAreaName(user.access?.areas?.[0] || '');
      setSelectedStationName(user.access?.stations?.[0] || '');
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="text-muted-foreground animate-pulse">Loading profile details...</p>
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>User not found or access denied.</AlertDescription>
      </Alert>
    );
  }

  if (!user) return null;

  const roleOptions = roles.map((r) => ({ value: r.role_name, label: r.role_name }));
  const regionOptions = regions.map((r) => ({ value: r.region_name, label: r.region_name }));
  const areaOptions = areas.map((a) => ({ value: a.area_name, label: a.area_name }));
  const stationOptions = stations.map((s) => ({ value: s.station_name, label: s.station_name }));

  const isSuccess = savingMsg.toLowerCase().includes('success');

  return (
    <div className="space-y-8 max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">User Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Operational details and hierarchical access for <span className="font-semibold text-gray-900">{user.email}</span>.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/manage')} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      {savingMsg && (
        <Alert className={`animate-in zoom-in duration-300 ${isSuccess ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {isSuccess ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{savingMsg}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Account Details */}
          <Card className="border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100 flex flex-row items-center justify-between py-4">
              <div>
                <CardTitle className="text-lg font-semibold">Account Details</CardTitle>
                <CardDescription>Primary identification and identity information.</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="default" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <FormField label="First Name">
                    <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={!isEditing || isSaving} placeholder="First Name" />
                  </FormField>
                  <FormField label="Last Name">
                    <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={!isEditing || isSaving} placeholder="Last Name" />
                  </FormField>
                  <FormField label="Email Address">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={!isEditing || isSaving} placeholder="email@example.com" />
                  </FormField>
                  <FormField label="Phone Number">
                    <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing || isSaving} placeholder="+91..." />
                  </FormField>
                  <FormField label="New Password (Optional)">
                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={!isEditing || isSaving} placeholder="Leave blank to keep current" />
                  </FormField>
                </div>

                <div className="space-y-4 border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Access Configuration</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <FormField label="Role">
                      <Dropdown
                        options={roleOptions}
                        value={selectedRoleName}
                        onChange={(e) => setSelectedRoleName(e.target.value)}
                        isLoading={rolesLoading === 'pending'}
                        disabled={!isEditing || isSaving}
                        placeholder="Select Role"
                      />
                    </FormField>
                    <FormField label="Region">
                      <Dropdown
                        options={regionOptions}
                        value={selectedRegionName}
                        onChange={(e) => {
                          setSelectedRegionName(e.target.value);
                          setSelectedAreaName('');
                          setSelectedStationName('');
                        }}
                        isLoading={regionsLoading === 'pending'}
                        disabled={!isEditing || isSaving}
                        placeholder="Select Region"
                      />
                    </FormField>
                    <FormField label="Area / City">
                      <Dropdown
                        options={areaOptions}
                        value={selectedAreaName}
                        onChange={(e) => {
                          setSelectedAreaName(e.target.value);
                          setSelectedStationName('');
                        }}
                        isLoading={areasLoading === 'pending'}
                        disabled={!isEditing || isSaving || !selectedRegionName}
                        placeholder={areasLoading === 'pending' ? 'Loading areas...' : 'Select Area'}
                      />
                    </FormField>
                    <FormField label="Station">
                      <Dropdown
                        options={stationOptions}
                        value={selectedStationName}
                        onChange={(e) => setSelectedStationName(e.target.value)}
                        isLoading={stationsLoading === 'pending'}
                        disabled={!isEditing || isSaving || !selectedAreaName}
                        placeholder={stationsLoading === 'pending' ? 'Loading stations...' : 'Select Station'}
                      />
                    </FormField>
                  </div>
                </div>

                <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <Checkbox
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(!!checked)}
                    disabled={!isEditing || isSaving}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Account Active
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Enable or disable login access for this user.
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="default" disabled={isSaving || rolesLoading === 'pending'}>
                      {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          {/* Sidebar Info Card */}
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-gray-500">Status Snapshot</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Role</span>
                <RoleBadge role={user.role} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Status</span>
                <StatusBadge isActive={!!user.is_active} />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Jurisdiction Overview</p>
                <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 italic leading-relaxed">
                  {user.access?.regions?.length ? `Regions: ${user.access.regions.join(', ')}` : 'No Region Restriction'}
                  {user.access?.areas?.length ? `\nAreas: ${user.access.areas.join(', ')}` : ''}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-100 bg-red-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-red-800 text-base font-semibold">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs text-red-600 leading-relaxed">
                {user.isActive
                  ? "Deactivating an account immediately blocks the user's access. It can be reversed later."
                  : "Reactivating an account instantly restores the user's previously granted access."}
              </p>
              <Button 
                variant={user.isActive ? 'destructive' : 'default'} 
                className="w-full"
                onClick={() => setIsModalOpen(true)} 
                disabled={isSaving}
              >
                {user.isActive ? 'Deactivate Account' : 'Reactivate Account'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={isModalOpen} onOpenChange={(open) => !open && !isSaving && setIsModalOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to <span className="font-semibold text-foreground">{user.isActive ? 'deactivate' : 'reactivate'}</span> the account for{' '}
              <span className="font-semibold text-foreground">{user.email}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => { e.preventDefault(); handleToggleStatus(); }} 
              variant={user.isActive ? 'destructive' : 'default'}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm {user.isActive ? 'Deactivation' : 'Reactivation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageUserDetail;
