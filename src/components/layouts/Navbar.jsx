import { User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '../../context/AuthContext';
import { ThemeToggle } from '../ui/theme-toggle';
import { AnimatedTitle } from '../ui/animated-title';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 md:px-10 w-full">
      <div className="flex items-center gap-4">
        <Link to={'/'}>
          <AnimatedTitle />
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle variant="dropdown" className />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 rounded-lg flex items-center justify-center p-0"
            >
              <User className="h-5 w-5" />
              {user && user.username && (
                <span className="ml-2 text-sm capitalize">{user.username}</span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                {user && (
                  <>
                    <p className="text-sm font-medium leading-none">
                      @{user.username}
                    </p>
                    {user.email && (
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    )}
                    <p className="text-xs leading-none text-muted-foreground">
                      Role: {user.role}
                    </p>
                  </>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to={'/profile'}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
