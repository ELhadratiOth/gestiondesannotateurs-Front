import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, User, Send } from 'lucide-react';
import { toast } from 'sonner';
import API from '../api';
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

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await API.post('/auth/forgot-password/', {
        username: formData.username,
        email: formData.email,
      });
      if (response.status === 200) {
        toast.success(
          'Password reset link sent successfully! Please check your email.',
        );
        navigate('/auth/forgot-password/success');
      }
    } catch (error) {
      console.error('Forgot password request failed:', error);

      // Handle different types of errors
      if (error.response) {
        // Server responded with an error status
        const status = error.response.status;
        const message = error.response.data?.message || 'An error occurred';
        if (status === 404) {
          toast.error('User not found. Please check your username and email.');
        } else if (status === 400) {
          toast.error(
            'Invalid request. Please check your input and try again.',
          );
        } else {
          toast.error(`Error: ${message}`);
        }
      } else {
        // Network error or other issues
        toast.error(
          'Failed to send reset email. Please check your internet connection and try again.',
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Forgot Password</CardTitle>
              <CardDescription>
                Enter your username and email address to receive a password
                reset link
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      className="pl-9"
                      value={formData.username}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-9"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4 mt-3">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Send className="mr-2 h-4 w-4 animate-pulse" />
                      Sending Reset Link...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground ">
                  Remember your password?
                  <Link to="/auth" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
