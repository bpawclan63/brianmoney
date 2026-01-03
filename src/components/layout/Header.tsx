import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageToggle } from '@/components/ui/language-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = 'Dashboard' }: HeaderProps) {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="h-16 border-b border-border bg-card/30 backdrop-blur-xl sticky top-0 z-30">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-foreground hidden sm:block">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t('common', 'search')}
              className="w-64 pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            />
          </div>

          {/* Language Toggle */}
          <LanguageToggle />

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <NotificationDropdown />

          {/* Profile */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-border flex items-center justify-center text-sm font-bold text-foreground">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
