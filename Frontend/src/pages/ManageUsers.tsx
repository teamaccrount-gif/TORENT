import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../Redux/Store';
import { fetchUsers, deleteUser } from '../Redux/Slices/manageSlice';
import { Badge, RoleBadge, StatusBadge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, MoreHorizontal, Eye, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

import type { ManageableUser, ApiResponse } from '../types';

import { Skeleton } from 'boneyard-js/react';

const ManageUsers: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [userToDelete, setUserToDelete] = useState<ManageableUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const response = useAppSelector((state) => state.manageSlice.data.fetchUsers) as ApiResponse<ManageableUser[]> | null;
  const loadingState = useAppSelector((state) => state.manageSlice.loading.fetchUsers);
  const error = useAppSelector((state) => state.manageSlice.error.fetchUsers);

  useEffect(() => {
    dispatch(fetchUsers({ method: 'GET'}));
  }, [dispatch]);

  const isLoading = loadingState === 'pending';
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
        setUserToDelete(null);
      }
    } catch (err) {
      console.error('Failed to delete user:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Skeleton name="manage-users" loading={isLoading} transition>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Manage Users</h1>
          <p className="text-sm text-muted-foreground">
            View and manage the accounts in your jurisdiction.
          </p>
        </div>

        <Card className="border-gray-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">User Directory</CardTitle>
                <CardDescription>A list of all users and their current roles/permissions.</CardDescription>
              </div>
              <Button variant="default" size="sm" onClick={() => navigate('/register')}>
                Add New User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <Alert variant="destructive" className="m-4 bg-red-50 border-red-100 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="w-[80px] font-semibold text-gray-700">ID</TableHead>
                    <TableHead className="font-semibold text-gray-700">User Info</TableHead>
                    <TableHead className="font-semibold text-gray-700">Role</TableHead>
                    <TableHead className="font-semibold text-gray-700">Status</TableHead>
                    <TableHead className="font-semibold text-gray-700">Jurisdiction</TableHead>
                    <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    <TableHead className="text-right font-semibold text-gray-700">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-48 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                          <span className="text-sm text-muted-foreground">Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center text-sm text-muted-foreground">
                        No users found under your jurisdiction.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="font-medium text-gray-500">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">{user.email}</span>
                            <span className="text-xs text-muted-foreground">{user.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <RoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge isActive={user.is_active ?? user.isActive ?? false} />
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground italic max-w-[200px] truncate">
                          {formatJurisdiction(user.access)}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {new Date(user.created_at || (user.createdAt as string)).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate(`/manage/${user.id}`)}
                              className="h-8 w-8 p-0"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => setUserToDelete(user)}
                              className="h-8 w-8 p-0"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && !isDeleting && setUserToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the user <span className="font-semibold text-foreground">{userToDelete?.email}</span>? 
                This action cannot be undone and will permanently remove all access for this user.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={(e) => { e.preventDefault(); handleDelete(); }} 
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete User'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Skeleton>
  );
};

export default ManageUsers;
