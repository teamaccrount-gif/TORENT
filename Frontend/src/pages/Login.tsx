import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
<<<<<<< HEAD
import { FormField } from '../components/ui/formfield';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
=======
import { FormField } from '../components/ui/FormField';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
>>>>>>> 3cd2829 (Revert "feat: implement telemetry visualization component and initialize interactive map module")
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../Redux/Store';
import { loginUser } from '../Redux/Slices/authSlice';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

import type { User, ApiResponse } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const { login } = useAuth();
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
        const responseBody = (responseData as any)?.data ?? responseData;
        const rawUser =
          responseBody?.user ??
          (responseData as any)?.user ??
          (responseBody?.email && responseBody?.role ? responseBody : null);
        const userData = rawUser
          ? { ...rawUser, role: rawUser.role?.toUpperCase() as User['role'] }
          : null;

        console.log('[AUTH][LOGIN] Fulfilled response:', responseData);
        console.log('[AUTH][LOGIN] Parsed user data:', userData);

        if ((responseData as any).success !== false && userData) {
          console.log('[AUTH][LOGIN] Login accepted, storing user and navigating to dashboard.');
          login(userData as User);
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
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4 text-gray-900">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900">
            Sign in to Torent
          </CardTitle>
          <CardDescription className="text-gray-500">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
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
              <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full h-11 text-base font-semibold transition-all hover:shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
