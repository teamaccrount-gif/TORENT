import React, { useState, useMemo } from 'react';
import { RegistrationForm } from '../components/forms/RegistrationForm';
import { useAuth } from '../hooks/useAuth';
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
    return <div className="text-red-500 p-4">You do not have permission to register users.</div>;
  }

  const formatRoleName = (r: string) => r.replace('_', ' ');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Provision Access</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create new administrative accounts for your territory.
          </p>
        </div>

        {allowedTargetRoles.length > 1 && (
          <div className="inline-flex p-1 bg-gray-100 rounded-lg border border-gray-200 shadow-sm">
            {allowedTargetRoles.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedTargetRole(r)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTargetRole === r
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {formatRoleName(r)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-3xl">
        {/* Pass the selected role as a key to force re-mounting and clearing the form state */}
        <RegistrationForm key={selectedTargetRole} targetRole={selectedTargetRole} />
      </div>
    </div>
  );
};

export default RegisterUser;
