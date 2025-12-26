import { useState, useEffect, useCallback, useMemo, memo, forwardRef } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

// Memoized loading skeleton for instant feedback
const AuthLoadingSkeleton = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
));
AuthLoadingSkeleton.displayName = 'AuthLoadingSkeleton';

// Memoized role loading state
const RoleLoadingSkeleton = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-muted-foreground">Setting up your account...</p>
    </div>
  </div>
));
RoleLoadingSkeleton.displayName = 'RoleLoadingSkeleton';

// Memoized background component to prevent re-renders
const AuthBackground = memo(() => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
    <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
  </div>
));
AuthBackground.displayName = 'AuthBackground';

// Memoized logo component
const AuthLogo = memo(({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center mb-8 animate-slide-up">
    <div className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center mb-4">
      <Icon className="w-9 h-9 text-primary-foreground" />
    </div>
    <h1 className="text-3xl font-bold text-foreground">{title}</h1>
    <p className="text-muted-foreground mt-1">{subtitle}</p>
  </div>
));
AuthLogo.displayName = 'AuthLogo';

// Password input with toggle - properly using forwardRef
interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showPassword: boolean;
  onToggleShow: () => void;
}

const PasswordInput = memo(forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ id, value, onChange, placeholder = '••••••••', disabled = false, showPassword, onToggleShow }, ref) => (
    <div className="relative">
      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        ref={ref}
        id={id}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        className="pl-10 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={onToggleShow}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  )
));
PasswordInput.displayName = 'PasswordInput';

