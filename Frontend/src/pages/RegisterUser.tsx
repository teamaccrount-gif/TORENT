import React, { useState, useMemo } from 'react';
import { RegistrationForm } from '../components/forms/RegistrationForm';
import { useAuth } from '../hooks/useAuth';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { Role } from '../types';

const RegisterUser: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role.toLowerCase() as Role;
  
  const allowedTargetRoles = useMemo<Exclude<Role, 'super_admin'>[]>(() => {
    if (role === 'super_admin' || role === 'admin') {
      return ['admin', 'manager', 'engineer', 'operator'];
    }
    return [];
  }, [role]);

  const [selectedTargetRole, setSelectedTargetRole] = useState<Exclude<Role, 'super admin'> | null>(
    allowedTargetRoles.length > 0 ? allowedTargetRoles[0] : null
  );

  if (!selectedTargetRole) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-10">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>You do not have permission to register users.</AlertDescription>
      </Alert>
    );
  }

  const formatRoleName = (r: string) => r.replace('_', ' ').toUpperCase();

  return (
    <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Provision Access</h1>
        <p className="text-muted-foreground text-sm">
          Create new administrative accounts for your territory.
        </p>
      </div>

      {allowedTargetRoles.length > 1 && (
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Account Type</p>
          <Tabs 
            value={selectedTargetRole} 
            onValueChange={(v) => setSelectedTargetRole(v as any)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-11 p-1 bg-gray-100 border border-gray-200 shadow-sm">
              {allowedTargetRoles.map((r) => (
                <TabsTrigger 
                  key={r} 
                  value={r} 
                  className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-sm font-medium transition-all"
                >
                  {formatRoleName(r)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="max-w-3xl mt-4">
        {/* Pass the selected role as a key to force re-mounting and clearing the form state */}
        <RegistrationForm key={selectedTargetRole} targetRole={selectedTargetRole} />
      </div>
    </div>
  );
};

export default RegisterUser;
