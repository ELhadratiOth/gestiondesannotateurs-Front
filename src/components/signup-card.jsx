import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function SignupCard({ onViewChange }) {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    token: token,
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signup(formData);
      if (result.success) {
        navigate('/auth', {
          state: { message: 'Account created successfully! Please log in.' },
        });
      } else if (result.error === 'User already exists') {
        setError('Username already exists. Please choose a different one.');
      } else {
        setError(result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information to create an account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  name="username"
                  placeholder="John"
                  className="pl-9"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>{' '}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-9 pr-9"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0.5 top-0.5 h-8 w-8 px-0 "
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground " />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground " />
                )}
                <span className="sr-only">
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>
          {error && (
            <div className="text-sm text-destructive font-medium">{error}</div>
          )}
          <div className="flex items-center space-x-2 space-y-1">
            <Checkbox className="mt-1" id="terms" required />
            <Label htmlFor="terms" className="text-sm font-normal">
              I agree to the{' '}
              <Button variant="link" className="h-auto p-0" type="button">
                terms of service
              </Button>{' '}
              and{' '}
              <Button variant="link" className="h-auto p-0" type="button">
                privacy policy
              </Button>
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formData.username || !formData.password}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Button
              variant="link"
              className="h-auto p-0"
              onClick={onViewChange}
              type="button"
            >
              Sign in
            </Button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
