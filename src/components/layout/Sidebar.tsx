import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  BarChart3,
  CheckSquare,
  Settings,
  Info,
  ChevronLeft,
  Sparkles,
  Target,
  Repeat,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/budgets', label: 'Budgets', icon: PiggyBank },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/recurring', label: 'Recurring', icon: Repeat },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/todos', label: 'Todo List', icon: CheckSquare },
];

const bottomNavItems = [
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/about', label: 'About', icon: Info },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full z-50 flex flex-col',
          'bg-sidebar border-r border-sidebar-border',
          'transition-all duration-300 ease-out',
          isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-20 lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center glow-cyan">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span
              className={cn(
                'font-bold text-lg text-gradient transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
              )}
            >
              Flowly
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className={cn(
              'hidden lg:flex text-muted-foreground hover:text-foreground transition-transform',
              !isOpen && 'rotate-180'
            )}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  'hover:bg-sidebar-accent group relative',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-full" />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-all',
                    isActive ? 'text-sidebar-primary' : 'group-hover:text-sidebar-primary'
                  )}
                />
                <span
                  className={cn(
                    'font-medium whitespace-nowrap transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom navigation */}
        <div className="py-4 px-3 space-y-2 border-t border-sidebar-border">
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                  'hover:bg-sidebar-accent group',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-primary'
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-all',
                    isActive ? 'text-sidebar-primary' : 'group-hover:text-sidebar-primary'
                  )}
                />
                <span
                  className={cn(
                    'font-medium whitespace-nowrap transition-opacity duration-200',
                    isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          })}
          
          {/* Logout */}
          <button
            onClick={() => signOut()}
            className={cn(
              'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 w-full',
              'hover:bg-destructive/10 group text-muted-foreground hover:text-destructive'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span
              className={cn(
                'font-medium whitespace-nowrap transition-opacity duration-200',
                isOpen ? 'opacity-100' : 'opacity-0 lg:hidden'
              )}
            >
              Sign Out
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
