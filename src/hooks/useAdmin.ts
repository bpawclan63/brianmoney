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
  is_active: boolean | null;
  is_admin?: boolean;
}

interface UserTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
  note: string | null;
  payment_method: string;
}

interface AdminStats {
  totalUsers: number;
  totalTransactions: number;
  totalIncome: number;
  totalExpense: number;
  totalBudgets: number;
  totalGoals: number;
  activeUsers: number;
  adminCount: number;
}

interface ActivityLog {
  id: string;
  admin_id: string;
  action: string;
  target_user_id: string | null;
  details: string | null;
  created_at: string;
  admin_email?: string;
  target_email?: string;
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

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTransactions: 0,
    totalIncome: 0,
    totalExpense: 0,
    totalBudgets: 0,
    totalGoals: 0,
    activeUsers: 0,
    adminCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);

      // Fetch all stats in parallel
      const [
        profilesRes,
        transactionsRes,
        budgetsRes,
        goalsRes,
        rolesRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id, is_active'),
        supabase.from('transactions').select('amount, type'),
        supabase.from('budgets').select('id'),
        supabase.from('financial_goals').select('id'),
        supabase.from('user_roles').select('role').eq('role', 'admin'),
      ]);

      const profiles = profilesRes.data || [];
      const transactions = transactionsRes.data || [];
      const budgets = budgetsRes.data || [];
      const goals = goalsRes.data || [];
      const adminRoles = rolesRes.data || [];

      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      setStats({
        totalUsers: profiles.length,
        totalTransactions: transactions.length,
        totalIncome,
        totalExpense,
        totalBudgets: budgets.length,
        totalGoals: goals.length,
        activeUsers: profiles.filter(p => p.is_active !== false).length,
        adminCount: adminRoles.length,
      });

      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

async function logAdminActivity(adminId: string, action: string, targetUserId: string | null, details?: string) {
  await supabase.from('admin_activity_logs').insert({
    admin_id: adminId,
    action,
    target_user_id: targetUserId,
    details,
  });
}

export function useAdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    
    // Fetch profiles and roles in parallel
    const [profilesRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('user_roles').select('user_id, role').eq('role', 'admin'),
    ]);

    if (profilesRes.error) {
      console.error('Error fetching users:', profilesRes.error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } else {
      const adminUserIds = new Set((rolesRes.data || []).map(r => r.user_id));
      const usersWithRole = (profilesRes.data || []).map(user => ({
        ...user,
        is_admin: adminUserIds.has(user.id),
      }));
      setUsers(usersWithRole);
    }
    setLoading(false);
  };

  const deleteUser = async (userId: string, userEmail: string) => {
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

    if (user) {
      await logAdminActivity(user.id, 'delete_user', userId, `Deleted user: ${userEmail}`);
    }

    toast({
      title: 'Success',
      description: 'User deleted successfully',
    });
    fetchUsers();
    return true;
  };

  const toggleUserActive = async (userId: string, isActive: boolean, userEmail: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId);

    if (error) {
      console.error('Error updating user status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
      return false;
    }

    if (user) {
      await logAdminActivity(
        user.id, 
        isActive ? 'activate_user' : 'deactivate_user', 
        userId, 
        `${isActive ? 'Activated' : 'Deactivated'} user: ${userEmail}`
      );
    }

    toast({
      title: 'Success',
      description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
    fetchUsers();
    return true;
  };

  const toggleAdminRole = async (userId: string, makeAdmin: boolean, userEmail: string) => {
    if (makeAdmin) {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: 'admin' });

      if (error) {
        console.error('Error promoting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to promote user to admin',
          variant: 'destructive',
        });
        return false;
      }
    } else {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', 'admin');

      if (error) {
        console.error('Error demoting user:', error);
        toast({
          title: 'Error',
          description: 'Failed to remove admin role',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (user) {
      await logAdminActivity(
        user.id, 
        makeAdmin ? 'promote_admin' : 'demote_admin', 
        userId, 
        `${makeAdmin ? 'Promoted to admin' : 'Removed admin role'}: ${userEmail}`
      );
    }

    toast({
      title: 'Success',
      description: makeAdmin ? 'User promoted to admin' : 'Admin role removed',
    });
    fetchUsers();
    return true;
  };

  const resetPassword = async (userId: string, email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?type=recovery`,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    if (user) {
      await logAdminActivity(user.id, 'reset_password', userId, `Sent password reset to: ${email}`);
    }

    toast({
      title: 'Success',
      description: `Password reset email sent to ${email}`,
    });
    return true;
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, refetch: fetchUsers, deleteUser, toggleUserActive, toggleAdminRole, resetPassword };
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

export function useAdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    
    // Fetch logs and profiles in parallel
    const [logsRes, profilesRes] = await Promise.all([
      supabase
        .from('admin_activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('profiles').select('id, email'),
    ]);

    if (logsRes.error) {
      console.error('Error fetching logs:', logsRes.error);
    } else {
      const profileMap = new Map((profilesRes.data || []).map(p => [p.id, p.email]));
      const logsWithEmails = (logsRes.data || []).map(log => ({
        ...log,
        admin_email: profileMap.get(log.admin_id) || 'Unknown',
        target_email: log.target_user_id ? profileMap.get(log.target_user_id) : null,
      }));
      setLogs(logsWithEmails);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, refetch: fetchLogs };
}
