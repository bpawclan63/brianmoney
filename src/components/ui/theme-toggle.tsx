import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        'hover:bg-primary/10 hover:text-primary'
      )}
    >
      <Sun
        className={cn(
          'h-5 w-5 transition-all duration-300',
          theme === 'dark'
            ? 'rotate-0 scale-100'
            : 'rotate-90 scale-0 absolute'
        )}
      />
      <Moon
        className={cn(
          'h-5 w-5 transition-all duration-300',
          theme === 'light'
            ? 'rotate-0 scale-100'
            : '-rotate-90 scale-0 absolute'
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}