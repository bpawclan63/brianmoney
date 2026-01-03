import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionGuardProps {
    children: ReactNode;
}

export default function SubscriptionGuard({ children }: SubscriptionGuardProps) {
    const { user, loading, subscriptionStatus, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading && user) {
            if (subscriptionStatus === 'inactive' && location.pathname !== '/payment') {
                navigate('/payment', { replace: true });
            } else if (subscriptionStatus === 'active' && location.pathname === '/payment') {
                navigate('/', { replace: true });
            }
        } else if (!loading && !user) {
            navigate('/auth', { replace: true });
        }
    }, [user, loading, subscriptionStatus, navigate, location.pathname]);

    console.log('SubscriptionGuard rendering:', { loading, user: !!user, subscriptionStatus });
    if (loading || (user && subscriptionStatus === 'loading')) {
        console.log('SubscriptionGuard: Showing Loader');
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary mb-6" />
                <div className="text-center space-y-4 max-w-sm">
                    <h2 className="text-xl font-semibold">Tunggu sebentar...</h2>
                    <p className="text-muted-foreground">
                        Kami sedang memverifikasi status langganan Anda. Jika ini memakan waktu terlalu lama, Anda bisa mencoba masuk kembali.
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
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Keluar & Coba Lagi
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
