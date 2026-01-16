import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  subscriptionStatus: 'active' | 'inactive' | 'loading';
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'active' | 'inactive' | 'loading'>('loading');
  const [subscriptionChecked, setSubscriptionChecked] = useState(false);

  const checkSubscription = async () => {
    if (subscriptionChecked) return;
    if (!user) {
      setSubscriptionStatus('inactive');
      return;
    }
    try {
      console.log('Checking subscription for user:', user.id);
      // Use type assertion since user_subscriptions may not be in generated types
      const { data, error } = await (supabase as any)
        .from('user_subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus('inactive');
      } else {
        console.log('Subscription status found:', data?.status);
        setSubscriptionStatus((data?.status as 'active' | 'inactive') ?? 'inactive');
      }
    } catch (err) {
      console.error('Unexpected error in checkSubscription:', err);
      setSubscriptionStatus('inactive');
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkSubscription();
        } else {
          setSubscriptionStatus('inactive');
        }
      } catch (err) {
        console.error('Error during auth initialization:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkSubscription();
        } else {
          setSubscriptionStatus('inactive');
        }
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (subscriptionStatus === 'active') {
      console.log('Subscription active → stop polling');
      return;
    }

    console.log('Starting subscription polling...');
    const interval = setInterval(() => {
      checkSubscription();
    }, 5000);

    return () => {
      console.log('Stopping subscription polling');
      clearInterval(interval);
    };
  }, [user, subscriptionStatus]);





  const signUp = async (email: string, password: string, name?: string) => {
    const redirectUrl = `${window.location.origin}/`;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name }
      }
    });

    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { error: error as Error | null };
  };

  const signOut = async () => {
    console.log('signOut: Initiating logout...');
    // Force clear local state FIRST to ensure UI updates immediately
    setSession(null);
    setUser(null);
    setSubscriptionStatus('inactive');
    setLoading(false);

    try {
      console.log('signOut: Calling supabase.auth.signOut()...');
      await supabase.auth.signOut();
      console.log('signOut: Supabase logout successful');
    } catch (err) {
      console.error('signOut: Error during supabase sign out:', err);
    }
  };

  const resetPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?type=recovery`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    return { error: error as Error | null };
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error: error as Error | null };
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      subscriptionStatus,
      checkSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
