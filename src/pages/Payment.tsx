import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, CreditCard } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
    interface Window {
        snap: any;
    }
}

export default function Payment() {
    const { user, signOut, checkSubscription } = useAuth();
    const [loading, setLoading] = useState(false);

    const loadSnapScript = (isProduction: boolean): Promise<void> => {
        return new Promise((resolve) => {
            const scriptId = 'midtrans-snap-script';
            const existingScript = document.getElementById(scriptId);
            const scriptSrc = isProduction
                ? 'https://app.midtrans.com/snap/snap.js'
                : 'https://app.sandbox.midtrans.com/snap/snap.js';
            const clientKey = isProduction
                ? 'Mid-client-88J3A25b8P192D4' // <--- GANTI DENGAN PRODUCTION CLIENT KEY ANDA
                : 'SB-Mid-client-4V_t5FcOIPmQm8Ea';

            if (existingScript) {
                if ((existingScript as HTMLScriptElement).src === scriptSrc) {
                    resolve();
                    return;
                }
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = scriptSrc;
            script.setAttribute('data-client-key', clientKey);
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    };

    const handlePayment = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const orderId = `ORDER-${Date.now()}-${user.id.slice(0, 8)}`;

            const { data, error } = await supabase.functions.invoke('midtrans-qris', {
                body: {
                    order_id: orderId,
                    amount: 30000
                }
            });

            if (error) throw error;

            console.log('Payment data received:', data);

            // Dynamically load the correct Snap script
            await loadSnapScript(data.is_production);

            if (window.snap) {
                window.snap.pay(data.token, {
                    onSuccess: async (result: any) => {
                        console.log('Payment success:', result);
                        toast({
                            title: "Pembayaran Berhasil!",
                            description: "Akun Anda sedang diaktifkan.",
                        });
                        // Wait a bit for webhook to process, then re-check
                        setTimeout(async () => {
                            await checkSubscription();
                        }, 2000);
                    },
                    onPending: (result: any) => {
                        console.log('Payment pending:', result);
                        toast({
                            title: "Pembayaran Pending",
                            description: "Silahkan selesaikan pembayaran Anda.",
                        });
                    },
                    onError: (result: any) => {
                        console.error('Payment error:', result);
                        toast({
                            title: "Pembayaran Gagal",
                            description: "Terjadi kesalahan saat memproses pembayaran.",
                            variant: "destructive",
                        });
                    },
                    onClose: () => {
                        console.log('Payment popup closed');
                    }
                });
            }
        } catch (error: any) {
            console.error('Payment error:', error);
            toast({
                title: "Gagal memproses pembayaran",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 theme-transition">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-pink/10 rounded-full blur-3xl animate-pulse-slow" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow" />
            </div>

            <div className="w-full max-w-md relative">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center glow-cyan mb-4">
                        <Sparkles className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient">Flowly Premium</h1>
                    <p className="text-muted-foreground mt-2">Aktifkan akun Anda untuk mulai mengelola keuangan.</p>
                </div>

                <div className="glass-card p-8">
                    <div className="space-y-6">
                        <div className="bg-primary/10 rounded-xl p-4 border border-primary/20">
                            <h2 className="text-xl font-semibold text-primary mb-1">Paket Bulanan</h2>
                            <p className="text-3xl font-bold text-foreground">Rp 30.000 <span className="text-sm font-normal text-muted-foreground">/ bulan</span></p>
                            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Akses penuh ke semua fitur
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Sinkronisasi cloud aman
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Laporan keuangan lengkap
                                </li>
                            </ul>
                        </div>

                        <Button
                            onClick={handlePayment}
                            variant="neon"
                            className="w-full h-12 text-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                    Memproses...
                                </>
                            ) : (
                                <>
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Bayar Sekarang
                                </>
                            )}
                        </Button>

                        <Button
                            onClick={() => signOut()}
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-foreground"
                        >
                            Keluar dari Akun
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Pembayaran menggunakan QRIS via Midtrans. Aman dan terpercaya.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
