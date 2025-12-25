import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { GraduationCap, Mail, Lock, User, Building2, Eye, EyeOff, Loader2, ArrowLeft, KeyRound } from 'lucide-react';

export default function Auth() {
  const { login, signup, resetPassword, updatePassword, isAuthenticated, isLoading: authLoading, appRole } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupRole, setSignupRole] = useState<AppRole>('student');
  const [signupSchoolCode, setSignupSchoolCode] = useState('');

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if this is a password reset callback
  useEffect(() => {
    const mode = searchParams.get('mode');
    if (mode === 'reset') {
      setShowResetPassword(true);
    }
  }, [searchParams]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full gradient-primary animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect based on role after authentication
  if (isAuthenticated && appRole) {
    const redirectPath = 
      appRole === 'admin' ? '/admin-dashboard' :
      appRole === 'teacher' ? '/teacher-dashboard' :
      '/student-dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (isAuthenticated && !appRole) {
    // Still loading role, wait
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    const result = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Welcome back!');
      // Navigation will happen automatically via the isAuthenticated check
    } else {
      toast.error(result.error || 'Login failed');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupName || !signupSchoolCode) {
      toast.error('Please fill in all fields');
      return;
    }

    if (signupPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    const result = await signup(signupEmail, signupPassword, signupName, signupRole, signupSchoolCode);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Account created successfully!');
      // Navigation will happen automatically via the isAuthenticated check
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(resetEmail);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } else {
      toast.error(result.error || 'Failed to send reset email');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsSubmitting(true);
    const result = await updatePassword(newPassword);
    setIsSubmitting(false);
    
    if (result.success) {
      toast.success('Password updated successfully!');
      setShowResetPassword(false);
      navigate('/auth');
    } else {
      toast.error(result.error || 'Failed to update password');
    }
  };

  // Show reset password form if coming from email link
  if (showResetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-8 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center mb-4">
              <KeyRound className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Set New Password</h1>
            <p className="text-muted-foreground mt-1">Enter your new password below</p>
          </div>

          <Card variant="elevated" className="animate-scale-in">
            <CardContent className="pt-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      className="pl-10 pr-10"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? (
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
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col items-center mb-8 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center mb-4">
              <Mail className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Reset Password</h1>
            <p className="text-muted-foreground mt-1">We'll send you a reset link</p>
          </div>

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
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" variant="gradient" disabled={isSubmitting}>
                  {isSubmitting ? (
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
                  onClick={() => setShowForgotPassword(false)}
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
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl gradient-primary shadow-glow flex items-center justify-center mb-4">
            <GraduationCap className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Teacher's Desk</h1>
          <p className="text-muted-foreground mt-1">Your Complete Education Platform</p>
        </div>

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
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
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
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={isSubmitting}
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
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        className="pl-10 pr-10"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-school">School Code</Label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-school"
                        type="text"
                        placeholder="Enter your school code"
                        className="pl-10 uppercase"
                        value={signupSchoolCode}
                        onChange={(e) => setSignupSchoolCode(e.target.value.toUpperCase())}
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Ask your school administrator for the school code
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <RadioGroup
                      value={signupRole}
                      onValueChange={(value) => setSignupRole(value as AppRole)}
                      className="flex gap-4"
                      disabled={isSubmitting}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="role-student" />
                        <Label htmlFor="role-student" className="cursor-pointer">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="role-teacher" />
                        <Label htmlFor="role-teacher" className="cursor-pointer">Teacher</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground">
                      Note: Admin accounts are created by existing admins only.
                    </p>
                  </div>

                  <Button type="submit" className="w-full" variant="gradient" disabled={isSubmitting}>
                    {isSubmitting ? (
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
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}