const Auth = () => {
  const { login, signup, resetPassword, updatePassword, isAuthenticated, isLoading: authLoading, appRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Consolidated form state to reduce re-renders
  const [formState, setFormState] = useState({
    showPassword: false,
    isSubmitting: false,
    showForgotPassword: false,
    showResetPassword: false,
    // Login
    loginEmail: '',
    loginPassword: '',
    // Signup
    signupEmail: '',
    signupPassword: '',
    signupName: '',
    signupRole: 'student' as AppRole,
    signupSchoolCode: '',
    // Reset
    resetEmail: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Memoized state updater
  const updateFormState = useCallback((updates: Partial<typeof formState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  }, []);

  // Check if this is a password reset callback
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      updateFormState({ showResetPassword: true });
    }
  }, [searchParams, updateFormState]);

  // Early return for loading state
  if (authLoading) {
    return <AuthLoadingSkeleton />;
  }

  // Redirect based on role after authentication
  if (isAuthenticated && appRole) {
    if (appRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    const redirectPath = appRole === 'teacher' ? '/teacher-dashboard' : '/student-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (isAuthenticated && !appRole) {
    return <RoleLoadingSkeleton />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.loginEmail || !formState.loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    updateFormState({ isSubmitting: true });
    const result = await login(formState.loginEmail, formState.loginPassword);
    updateFormState({ isSubmitting: false });
    
    if (result.success) {
      toast.success('Welcome back!');
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { signupEmail, signupPassword, signupName, signupSchoolCode, signupRole } = formState;
    
    if (!signupEmail || !signupPassword || !signupName || !signupSchoolCode) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    updateFormState({ isSubmitting: true });
    const result = await signup(signupEmail, signupPassword, signupName, signupRole, signupSchoolCode);
    updateFormState({ isSubmitting: false });
    
    if (result.success) {
      toast.success('Account created successfully!');
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.resetEmail) {
      toast.error('Please enter your email');
      return;
    }

    updateFormState({ isSubmitting: true });
    const result = await resetPassword(formState.resetEmail);
    updateFormState({ isSubmitting: false });
    
    if (result.success) {
      toast.success('Password reset email sent! Check your inbox.');
      updateFormState({ showForgotPassword: false, resetEmail: '' });
    } else {
      toast.error(result.error || 'Failed to send reset email');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { newPassword, confirmPassword } = formState;
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    updateFormState({ isSubmitting: true });
    const result = await updatePassword(newPassword);
    updateFormState({ isSubmitting: false });
    
    if (result.success) {
      toast.success('Password updated successfully!');
      updateFormState({ showResetPassword: false });
      navigate('/auth');
    } else {
      toast.error(result.error || 'Failed to update password');
    }
  };

  const togglePasswordVisibility = () => {
    updateFormState({ showPassword: !formState.showPassword });
  };

  // Show reset password form if coming from email link
  if (formState.showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <AuthBackground />
        <div className="w-full max-w-md relative z-10">
          <AuthLogo icon={KeyRound} title="Set New Password" subtitle="Enter your new password below" />
          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="pt-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <PasswordInput
                    id="new-password"
                    value={formState.newPassword}
                    onChange={(val) => updateFormState({ newPassword: val })}
                    placeholder="Min 6 characters"
                    disabled={formState.isSubmitting}
                    showPassword={formState.showPassword}
                    onToggleShow={togglePasswordVisibility}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={formState.showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formState.confirmPassword}
                      onChange={(e) => updateFormState({ confirmPassword: e.target.value })}
                      disabled={formState.isSubmitting}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="gradient" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show forgot password form
  if (formState.showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <AuthBackground />
        <div className="w-full max-w-md relative z-10">
          <AuthLogo icon={Mail} title="Reset Password" subtitle="We'll send you a reset link" />
          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="pt-6">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@school.edu"
                      className="pl-10"
                      value={formState.resetEmail}
                      onChange={(e) => updateFormState({ resetEmail: e.target.value })}
                      disabled={formState.isSubmitting}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="gradient" disabled={formState.isSubmitting}>
                  {formState.isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => updateFormState({ showForgotPassword: false })}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <AuthBackground />
      <div className="w-full max-w-md relative z-10">
        <AuthLogo icon={GraduationCap} title="Teacher's Desk" subtitle="Your Complete Education Platform" />

        <Card variant="elevated" className="animate-scale-in">
          <Tabs defaultValue="login" className="w-full">
            <CardHeader className="pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="mt-0 space-y-4">
                <CardDescription className="text-center mb-4">
                  Welcome back! Sign in to continue.
                </CardDescription>
                
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@school.edu"
                        className="pl-10"
                        value={formState.loginEmail}
                        onChange={(e) => updateFormState({ loginEmail: e.target.value })}
                        disabled={formState.isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => updateFormState({ showForgotPassword: true })}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordInput
                      id="login-password"
                      value={formState.loginPassword}
                      onChange={(val) => updateFormState({ loginPassword: val })}
                      disabled={formState.isSubmitting}
                      showPassword={formState.showPassword}
                      onToggleShow={togglePasswordVisibility}
                    />
                  </div>

                  <Button type="submit" className="w-full" variant="gradient" disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0 space-y-4">
                <CardDescription className="text-center mb-4">
                  Create your account to get started.
                </CardDescription>
                
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        className="pl-10"
                        value={formState.signupName}
                        onChange={(e) => updateFormState({ signupName: e.target.value })}
                        disabled={formState.isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@school.edu"
                        className="pl-10"
                        value={formState.signupEmail}
                        onChange={(e) => updateFormState({ signupEmail: e.target.value })}
                        disabled={formState.isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <PasswordInput
                      id="signup-password"
                      value={formState.signupPassword}
                      onChange={(val) => updateFormState({ signupPassword: val })}
                      placeholder="Min 6 characters"
                      disabled={formState.isSubmitting}
                      showPassword={formState.showPassword}
                      onToggleShow={togglePasswordVisibility}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-school">School Code</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-school"
                        type="text"
                        placeholder="e.g., DEMO2024"
                        className="pl-10 uppercase"
                        value={formState.signupSchoolCode}
                        onChange={(e) => updateFormState({ signupSchoolCode: e.target.value.toUpperCase() })}
                        disabled={formState.isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <RadioGroup 
                      value={formState.signupRole} 
                      onValueChange={(val) => updateFormState({ signupRole: val as AppRole })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student" />
                        <Label htmlFor="student" className="font-normal cursor-pointer">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher" />
                        <Label htmlFor="teacher" className="font-normal cursor-pointer">Teacher</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full" variant="gradient" disabled={formState.isSubmitting}>
                    {formState.isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default Auth;
