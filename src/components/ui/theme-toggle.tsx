import { Moon, Sun, Sparkles, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme, Theme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

const themeConfig: Record<Theme, { icon: React.ElementType; label: string; color: string }> = {
  dark: { icon: Moon, label: 'Dark Pink', color: 'text-pink-400' },
  light: { icon: Sun, label: 'Light Pink', color: 'text-pink-500' },
  lavender: { icon: Sparkles, label: 'Lavender', color: 'text-purple-400' },
  mint: { icon: Leaf, label: 'Mint', color: 'text-emerald-400' },
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const CurrentIcon = themeConfig[theme].icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            'hover:bg-primary/10 hover:text-primary'
          )}
        >
          <CurrentIcon className={cn('h-5 w-5 transition-all duration-500', themeConfig[theme].color)} />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card border-border/50">
        {(Object.keys(themeConfig) as Theme[]).map((themeKey) => {
          const config = themeConfig[themeKey];
          const Icon = config.icon;
          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey)}
              className={cn(
                'flex items-center gap-2 cursor-pointer transition-colors',
                theme === themeKey && 'bg-primary/10'
              )}
            >
              <Icon className={cn('h-4 w-4', config.color)} />
              <span>{config.label}</span>
              {theme === themeKey && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}