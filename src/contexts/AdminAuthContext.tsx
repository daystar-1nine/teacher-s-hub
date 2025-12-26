import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  school_code: string | null;
  is_super_admin: boolean;
  is_active: boolean;
}

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminProfile: AdminProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAdminProfile: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminProfile = async (): Promise<AdminProfile | null> => {
    try {
      // Use the security definer function to get admin profile
      const { data, error } = await supabase.rpc('get_admin_profile');

      if (error) {
        console.error('Error fetching admin profile:', error);
        return null;
      }

      if (!data || data.length === 0) {
        return null;
      }

      // RPC returns array, get first row
      const profile = data[0];
      return {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        school_code: profile.school_code,
        is_super_admin: profile.is_super_admin,
        is_active: profile.is_active,
      };
    } catch (error) {
      console.error('Error in fetchAdminProfile:', error);
      return null;
    }
  };

  const refreshAdminProfile = async () => {
    if (user) {
      const profile = await fetchAdminProfile();
      setAdminProfile(profile);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer data fetch with setTimeout to avoid deadlock
        if (session?.user) {
          setTimeout(async () => {
            const profile = await fetchAdminProfile();
            setAdminProfile(profile);
          }, 0);
        } else {
          setAdminProfile(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const profile = await fetchAdminProfile();
        setAdminProfile(profile);
      }
      
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Verify this user is in the admins table
      const profile = await fetchAdminProfile();
      
      if (!profile) {
        // Not an admin - sign them out immediately
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'Access denied. This login is for administrators only.' 
        };
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        return { 
          success: false, 
          error: 'Your admin account has been deactivated. Please contact a super administrator.' 
        };
      }

      setAdminProfile(profile);
      return { success: true };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAdminProfile(null);
  };

  return (
    <AdminAuthContext.Provider value={{
      user,
      session,
      adminProfile,
      isLoading,
      isAuthenticated: !!user && !!adminProfile,
      isAdmin: !!adminProfile,
      isSuperAdmin: adminProfile?.is_super_admin ?? false,
      login,
      logout,
      refreshAdminProfile,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
