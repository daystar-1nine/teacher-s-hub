import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, ReactNode } from 'react';
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

// Session cache for faster initial load
const SESSION_CACHE_KEY = 'auth_session_cache';

function getCachedSession(): { user: User | null; session: Session | null } | null {
  try {
    const cached = sessionStorage.getItem(SESSION_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is still valid (less than 5 minutes old)
      if (parsed.timestamp && Date.now() - parsed.timestamp < 5 * 60 * 1000) {
        return { user: parsed.user, session: parsed.session };
      }
    }
  } catch {
    // Ignore cache errors
  }
  return null;
}

function setCachedSession(user: User | null, session: Session | null) {
  try {
    sessionStorage.setItem(SESSION_CACHE_KEY, JSON.stringify({
      user,
      session,
      timestamp: Date.now(),
    }));
  } catch {
    // Ignore cache errors
  }
}

function clearCachedSession() {
  try {
    sessionStorage.removeItem(SESSION_CACHE_KEY);
  } catch {
    // Ignore cache errors
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use cached session for instant UI
  const cachedSession = useMemo(() => getCachedSession(), []);
  
  const [user, setUser] = useState<User | null>(cachedSession?.user ?? null);
  const [session, setSession] = useState<Session | null>(cachedSession?.session ?? null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRoleData, setUserRoleData] = useState<UserRoleData | null>(null);
  const [appRole, setAppRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(!cachedSession); // Skip loading if cached
  
  // Track if we've already fetched user data to prevent duplicates
  const fetchedUserIdRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  // Memoized fetch functions to prevent re-creation
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
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
  }, []);

  const fetchUserRole = useCallback(async (userId: string): Promise<UserRoleData | null> => {
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
  }, []);

  // Fetch user data only once per user
  const fetchUserData = useCallback(async (userId: string, force = false) => {
    // Prevent duplicate fetches
    if (!force && (fetchedUserIdRef.current === userId || isFetchingRef.current)) {
      return;
    }
    
    isFetchingRef.current = true;
    
    try {
      // Parallel fetch for performance
      const [profileData, roleData] = await Promise.all([
        fetchProfile(userId),
        fetchUserRole(userId)
      ]);
      
      setProfile(profileData);
      setUserRoleData(roleData);
      setAppRole(roleData?.role || null);
      fetchedUserIdRef.current = userId;
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchProfile, fetchUserRole]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchUserData(user.id, true);
    }
  }, [user, fetchUserData]);

  // Auth state initialization - optimized to prevent double fetches
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        // Update session immediately (sync)
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setCachedSession(newSession?.user ?? null, newSession);
        
        if (newSession?.user) {
          // Defer data fetch to avoid deadlock - use setTimeout(0)
          setTimeout(() => {
            if (mounted) {
              fetchUserData(newSession.user.id);
              setIsLoading(false);
            }
          }, 0);
        } else {
          // Clear all data on logout
          setProfile(null);
          setUserRoleData(null);
          setAppRole(null);
          fetchedUserIdRef.current = null;
          clearCachedSession();
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session (only if not cached)
    if (!cachedSession) {
      supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
        if (!mounted) return;
        
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        setCachedSession(existingSession?.user ?? null, existingSession);
        
        if (existingSession?.user) {
          await fetchUserData(existingSession.user.id);
        }
        
        setIsLoading(false);
      });
    } else {
      // Use cached session, but validate in background
      supabase.auth.getSession().then(({ data: { session: validSession } }) => {
        if (!mounted) return;
        
        if (validSession?.user) {
          fetchUserData(validSession.user.id);
        } else if (!validSession && cachedSession) {
          // Cache was stale, clear it
          setUser(null);
          setSession(null);
          clearCachedSession();
        }
      });
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [cachedSession, fetchUserData]);

  // Memoized login function
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
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
  }, []);

  // Memoized signup function
  const signup = useCallback(async (
    email: string, 
    password: string, 
    name: string, 
    role: AppRole, 
    schoolCode: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // SECURITY: Block admin signup via public form
      if (role === 'admin') {
        return { 
          success: false, 
          error: 'Admin accounts cannot be created through this form. Contact a super administrator.' 
        };
      }

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

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            role: role,
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
  }, []);

  // Memoized logout function
  const logout = useCallback(async () => {
    clearCachedSession();
    fetchedUserIdRef.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRoleData(null);
    setAppRole(null);
  }, []);

  // Memoized resetPassword function
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
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
  }, []);

  // Memoized updatePassword function
  const updatePassword = useCallback(async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
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
  }, []);

  // CRITICAL: Memoize context value to prevent re-renders
  const contextValue = useMemo(() => ({
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
  }), [
    user, 
    session, 
    profile, 
    appRole, 
    userRoleData, 
    isLoading, 
    login, 
    signup, 
    logout, 
    refreshProfile, 
    resetPassword, 
    updatePassword
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
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
