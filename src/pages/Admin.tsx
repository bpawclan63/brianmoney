import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  Users, 
  Trash2, 
  Eye, 
  KeyRound, 
  Loader2, 
  Shield,
  ArrowLeft,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  Wallet,
  Target,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin, useAdminUsers, useUserTransactions, useAdminStats } from '@/hooks/useAdmin';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function Admin() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { users, loading: usersLoading, deleteUser, toggleUserActive, toggleAdminRole } = useAdminUsers();
  const { stats, loading: statsLoading } = useAdminStats();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showTransactions, setShowTransactions] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState<string | null>(null);
  const [togglingAdmin, setTogglingAdmin] = useState<string | null>(null);

  const { transactions, loading: transactionsLoading } = useUserTransactions(
    showTransactions ? selectedUserId : null
  );

  if (adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleResetPassword = async (email: string, userId: string) => {
    setResettingPassword(userId);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?type=recovery`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: `Password reset email sent to ${email}`,
        });
      }
    } finally {
      setResettingPassword(null);
    }
  };

  const handleViewTransactions = (userId: string) => {
    setSelectedUserId(userId);
    setShowTransactions(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteUserId) {
      await deleteUser(deleteUserId);
      setDeleteUserId(null);
    }
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean | null) => {
    setTogglingActive(userId);
    await toggleUserActive(userId, currentStatus === false);
    setTogglingActive(null);
  };

  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    setTogglingAdmin(userId);
    await toggleAdminRole(userId, !isCurrentlyAdmin);
    setTogglingAdmin(null);
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Active Users', value: stats.activeUsers, icon: Activity, color: 'text-green-500' },
    { label: 'Admins', value: stats.adminCount, icon: ShieldCheck, color: 'text-purple-500' },
    { label: 'Total Transactions', value: stats.totalTransactions, icon: Wallet, color: 'text-blue-500' },
    { label: 'Total Income', value: `Rp ${stats.totalIncome.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Expense', value: `Rp ${stats.totalExpense.toLocaleString()}`, icon: TrendingDown, color: 'text-red-500' },
    { label: 'Total Budgets', value: stats.totalBudgets, icon: Wallet, color: 'text-cyan-500' },
    { label: 'Total Goals', value: stats.totalGoals, icon: Target, color: 'text-amber-500' },
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-pink to-neon-purple flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-muted-foreground text-sm">Manage user accounts</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="glass-card animate-pulse">
                <CardContent className="pt-6">
                  <div className="h-16 bg-muted/20 rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            statCards.map((stat, i) => (
              <Card key={i} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-lg bg-muted/20 flex items-center justify-center", stat.color)}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Users Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No users found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((userItem) => (
                      <TableRow key={userItem.id} className={cn(userItem.is_active === false && 'opacity-50')}>
                        <TableCell className="font-medium">
                          {userItem.name || 'No name'}
                          {userItem.id === user?.id && (
                            <span className="ml-2 text-xs text-primary">(You)</span>
                          )}
                        </TableCell>
                        <TableCell>{userItem.email}</TableCell>
                        <TableCell>
                          <Badge variant={userItem.is_active !== false ? 'default' : 'secondary'}>
                            {userItem.is_active !== false ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={userItem.is_admin ? 'destructive' : 'outline'}>
                            {userItem.is_admin ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userItem.created_at 
                            ? format(new Date(userItem.created_at), 'dd MMM yyyy')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewTransactions(userItem.id)}
                              title="View Transactions"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleResetPassword(userItem.email, userItem.id)}
                              disabled={resettingPassword === userItem.id}
                              title="Reset Password"
                            >
                              {resettingPassword === userItem.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <KeyRound className="w-4 h-4" />
                              )}
                            </Button>
                            {userItem.id !== user?.id && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleActive(userItem.id, userItem.is_active)}
                                  disabled={togglingActive === userItem.id}
                                  title={userItem.is_active !== false ? 'Deactivate User' : 'Activate User'}
                                >
                                  {togglingActive === userItem.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : userItem.is_active !== false ? (
                                    <UserX className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleAdmin(userItem.id, !!userItem.is_admin)}
                                  disabled={togglingAdmin === userItem.id}
                                  title={userItem.is_admin ? 'Remove Admin' : 'Promote to Admin'}
                                >
                                  {togglingAdmin === userItem.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : userItem.is_admin ? (
                                    <ShieldOff className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteUserId(userItem.id)}
                                  className="text-destructive hover:text-destructive"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Dialog */}
      <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Transactions - {selectedUser?.name || selectedUser?.email}
            </DialogTitle>
            <DialogDescription>
              View all transactions for this user
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No transactions found
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {format(new Date(tx.date), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs font-medium',
                          tx.type === 'income' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-red-500/20 text-red-500'
                        )}>
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className={cn(
                        'font-medium',
                        tx.type === 'income' ? 'text-green-500' : 'text-red-500'
                      )}>
                        {tx.type === 'income' ? '+' : '-'}
                        {tx.amount.toLocaleString()}
                      </TableCell>
                      <TableCell className="capitalize">{tx.payment_method}</TableCell>
                      <TableCell className="text-muted-foreground truncate max-w-[150px]">
                        {tx.note || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              account and all associated data including transactions, budgets, and todos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
