import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAppDispatch } from '../Redux/Store';
import { loginUser } from '../Redux/Slices/authSlice';

import type { ApiResponse, User } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        email,
        password,
      };

      console.log('[AUTH][LOGIN] Submit clicked:', {
        email,
        passwordLength: password.length,
      });
      console.log('[AUTH][LOGIN] Dispatch payload:', payload);

      const resultAction = await dispatch(
        loginUser({
          method: 'POST',
          payload: payload,
        })
      );

      console.log('[AUTH][LOGIN] Thunk result:', {
        type: resultAction.type,
        hasPayload: Boolean((resultAction as any).payload),
      });

      if (loginUser.fulfilled.match(resultAction)) {
        const responseData = resultAction.payload as ApiResponse<User> | { success?: boolean; message?: string; data?: any; user?: User };

        console.log('[AUTH][LOGIN] Fulfilled response:', responseData);

        if ((responseData as any).success !== false) {
          console.log('[AUTH][LOGIN] Login accepted, navigating to dashboard.');
          navigate('/dashboard', { replace: true });
        } else {
          console.warn('[AUTH][LOGIN] Login rejected by response payload.');
          setErrorMsg((responseData as any).message || 'Login failed. Invalid credentials.');
        }
      } else {
        console.error('[AUTH][LOGIN] Login thunk rejected:', resultAction.payload);
        setErrorMsg((resultAction.payload as string) || 'Server error occurred.');
      }
    } catch (err) {
      console.error('[AUTH][LOGIN] Unexpected error:', err);
      setErrorMsg('An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
      setPassword(''); // Never store password component state longer than lifecycle
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            Sign in to Torent
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm p-4">
            <FormField label="Email Address">
              <Input
                type="email"
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </FormField>

            <FormField label="Password">
              <Input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </FormField>
          </div>

          {errorMsg && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
              {errorMsg}
            </div>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              className="w-full flex justify-center py-2.5 shadow-sm text-base"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
