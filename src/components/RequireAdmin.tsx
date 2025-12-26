import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldX } from 'lucide-react';

interface RequireAdminProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

interface AdminCheck {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
}

export function RequireAdmin({ children, requireSuperAdmin = false }: RequireAdminProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [adminCheck, setAdminCheck] = useState<AdminCheck | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setIsAuthenticated(false);
          setAdminCheck(null);
          setIsLoading(false);
          return;
        }

        setIsAuthenticated(true);

        // Use RPC to check admin status (security definer function)
        const { data, error } = await supabase.rpc('get_admin_profile');

        if (error || !data || data.length === 0) {
          setAdminCheck({ isAdmin: false, isSuperAdmin: false, isActive: false });
          setIsLoading(false);
          return;
        }

        const profile = data[0];
        setAdminCheck({
          isAdmin: true,
          isSuperAdmin: profile.is_super_admin,
          isActive: profile.is_active,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setAdminCheck({ isAdmin: false, isSuperAdmin: false, isActive: false });
        setIsLoading(false);
      }
    };

    checkAdminStatus();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setAdminCheck(null);
      } else if (event === 'SIGNED_IN') {
        checkAdminStatus();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Authenticated but not an admin
  if (!adminCheck?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have administrator privileges. This area is restricted to authorized administrators only.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact a super administrator.
          </p>
          <a 
            href="/admin/login" 
            className="mt-4 text-primary hover:underline"
            onClick={async (e) => {
              e.preventDefault();
              await supabase.auth.signOut();
              window.location.href = '/admin/login';
            }}
          >
            Sign in with a different account
          </a>
        </div>
      </div>
    );
  }

  // Admin account is deactivated
  if (!adminCheck.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-warning" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Account Deactivated</h1>
          <p className="text-muted-foreground">
            Your administrator account has been deactivated. Please contact a super administrator to restore access.
          </p>
        </div>
      </div>
    );
  }

  // Requires super admin but user is not
  if (requireSuperAdmin && !adminCheck.isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Super Admin Required</h1>
          <p className="text-muted-foreground">
            This action requires super administrator privileges.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
