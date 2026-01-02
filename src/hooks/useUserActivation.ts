import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useUserActivation() {
  const { user } = useAuth();
  const [isActivated, setIsActivated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkActivation = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('activated_at, is_active')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking activation:', error);
        setIsActivated(false);
      } else if (data) {
        // User is activated if activated_at is set and is_active is true
        setIsActivated(!!data.activated_at && data.is_active !== false);
      } else {
        // No profile found - not activated
        setIsActivated(false);
      }
    } catch (err) {
      console.error('Error:', err);
      setIsActivated(false);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    checkActivation();
  }, [checkActivation]);

  return { isActivated, loading, refetch: checkActivation };
}