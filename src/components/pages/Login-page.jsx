import LoginCard from '../login-card';

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SignupCard } from '../signup-card';
import { ThemeToggle } from '../ui/theme-toggle';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle } from 'lucide-react';
import { AnimatedTitle } from '../ui/animated-title';

export default function LoginPage() {
  const [activeView, setActiveView] = useState('signup');
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check if there's a success message from navigation state (e.g., from signup)
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      setActiveView('login'); // Switch to login view when coming from signup

      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-10 w-full">
        <div className="flex items-center gap-4">
          <Link to={'/'}>
            <AnimatedTitle />
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle variant="dropdown" className />
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-8">
        <div className="mx-auto grid w-full max-w-[900px] gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground">
                {activeView === 'login'
                  ? 'Sign in to your account to continue'
                  : 'Create an account to get started'}
              </p>{' '}
            </div>
            {successMessage && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-col gap-2 min-h-[300px] md:min-h-0">
              {activeView === 'login' ? (
                <LoginCard onViewChange={() => setActiveView('signup')} />
              ) : (
                <SignupCard onViewChange={() => setActiveView('login')} />
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex h-full items-center justify-center rounded-lg bg-muted p-8">
              <div className="space-y-4 text-center">
                <div className="h-20 w-20 rounded-full bg-primary mx-auto flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-10 w-10 text-primary-foreground"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <line x1="10" y1="9" x2="8" y2="9" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">
                    Annotation Management Platform
                  </h2>
                  <p className="text-muted-foreground">
                    Streamline your annotation workflow with our powerful
                    management tools. Collaborate with your team, track
                    progress, and deliver high-quality annotations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
