import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { MainLayout } from "./components/layout/MainLayout";
import { useUserActivation } from "./hooks/useUserActivation";
import Index from "./pages/Index";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Analytics from "./pages/Analytics";
import Todos from "./pages/Todos";
import Goals from "./pages/Goals";
import Recurring from "./pages/Recurring";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import PendingActivation from "./pages/PendingActivation";
import Terms from "./pages/Terms";
import Guide from "./pages/Guide";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import SubscriptionGuard from "./components/auth/SubscriptionGuard";
import { Loader2 } from "lucide-react";
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, signOut } = useAuth();

  const { isActivated, loading: activationLoading } = useUserActivation();

  console.log('ProtectedRoute rendering:', { authLoading, activationLoading });
  if (authLoading) {
    console.log('ProtectedRoute: Showing Loader');
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
        <div className="text-center space-y-4 max-w-sm">
          <h2 className="text-xl font-semibold">Memuat Profil...</h2>
          <p className="text-muted-foreground">
            Sedang menyiapkan data Anda. Jika tidak segera terbuka, silakan coba login ulang.
          </p>
          <div className="pt-4">
            <Button
              variant="outline"
              onClick={async () => {
                console.log('Button clicked: Logging out and reloading page');
                try {
                  await signOut();
                } catch (error) {
                  console.error('Logout error:', error);
                } finally {
                  // Force full page reload to clear all session data
                  window.location.reload();
                }
              }}
              className="w-full flex items-center justify-center gap-2 relative z-50"
            >
              <LogOut className="w-4 h-4" />
              Keluar & Coba Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user is activated (existing logic)
  if (isActivated === false) {
    return <PendingActivation />;
  }

  return <SubscriptionGuard>{children}</SubscriptionGuard>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/payment" element={<SubscriptionGuard><Payment /></SubscriptionGuard>} />
      <Route path="/admin-login" element={<AdminAuth />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Index />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/recurring" element={<Recurring />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
        <Route path="/guide" element={<Guide />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
