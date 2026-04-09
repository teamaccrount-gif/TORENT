import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { fetchUsers, deleteUser } from '../Redux/Slices/manageSlice';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { RoleBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import type { ManageableUser, PaginatedResponse } from '../types';

const ManageUsers: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ManageableUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const response = useAppSelector((state) => state.manageSlice.data.fetchUsers) as ApiResponse<ManageableUser[]> | null;
  const loadingState = useAppSelector((state) => state.manageSlice.loading.fetchUsers);
  const error = useAppSelector((state) => state.manageSlice.error.fetchUsers);

  useEffect(() => {
    dispatch(fetchUsers({ method: 'GET'}));
  }, [dispatch]);

  const isLoading = loadingState === 'pending';
  // Use data directly as an array as per backend response
  const users = Array.isArray(response?.data) ? response.data : [];

  const formatJurisdiction = (access: ManageableUser['access']) => {
    if (!access) return 'All';
    const parts: string[] = [];
    if (access.regions?.length) parts.push(`Reg: ${access.regions.join(', ')}`);
    if (access.areas?.length) parts.push(`Area: ${access.areas.join(', ')}`);
    if (access.stations?.length) parts.push(`Stn: ${access.stations.join(', ')}`);
    return parts.length > 0 ? parts.join(' | ') : access.level?.replace(/_/g, ' ');
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const resultAction = await dispatch(deleteUser({ 
        method: 'DELETE', 
        payload: { userId: String(userToDelete.id) } 
      }));
      
      if (deleteUser.fulfilled.match(resultAction)) {
        dispatch(fetchUsers({ method: 'GET'}));
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Manage Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage the accounts in your jurisdiction.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm border-b border-red-100">
            {error}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jurisdiction</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center">
                    <Spinner className="mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users found under your jurisdiction.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.is_active ?? user.isActive ?? false} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 italic">
                      {formatJurisdiction(user.access)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at || (user.createdAt as string)).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Button variant="secondary" onClick={() => navigate(`/manage/${user.id}`)} className="py-1 px-3 text-xs">
                        View
                      </Button>
                      <Button variant="danger" onClick={(e) => { e.stopPropagation(); setUserToDelete(user); setIsDeleteModalOpen(true); }} className="py-1 px-3 text-xs">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => !isDeleting && setIsDeleteModalOpen(false)} 
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the user <span className="font-semibold text-gray-900">{userToDelete?.email}</span>? 
            This action cannot be undone and will remove all access for this user.
          </p>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUsers;
