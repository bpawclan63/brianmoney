import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, User, Wallet, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { user, signIn, signUp, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Check for recovery mode from URL
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'recovery') {
      setIsRecoveryMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    // Don't redirect if in recovery mode (user needs to set new password)
    if (user && !isRecoveryMode) {
      navigate('/', { replace: true });
    }
  }, [user, navigate, isRecoveryMode]);

  const validateForm = () => {
    try {
      if (isRecoveryMode) {
        passwordSchema.parse({ password, confirmPassword });
        setErrors({});
        return true;
      }
      if (isForgotPassword) {
        z.string().email('Invalid email address').parse(email);
        setErrors({});
        return true;
      }
      authSchema.parse({
        email,
        password,
        ...(isLogin ? {} : { name }),
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isRecoveryMode) {
        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: 'Failed to update password',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password updated!',
            description: 'Your password has been successfully changed.',
          });
          setIsRecoveryMode(false);
          navigate('/', { replace: true });
        }
      } else if (isForgotPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Failed to send reset email',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Reset email sent!',
            description: 'Check your inbox for the password reset link.',
          });
          setIsForgotPassword(false);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'Successfully signed in.',
          });
        }
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          if (error.message.includes('User already registered')) {
            toast({
              title: 'Sign up failed',
              description: 'An account with this email already exists. Please sign in instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Sign up failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account created!',
            description: 'You can now start using FinanceFlow.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getHeaderText = () => {
    if (isRecoveryMode) return 'Set your new password.';
    if (isForgotPassword) return 'Enter your email to reset your password.';
    if (isLogin) return 'Welcome back! Sign in to continue.';
    return 'Create your account to get started.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center glow-cyan mb-4">
            <Wallet className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">FinanceFlow</h1>
          <p className="text-muted-foreground mt-2">{getHeaderText()}</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8">
          {/* Toggle - Only show for login/signup */}
          {!isForgotPassword && !isRecoveryMode && (
            <div className="flex gap-2 p-1 bg-muted/50 rounded-lg mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                  isLogin
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={cn(
                  'flex-1 py-2.5 text-sm font-medium rounded-md transition-all',
                  !isLogin
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Sign Up
              </button>
            </div>
          )}

          {isForgotPassword && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Reset Password</h2>
              <p className="text-sm text-muted-foreground mt-1">We'll send you a link to reset your password.</p>
            </div>
          )}

          {isRecoveryMode && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">New Password</h2>
              <p className="text-sm text-muted-foreground mt-1">Enter your new password below.</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name (signup only) */}
            {!isLogin && !isForgotPassword && !isRecoveryMode && (
              <div>
                <Label className="text-muted-foreground">Full Name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={cn('pl-10', errors.name && 'border-destructive')}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name}</p>
                )}
              </div>
            )}

            {/* Email - Not shown in recovery mode */}
            {!isRecoveryMode && (
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn('pl-10', errors.email && 'border-destructive')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {/* Password - Show for login, signup, and recovery */}
            {(!isForgotPassword || isRecoveryMode) && (
              <div>
                <Label className="text-muted-foreground">
                  {isRecoveryMode ? 'New Password' : 'Password'}
                </Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={cn('pl-10 pr-10', errors.password && 'border-destructive')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {/* Confirm Password - Only for recovery mode */}
            {isRecoveryMode && (
              <div>
                <Label className="text-muted-foreground">Confirm Password</Label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={cn('pl-10 pr-10', errors.confirmPassword && 'border-destructive')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Forgot Password Link */}
            {isLogin && !isForgotPassword && !isRecoveryMode && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" variant="neon" className="w-full" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isRecoveryMode 
                ? 'Update Password' 
                : isForgotPassword 
                  ? 'Send Reset Link' 
                  : isLogin 
                    ? 'Sign In' 
                    : 'Create Account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {isRecoveryMode ? (
            <button
              onClick={() => {
                setIsRecoveryMode(false);
                navigate('/auth', { replace: true });
              }}
              className="text-primary hover:underline"
            >
              Back to sign in
            </button>
          ) : isForgotPassword ? (
            <button
              onClick={() => setIsForgotPassword(false)}
              className="text-primary hover:underline"
            >
              Back to sign in
            </button>
          ) : (
            <>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}