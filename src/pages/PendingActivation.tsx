import { Sparkles, Clock, Mail, Moon, Sun, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function PendingActivation() {
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    switch (theme) {
      case 'dark': return <Sun className="h-5 w-5" />;
      case 'light': return <Moon className="h-5 w-5" />;
      case 'lavender': return <Sparkles className="h-5 w-5" />;
      case 'mint': return <Leaf className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 theme-transition">
      {/* Theme Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 hover:bg-primary/10"
      >
        {getThemeIcon()}
      </Button>

      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4">
            <Clock className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Menunggu Aktivasi</h1>
        </div>

        {/* Content Card */}
        <div className="glass-card p-8 space-y-6">
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
              <Mail className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">
              Akun Anda Sedang Diproses
            </h2>
            <p className="text-muted-foreground">
              Terima kasih telah mendaftar di Flowly! Akun Anda sedang menunggu aktivasi dari admin.
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Email terdaftar:</span>
            </p>
            <p className="text-sm text-primary">{user?.email}</p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Hubungi admin untuk mengaktifkan akun Anda:</p>
            <a 
              href="https://wa.me/6281234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              WhatsApp: +62 812-3456-7890
            </a>
          </div>

          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => signOut()}
          >
            Keluar
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sudah diaktifkan?{' '}
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Refresh halaman
          </button>
        </p>
      </div>
    </div>
  );
}