import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Button } from './button';

export const ThemeToggle = ({ variant = 'simple' }) => {
  const { toggleTheme, isDark, setTheme, setSystemTheme } = useTheme();
  if (variant === 'dropdown') {
    return (
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="relative h-9 w-9 mt-1 rounded-md border-0 bg-transparent hover:bg-accent hover:text-accent-foreground group"
        >
          <Sun
            className={`h-[1.2rem] w-[1.2rem] ${isDark ? 'hidden' : 'block'}`}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] ${
              isDark ? 'block' : 'hidden'
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Simple dropdown without animations */}
        <div className="invisible group-hover:visible absolute right-0 top-full mt-1 w-32 bg-popover border rounded-md shadow-md z-50">
          <div className="p-1">
            <button
              onClick={() => setTheme('light')}
              className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
            >
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
            >
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </button>
            <button
              onClick={setSystemTheme}
              className="flex w-full items-center px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm"
            >
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-9 w-9 rounded-md border-0 bg-transparent hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <Sun className={`h-[1.2rem] w-[1.2rem] ${isDark ? 'hidden' : 'block'}`} />
      <Moon
        className={`absolute h-[1.2rem] w-[1.2rem] ${
          isDark ? 'block' : 'hidden'
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
