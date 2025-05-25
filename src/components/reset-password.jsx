import { useState, useEffect, Suspense } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import API from '../api';
import {
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

function ResetPasswordForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError(
        'Invalid or missing reset token. Please request a new password reset link.',
      );
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const validatePassword = password => {
    if (password.length < 5) {
      return 'Password must be at least 5 characters long';
    }
//     if (!/(?=.*[a-z])/.test(password)) {
//       return 'Password must contain at least one lowercase letter';
//     }
//     if (!/(?=.*[A-Z])/.test(password)) {
//       return 'Password must contain at least one uppercase letter';
//     }
//     if (!/(?=.*\d)/.test(password)) {
//       return 'Password must contain at least one number';
//     }
    return '';
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setIsLoading(true);

    try {
      const response = await API.post('/auth/reset-password', {
        token: token,
        newPassword: password,
      });
      if (response.status === 200) {
        setSuccess(true);

        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (error) {
      console.error('Password reset failed:', error);

      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || 'An error occurred';

        if (status === 400) {
          setError(
            'Invalid token or password. Please request a new reset link.',
          );
        } else if (status === 404) {
          setError(
            'Reset token not found or expired. Please request a new reset link.',
          );
        } else {
          setError(`Error: ${message}`);
        }
      } else {
        setError(
          'Failed to reset password. Please check your internet connection and try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">
            Validating reset token...
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
          <CardDescription>
            Your password has been successfully updated
          </CardDescription>
        </CardHeader>

        <CardContent className="text-center">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              You will be redirected to the login page in a few seconds...
            </AlertDescription>
          </Alert>
        </CardContent>

        <CardFooter>
          <Link to="/auth" className="w-full">
            <Button className="w-full">Go to Login</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Reset Your Password</CardTitle>
        <CardDescription>Enter your new password below</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your new password"
                className="pl-9 pr-9"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={!token}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-0.5 h-8 w-8 px-0 "
                onClick={() => setShowPassword(!showPassword)}
                disabled={!token}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm your new password"
                className="pl-9"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={!token}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 mt-3">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !token || !password || !confirmPassword}
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </Button>

          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 md:px-6">
        <Link to="/auth" className="flex items-center gap-2 font-semibold">
          <span className="h-8 w-8 rounded-md bg-primary text-center text-lg font-bold leading-8 text-primary-foreground">
            A
          </span>
          <span>Annotation Manager</span>
        </Link>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>

          <Suspense
            fallback={
              <Card>
                <CardContent className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Loading...
                    </p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
