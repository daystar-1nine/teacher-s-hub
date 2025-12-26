import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Eye, EyeOff, Loader2, AlertTriangle } from 'lucide-react';

export default function AdminAuth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Check if already authenticated as admin
  useEffect(() => {
    const checkExistingSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user is an admin
        const { data, error } = await supabase.rpc('get_admin_profile');
        
        if (!error && data && data.length > 0 && data[0].is_active) {
          // Already authenticated as admin, redirect to dashboard
          navigate('/admin-dashboard', { replace: true });
          return;
        }
      }
      
      setIsLoading(false);
    };

    checkExistingSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast.error(authError.message);
        setIsSubmitting(false);
        return;
      }

      // Verify this user is in the admins table using RPC
      const { data: adminData, error: adminError } = await supabase.rpc('get_admin_profile');

      if (adminError || !adminData || adminData.length === 0) {
        // Not an admin - sign them out immediately
        await supabase.auth.signOut();
        toast.error('Access denied. This login is for administrators only.');
        setIsSubmitting(false);
        return;
      }

      const adminProfile = adminData[0];

      if (!adminProfile.is_active) {
        await supabase.auth.signOut();
        toast.error('Your admin account has been deactivated.');
        setIsSubmitting(false);
        return;
      }

      toast.success(`Welcome back, ${adminProfile.name}!`);
      navigate('/admin-dashboard', { replace: true });
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('An unexpected error occurred');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 animate-pulse flex items-center justify-center">
            <Shield className="w-6 h-6 text-destructive" />
          </div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration - different from regular auth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-destructive/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-destructive/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-destructive/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Admin Logo - Distinct from regular login */}
        <div className="flex flex-col items-center mb-8 animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-destructive shadow-lg flex items-center justify-center mb-4">
            <Shield className="w-9 h-9 text-destructive-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Admin Portal</h1>
          <p className="text-muted-foreground mt-1">Teacher's Desk Administration</p>
        </div>

        {/* Security Notice */}
        <div className="mb-6 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-warning">Restricted Access</p>
            <p className="text-muted-foreground mt-1">
              This portal is for authorized administrators only. Unauthorized access attempts are logged and monitored.
            </p>
          </div>
        </div>

        <Card variant="elevated" className="animate-scale-in border-destructive/20">
          <CardHeader className="text-center">
            <CardTitle>Administrator Sign In</CardTitle>
            <CardDescription>
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@school.edu"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="admin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
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

              <Button 
                type="submit" 
                className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Sign In as Admin
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Not an administrator?{' '}
                <a href="/auth" className="text-primary hover:underline">
                  Go to regular login
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Admin accounts are created by super administrators only.
          <br />
          Contact your school's super admin for access.
        </p>
      </div>
    </div>
  );
}
