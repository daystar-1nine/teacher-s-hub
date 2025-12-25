import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'teacher' | 'student';
export type AppRole = 'admin' | 'teacher' | 'student';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  school_code: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleData {
  id: string;
  user_id: string;
  role: AppRole;
  school_code: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  appRole: AppRole | null;
  userRoleData: UserRoleData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role: AppRole, schoolCode: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoleData, setUserRoleData] = useState<UserRoleData | null>(null);
  const [appRole, setAppRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as Profile | null;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data as UserRoleData | null;
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const [profileData, roleData] = await Promise.all([
        fetchProfile(user.id),
        fetchUserRole(user.id)
      ]);
      setProfile(profileData);
      setUserRoleData(roleData);
      setAppRole(roleData?.role || null);
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
            const [profileData, roleData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRole(session.user.id)
            ]);
            setProfile(profileData);
            setUserRoleData(roleData);
            setAppRole(roleData?.role || null);
          }, 0);
        } else {
          setProfile(null);
          setUserRoleData(null);
          setAppRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const [profileData, roleData] = await Promise.all([
          fetchProfile(session.user.id),
          fetchUserRole(session.user.id)
        ]);
        setProfile(profileData);
        setUserRoleData(roleData);
        setAppRole(roleData?.role || null);
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

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    name: string, 
    role: AppRole, 
    schoolCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate school code
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('code')
        .eq('code', schoolCode.toUpperCase())
        .maybeSingle();

      if (schoolError || !school) {
        return { success: false, error: 'Invalid school code. Please contact your school administrator for the correct code.' };
      }

      const redirectUrl = `${window.location.origin}/`;

      // Map app_role to user_role for profiles table
      const profileRole: UserRole = role === 'admin' ? 'teacher' : role === 'teacher' ? 'teacher' : 'student';

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role: role, // This goes to user_roles table via trigger
            school_code: schoolCode.toUpperCase(),
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          return { success: false, error: 'An account with this email already exists' };
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRoleData(null);
    setAppRole(null);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Update password error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      appRole,
      userRoleData,
      isLoading,
      isAuthenticated: !!user,
      isAdmin: appRole === 'admin',
      isTeacher: appRole === 'teacher',
      isStudent: appRole === 'student',
      login,
      signup,
      logout,
      refreshProfile,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}