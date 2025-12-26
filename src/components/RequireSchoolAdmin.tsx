import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ShieldX } from 'lucide-react';

interface RequireSchoolAdminProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

interface AdminCheck {
  isSchoolAdmin: boolean;
  isSuperAdmin: boolean;
  schoolCode: string | null;
  canManageTeachers: boolean;
}

export function RequireSchoolAdmin({ children, requireSuperAdmin = false }: RequireSchoolAdminProps) {
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

        // Use RPC to check school admin status
        const { data, error } = await supabase.rpc('get_school_admin_profile', {
          _user_id: session.user.id
        });

        if (error || !data || data.length === 0) {
          // Fallback to checking if they're in admins table or have admin role
          const { data: adminData } = await supabase.rpc('get_admin_profile');
          
          if (adminData && adminData.length > 0) {
            const admin = adminData[0];
            setAdminCheck({
              isSchoolAdmin: true,
              isSuperAdmin: admin.is_super_admin,
              schoolCode: admin.school_code,
              canManageTeachers: true,
            });
          } else {
            setAdminCheck({
              isSchoolAdmin: false,
              isSuperAdmin: false,
              schoolCode: null,
              canManageTeachers: false,
            });
          }
          setIsLoading(false);
          return;
        }

        const profile = data[0];
        setAdminCheck({
          isSchoolAdmin: profile.can_manage_teachers || profile.admin_role === 'school_admin' || profile.admin_role === 'super_admin',
          isSuperAdmin: profile.is_super_admin,
          schoolCode: profile.school_code,
          canManageTeachers: profile.can_manage_teachers,
        });
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking school admin status:', error);
        setAdminCheck({
          isSchoolAdmin: false,
          isSuperAdmin: false,
          schoolCode: null,
          canManageTeachers: false,
        });
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
          <p className="text-muted-foreground">Verifying school admin access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated at all
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // Authenticated but not a school admin
  if (!adminCheck?.isSchoolAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">
            You do not have school admin privileges. This area is restricted to school administrators only.
          </p>
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please contact your school administrator.
          </p>
          <a 
            href="/teacher-dashboard" 
            className="mt-4 text-primary hover:underline"
          >
            Go to Teacher Dashboard
          </a>
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
