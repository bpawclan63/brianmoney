import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  currency: string | null;
  created_at: string | null;
}

interface UserTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note: string | null;
  payment_method: string;
}

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } else {
        setIsAdmin(data === true);
      }
      setLoading(false);
    };

    checkAdminRole();
  }, [user]);

  return { isAdmin, loading };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const deleteUser = async (userId: string) => {
    // Delete from profiles (cascade will handle user_roles)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Success',
      description: 'User deleted successfully',
    });
    fetchUsers();
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, refetch: fetchUsers, deleteUser };
}

export function useUserTransactions(userId: string | null) {
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userId) {
        setTransactions([]);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select('id, amount, type, date, note, payment_method')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching transactions:', error);
      } else {
        setTransactions(data || []);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [userId]);

  return { transactions, loading };
}
