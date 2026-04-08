import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { fetchUsers } from '../Redux/Slices/manageSlice';
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

  const response = useAppSelector((state) => state.manageSlice.data.fetchUsers) as PaginatedResponse<ManageableUser> | null;
  const loadingState = useAppSelector((state) => state.manageSlice.loading.fetchUsers);
  const error = useAppSelector((state) => state.manageSlice.error.fetchUsers);

  useEffect(() => {
    dispatch(fetchUsers({ method: 'GET', params: { page, limit } }));
  }, [dispatch, page, limit]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const isLoading = loadingState === 'pending';
  const users = response?.data?.items || [];
  const totalPages = response?.data?.totalPages || 1;

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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created date</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center">
                    <Spinner className="mx-auto text-blue-600" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500">
                    No users found under your jurisdiction.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {user.email}
                      <div className="text-xs text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.isActive} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="secondary" onClick={() => navigate(`/manage/${user.id}`)} className="py-1 px-3 text-xs">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
